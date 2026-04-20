import fs from 'fs/promises';
import path from 'path';
import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function readJson(p) { try { return JSON.parse(await fs.readFile(path.join(process.cwd(), p), 'utf8')); } catch { return null; } }

const missas = await readJson('data/missas.json') || [];
const noticias = (await readJson('data/ultimasNoticias.json') || []).filter(n => ![1,2,3].includes(n.id));
const eventos = await readJson('data/proximosEventos.json') || [];
const banners = await readJson('data/banners.json') || [];
const aoVivo = await readJson('data/missaAoVivo.json');
const subs = await readJson('data/subscriptions.json') || [];

const c = await pool.connect();
try {
  await c.query('BEGIN');
  await c.query('TRUNCATE missas, noticias, eventos, banners, missa_ao_vivo, push_subscriptions RESTART IDENTITY');
  for (const m of missas) {
    await c.query('INSERT INTO missas (id, titulo, inicio, fim, link_embed, descricao) VALUES ($1,$2,$3,$4,$5,$6)',
      [m.id, m.titulo, m.inicio, m.fim, m.linkEmbed, m.descricao || null]);
  }
  if (missas.length) await c.query("SELECT setval('missas_id_seq', (SELECT MAX(id) FROM missas))");
  for (const n of noticias) {
    await c.query('INSERT INTO noticias (id, titulo, resumo, conteudo, imagem, data) VALUES ($1,$2,$3,$4,$5,$6)',
      [n.id, n.titulo, n.resumo, n.conteudo, n.imagem || null, n.data]);
  }
  if (noticias.length) await c.query("SELECT setval('noticias_id_seq', (SELECT MAX(id) FROM noticias))");
  for (const e of eventos) {
    await c.query('INSERT INTO eventos (id, titulo, dia, mes, ano, hora, descricao, conteudo) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [e.id, e.titulo, String(e.dia), String(e.mes), String(e.ano), String(e.hora), e.descricao || null, e.conteudo || null]);
  }
  if (eventos.length) await c.query("SELECT setval('eventos_id_seq', (SELECT MAX(id) FROM eventos))");
  for (let i = 0; i < banners.length; i++) {
    const b = banners[i];
    await c.query('INSERT INTO banners (id, titulo, imagem, link, ordem) VALUES ($1,$2,$3,$4,$5)',
      [b.id, b.titulo, b.imagem, b.link, i]);
  }
  if (banners.length) await c.query("SELECT setval('banners_id_seq', (SELECT MAX(id) FROM banners))");
  if (aoVivo) {
    await c.query('INSERT INTO missa_ao_vivo (id, titulo, inicio, fim, link_embed) VALUES (1,$1,$2,$3,$4)',
      [aoVivo.titulo, aoVivo.inicio, aoVivo.fim, aoVivo.linkEmbed]);
  }
  for (const s of subs) {
    if (!s?.endpoint || !s?.keys?.p256dh || !s?.keys?.auth) continue;
    await c.query('INSERT INTO push_subscriptions (endpoint, p256dh, auth) VALUES ($1,$2,$3) ON CONFLICT (endpoint) DO NOTHING',
      [s.endpoint, s.keys.p256dh, s.keys.auth]);
  }
  await c.query('COMMIT');
} catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }

const counts = await pool.query(`
  SELECT 'missas' k, count(*) FROM missas UNION ALL
  SELECT 'noticias', count(*) FROM noticias UNION ALL
  SELECT 'eventos', count(*) FROM eventos UNION ALL
  SELECT 'banners', count(*) FROM banners UNION ALL
  SELECT 'missa_ao_vivo', count(*) FROM missa_ao_vivo UNION ALL
  SELECT 'push_subscriptions', count(*) FROM push_subscriptions
`);
console.log(counts.rows);
await pool.end();
