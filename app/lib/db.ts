import { Pool, PoolConfig } from "pg"

const globalForPg = globalThis as unknown as { pgPool?: Pool }

const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
  max: 5,
}

export const pool: Pool =
  globalForPg.pgPool ?? new Pool(config)

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool
}

export async function query<T = any>(text: string, params?: any[]) {
  const res = await pool.query(text, params)
  return res as { rows: T[]; rowCount: number | null }
}
