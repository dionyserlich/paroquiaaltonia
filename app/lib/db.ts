import { Pool, PoolConfig } from "pg"

const globalForPg = globalThis as unknown as { pgPool?: Pool }

// Padronizado numa única variável — mesmo banco do Payload. As poucas tabelas
// que ainda passam por aqui direto (missa_ao_vivo, live_check_log,
// push_subscriptions) não são collections do Payload de propósito (estado
// interno de bot/push, não conteúdo editorial — ver payload.config.ts).
const connectionString = process.env.DATABASE_URL

const config: PoolConfig = {
  connectionString,
  ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
  max: 5,
}

// As tabelas deste pool vivem no schema "bot" (não "public", onde ficam as
// tabelas do Payload) — de propósito: a sincronização de schema do Payload em
// modo dev trata qualquer tabela desconhecida em "public" como candidata a
// ser apagada. Colocar num schema separado evita esse conflito mantendo tudo
// no mesmo banco. Referenciar sempre como `bot.<tabela>` nas queries — a
// conexão pooled da Neon (PgBouncer) não aceita `search_path` via startup
// parameter, então precisa ser explícito em vez de setar o search_path.

export const pool: Pool =
  globalForPg.pgPool ?? new Pool(config)

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool
}

export async function query<T = any>(text: string, params?: any[]) {
  const res = await pool.query(text, params)
  return res as { rows: T[]; rowCount: number | null }
}
