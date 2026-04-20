import fs from 'fs/promises';
import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('NEON_DATABASE_URL/DATABASE_URL not set');
  process.exit(1);
}
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const sql = await fs.readFile(new URL('./schema.sql', import.meta.url), 'utf8');
await pool.query(sql);
console.log('schema applied');
await pool.end();
