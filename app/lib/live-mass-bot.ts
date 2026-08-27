import { query } from "@/app/lib/db"
import { findActiveMassWindow, type MassSlot } from "@/app/lib/mass-schedule"
import { fetchLiveVideo } from "@/app/lib/youtube-live-scraper"
import { payloadClient } from "@/app/lib/payload"

// Busca o horário semanal no Global do Payload (fonte única — também usada
// por /horarios) em vez da constante fixa. Cai no fallback hardcoded só se o
// Global vier vazio por algum motivo.
async function loadSchedule(): Promise<MassSlot[]> {
  try {
    const payload = await payloadClient()
    const global = await payload.findGlobal({ slug: "mass-schedule" })
    const horarios = (global.horarios || []) as { diaSemana: string; hora: number; minuto: number; label?: string | null }[]
    if (horarios.length === 0) throw new Error("Global mass-schedule vazio")
    return horarios.map((h) => ({
      day: Number(h.diaSemana) as MassSlot["day"],
      hour: h.hora,
      minute: h.minuto,
      label: h.label || `Missa ${h.diaSemana} ${h.hora}h${h.minuto}`,
    }))
  } catch (err) {
    console.error("[live-mass-bot] falha ao buscar mass-schedule do Payload, usando fallback:", err)
    const { MASS_SCHEDULE } = await import("@/app/lib/mass-schedule")
    return MASS_SCHEDULE
  }
}

export type RunResult = {
  ranAt: string
  inWindow: boolean
  status: "live_found" | "no_live" | "out_of_window" | "error"
  videoId?: string | null
  videoTitle?: string | null
  message?: string | null
}

export async function runLiveMassCheck(trigger: "cron" | "manual"): Promise<RunResult> {
  const now = new Date()
  const schedule = await loadSchedule()
  const win = findActiveMassWindow(now, schedule)

  if (!win.inWindow) {
    await clearExpiredLive(now)
    const result: RunResult = {
      ranAt: now.toISOString(),
      inWindow: false,
      status: "out_of_window",
      message: win.nextSlot
        ? `Próxima janela: ${win.nextSlot.label} em ${win.nextStartsAt?.toISOString()}`
        : null,
    }
    await logRun(trigger, result)
    return result
  }

  try {
    const live = await fetchLiveVideo()
    if (live) {
      // Só cria um registro permanente em `missas` na primeira detecção deste
      // vídeo (não a cada tick de 5 min enquanto a mesma live continuar) —
      // compara com o que já está salvo como "ao vivo agora".
      const { rows: atuais } = await query<{ linkEmbed: string | null }>(
        `SELECT link_embed AS "linkEmbed" FROM bot.missa_ao_vivo WHERE id = 1`
      )
      const jaRegistrada = atuais[0]?.linkEmbed === live.embedUrl
      if (!jaRegistrada && win.startsAt && win.endsAt) {
        try {
          const payload = await payloadClient()
          await payload.create({
            collection: "missas",
            data: { titulo: live.title, inicio: win.startsAt.toISOString(), fim: win.endsAt.toISOString(), linkEmbed: live.embedUrl },
          })
        } catch (err) {
          console.error("[live-mass-bot] falha ao criar registro em missas:", err)
        }
      }

      await query(
        `INSERT INTO bot.missa_ao_vivo (id, titulo, inicio, fim, link_embed, updated_at)
         VALUES (1, $1, $2, $3, $4, NOW())
         ON CONFLICT (id) DO UPDATE
           SET titulo=EXCLUDED.titulo, inicio=EXCLUDED.inicio, fim=EXCLUDED.fim,
               link_embed=EXCLUDED.link_embed, updated_at=NOW()`,
        [live.title, win.startsAt, win.endsAt, live.embedUrl]
      )
      const result: RunResult = {
        ranAt: now.toISOString(),
        inWindow: true,
        status: "live_found",
        videoId: live.videoId,
        videoTitle: live.title,
        message: `Vídeo ao vivo detectado: ${live.title}`,
      }
      await logRun(trigger, result)
      return result
    }
    await clearExpiredLive(now)
    const result: RunResult = {
      ranAt: now.toISOString(),
      inWindow: true,
      status: "no_live",
      message: "Janela de missa, mas nenhum vídeo ao vivo encontrado",
    }
    await logRun(trigger, result)
    return result
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const result: RunResult = {
      ranAt: now.toISOString(),
      inWindow: true,
      status: "error",
      message,
    }
    await logRun(trigger, result)
    return result
  }
}

async function clearExpiredLive(now: Date) {
  await query(
    `UPDATE bot.missa_ao_vivo
     SET link_embed = NULL, updated_at = NOW()
     WHERE id = 1 AND (fim IS NULL OR fim < $1)`,
    [now]
  )
}

async function logRun(trigger: string, r: RunResult) {
  try {
    await query(
      `INSERT INTO bot.live_check_log (trigger, in_window, status, video_id, video_title, message)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [trigger, r.inWindow, r.status, r.videoId ?? null, r.videoTitle ?? null, r.message ?? null]
    )
  } catch (err) {
    console.error("Falha ao gravar live_check_log:", err)
  }
}

export async function getCurrentLiveMass() {
  const { rows } = await query<{
    titulo: string | null
    inicio: string | null
    fim: string | null
    linkEmbed: string | null
    updatedAt: string | null
  }>(
    `SELECT titulo, inicio, fim, link_embed AS "linkEmbed", updated_at AS "updatedAt"
     FROM bot.missa_ao_vivo WHERE id = 1`
  )
  const row = rows[0]
  if (!row || !row.linkEmbed) return null
  const now = new Date()
  if (row.fim && new Date(row.fim) < now) return null
  return row
}

export async function getRecentLogs(limit = 20) {
  const { rows } = await query(
    `SELECT id, ran_at AS "ranAt", trigger, in_window AS "inWindow",
            status, video_id AS "videoId", video_title AS "videoTitle", message
     FROM bot.live_check_log ORDER BY ran_at DESC LIMIT $1`,
    [limit]
  )
  return rows
}
