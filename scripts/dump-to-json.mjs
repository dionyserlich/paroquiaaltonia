import fs from 'fs/promises';
import path from 'path';
import pkg from 'pg';
const { Pool } = pkg;
const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  await fs.mkdir('data', { recursive: true });

  const missas = (await pool.query(`SELECT id, titulo, inicio, fim, link_embed AS "linkEmbed", descricao FROM missas ORDER BY id`)).rows;
  await fs.writeFile('data/missas.json', JSON.stringify(missas, null, 2));

  const noticias = (await pool.query(`SELECT id, titulo, resumo, conteudo, imagem, data FROM noticias ORDER BY id`)).rows;
  await fs.writeFile('data/ultimasNoticias.json', JSON.stringify(noticias, null, 2));

  const eventos = (await pool.query(`SELECT id, titulo, dia, mes, ano, hora, descricao, conteudo FROM eventos ORDER BY id`)).rows;
  await fs.writeFile('data/proximosEventos.json', JSON.stringify(eventos, null, 2));

  const banners = (await pool.query(`SELECT id, titulo, imagem, link FROM banners ORDER BY ordem, id`)).rows;
  await fs.writeFile('data/banners.json', JSON.stringify(banners, null, 2));

  const aoVivo = (await pool.query(`SELECT id, titulo, inicio, fim, link_embed AS "linkEmbed" FROM missa_ao_vivo WHERE id=1`)).rows[0];
  if (aoVivo) await fs.writeFile('data/missaAoVivo.json', JSON.stringify(aoVivo, null, 2));

  console.log('dumped', { missas: missas.length, noticias: noticias.length, eventos: eventos.length, banners: banners.length });
  await pool.end();
}
main();
