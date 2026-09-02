import { query } from "@/app/lib/db"
import { findActiveMassWindow, type MassSlot } from "@/app/lib/mass-schedule"
import { fetchLiveVideo, type LiveVideo } from "@/app/lib/youtube-live-scraper"
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
    // Rede de segurança: se por algum motivo (falha da API, etc.) uma live
    // ainda estava sendo rastreada quando a janela toda se esgotou sem nunca
    // bater 2 ticks seguidos sem live (ver handleNoLiveInWindow), fecha o
    // registro mesmo assim em vez de deixar `fim` em branco pra sempre.
    await closeStaleTrackedMissa(now)
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
      await handleLiveFound(now, live)
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
    await handleNoLiveInWindow(now)
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

type BotState = {
  missaId: number | null
  linkEmbed: string | null
  lastConfirmedAt: string | null
  consecutiveNoLive: number
}

async function readBotState(): Promise<BotState | null> {
  const { rows } = await query<BotState>(
    `SELECT missa_id AS "missaId", link_embed AS "linkEmbed",
            last_confirmed_at AS "lastConfirmedAt", consecutive_no_live AS "consecutiveNoLive"
     FROM bot.missa_ao_vivo WHERE id = 1`
  )
  return rows[0] ?? null
}

async function clearTrackedLive() {
  await query(
    `UPDATE bot.missa_ao_vivo
     SET link_embed = NULL, missa_id = NULL, last_confirmed_at = NULL, consecutive_no_live = 0, updated_at = NOW()
     WHERE id = 1`
  )
}

// Fecha o registro em `missas` que estava aberto (fim em branco), usando o
// horário da última confirmação real de que a live ainda estava no ar — não
// o horário em que a ausência foi percebida, que já vem com atraso de até um
// tick do cron (5-10 min).
async function closeMissaRecord(missaId: number, fimIso: string) {
  try {
    const payload = await payloadClient()
    await payload.update({ collection: "missas", id: missaId, data: { fim: fimIso } })
  } catch (err) {
    console.error("[live-mass-bot] falha ao fechar registro em missas:", missaId, err)
  }
}

async function handleLiveFound(now: Date, live: LiveVideo) {
  const state = await readBotState()
  const linkMudou = state?.linkEmbed !== live.embedUrl

  if (!linkMudou) {
    // Mesma live continuando — só atualiza o "último ping confirmado" e zera
    // o contador de ausência (não cria um novo registro em `missas`).
    await query(
      `UPDATE bot.missa_ao_vivo SET last_confirmed_at = $1, consecutive_no_live = 0, updated_at = NOW() WHERE id = 1`,
      [now.toISOString()]
    )
    return
  }

  // Link mudou: ou é a primeira live desta janela, ou a anterior caiu e uma
  // nova começou — fecha o registro antigo (se houver) antes de abrir o novo.
  if (state?.missaId) {
    await closeMissaRecord(state.missaId, state.lastConfirmedAt ?? now.toISOString())
  }

  let novoId: number | null = null
  try {
    const payload = await payloadClient()
    // O afterChange de missas (collections/Missas.ts) dispara a notificação
    // push a partir deste create — não duplicar aqui. context.fromBot avisa
    // o hook pra notificar incondicionalmente (a API do YouTube já confirmou
    // que está ao vivo agora). `inicio` é o horário real de detecção, não o
    // horário agendado, e `fim` fica em branco de propósito enquanto a
    // transmissão continua — só é preenchido quando ela de fato terminar.
    const novoDoc = await payload.create({
      collection: "missas",
      data: { titulo: live.title, inicio: now.toISOString(), linkEmbed: live.embedUrl },
      context: { fromBot: true },
    })
    novoId = novoDoc.id as number
  } catch (err) {
    console.error("[live-mass-bot] falha ao criar registro em missas:", err)
  }

  await query(
    `INSERT INTO bot.missa_ao_vivo
       (id, titulo, inicio, fim, link_embed, missa_id, last_confirmed_at, consecutive_no_live, updated_at)
     VALUES (1, $1, $2, NULL, $3, $4, $2, 0, NOW())
     ON CONFLICT (id) DO UPDATE
       SET titulo = EXCLUDED.titulo, inicio = EXCLUDED.inicio, fim = NULL,
           link_embed = EXCLUDED.link_embed, missa_id = EXCLUDED.missa_id,
           last_confirmed_at = EXCLUDED.last_confirmed_at, consecutive_no_live = 0, updated_at = NOW()`,
    [live.title, now.toISOString(), live.embedUrl, novoId]
  )
}

// A API do YouTube pode falhar/oscilar por um tick sem que a transmissão
// tenha de fato terminado — só fecha o registro depois de 2 verificações
// seguidas sem live (~5-10 min de ausência confirmada), não já na primeira.
async function handleNoLiveInWindow(now: Date) {
  const state = await readBotState()
  if (!state?.missaId) return // nada sendo rastreado no momento

  const novoContador = (state.consecutiveNoLive ?? 0) + 1
  if (novoContador < 2) {
    await query(`UPDATE bot.missa_ao_vivo SET consecutive_no_live = $1, updated_at = NOW() WHERE id = 1`, [novoContador])
    return
  }

  await closeMissaRecord(state.missaId, state.lastConfirmedAt ?? now.toISOString())
  await clearTrackedLive()
}

// Rede de segurança pro caso raro de a janela toda se esgotar sem nunca
// bater 2 ticks seguidos sem live (ex.: falha prolongada da API do YouTube).
async function closeStaleTrackedMissa(now: Date) {
  const state = await readBotState()
  if (!state?.missaId) return
  await closeMissaRecord(state.missaId, state.lastConfirmedAt ?? now.toISOString())
  await clearTrackedLive()
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

// Cobre missas cadastradas manualmente pelo /cms com `inicio` no futuro
// (ex.: live já agendada no YouTube com antecedência) — o hook de
// collections/Missas.ts só notifica no cadastro se a missa já estiver
// dentro da janela "ao vivo" (inicio <= agora, e fim em branco ou >= agora);
// esta função, chamada a cada tick do cron (ver
// app/api/cron/check-live-mass/route.ts), cobre o caso contrário assim que a
// janela realmente começa. `fim` em branco conta como "ainda em aberto",
// mesmo critério usado no hook.
export async function notifyDueManualMissas() {
  const payload = await payloadClient()
  const nowIso = new Date().toISOString()
  const { docs } = await payload.find({
    collection: "missas",
    where: {
      and: [
        { notificado: { not_equals: true } },
        { inicio: { less_than_equal: nowIso } },
        { or: [{ fim: { greater_than_equal: nowIso } }, { fim: { exists: false } }] },
      ],
    },
    limit: 20,
  })

  for (const doc of docs) {
    try {
      const { sendNotificationToAll } = await import("@/app/actions")
      const { MISSA_AO_VIVO } = await import("@/app/lib/notification-options")
      await sendNotificationToAll("Missa ao vivo agora!", String(doc.titulo), "/", MISSA_AO_VIVO)
      await payload.update({ collection: "missas", id: doc.id, data: { notificado: true } })
    } catch (err) {
      console.error("[live-mass-bot] falha ao notificar missa agendada manualmente:", doc.id, err)
    }
  }
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
