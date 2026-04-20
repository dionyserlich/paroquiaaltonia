# Paróquia São Sebastião de Altônia

Site institucional da Paróquia São Sebastião de Altônia em Next.js 15 (App Router) + React 19 + TypeScript.

## Como rodar
- Gerenciador de pacotes: **pnpm**.
- Dev: workflow `Start application` (`pnpm run dev`) em `0.0.0.0:5000`.
- Build/start: `pnpm run build` / `pnpm run start`.

## Persistência
- **PostgreSQL (Replit-managed)** via `DATABASE_URL`.
- Cliente: `pg` (pool exportado em `app/lib/db.ts`).
- Tabelas:
  - `missas (id, titulo, inicio, fim, link_embed, descricao, created_at, updated_at)`
  - `noticias (id, titulo, resumo, conteudo, imagem, data, ...)`
  - `eventos (id, titulo, dia, mes, ano, hora, descricao, conteudo, ...)`
    - Datas armazenadas como strings (mês em português ou número) por compatibilidade com o admin existente.
  - `banners (id, titulo, imagem, link, ordem, ...)`
  - `missa_ao_vivo` (singleton, id=1) — atualmente sem UI ativa.
  - `push_subscriptions (id, endpoint UNIQUE, p256dh, auth, ...)` — usado por `app/actions.ts` para Web Push.
- O script `scripts/migrate.mjs` foi usado uma única vez para popular o banco a partir dos JSONs originais e pode ser descartado/arquivado.

## Endpoints principais
- Públicos: `/api/missas`, `/api/missas/[id]`, `/api/noticias`, `/api/noticias/[id]`, `/api/ultimas-noticias`, `/api/banners`, `/api/proximos-eventos`, `/api/proximos-eventos/[id]`, `/api/eventos-passados`.
- Admin (CRUD): `/api/admin/missas`, `/api/admin/missas/[id]`, `/api/admin/noticias`, `/api/admin/noticias/[id]`, `/api/admin/eventos`, `/api/admin/eventos/[id]`, `/api/admin/upload-image` (Vercel Blob), `/api/admin/login`, `/api/admin/logout`.
- Web push: `app/actions.ts` (subscribe/unsubscribe/sendNotificationToAll), `/api/check-updates` (poll que dispara push quando há mudanças nas tabelas).

## Imagens
- Upload via `/api/admin/upload-image` ainda usa **Vercel Blob** (`BLOB_READ_WRITE_TOKEN`). Fora de escopo desta migração.

## Segredos relevantes
- `DATABASE_URL` (já provisionado).
- `NEXT_PUBLIC_BASE_URL` (URL pública do site).
- Opcionais: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (push), `BLOB_READ_WRITE_TOKEN` (upload de imagens), `GROQ_API_KEY` (se features de IA forem habilitadas).
- `GITHUB_*` e `VERCEL_*` **não são mais necessários** (fluxo antigo removido).

## Mudanças recentes
- Migração de Vercel → Replit.
- Persistência migrada de "JSON commitado no GitHub" para Postgres real.
- Removidas telas/rotas admin obsoletas: `app/admin/configuracao`, `app/admin/diagnostico`, `app/admin/vercel-config`, `app/admin/vercel-status`, e seus respectivos `app/api/admin/*`. `app/utils/githubConfig.ts` removido.
- `components/deploy-status.tsx` e `components/vercel-deploy-status.tsx` foram convertidos em no-ops para preservar imports nas páginas admin.
