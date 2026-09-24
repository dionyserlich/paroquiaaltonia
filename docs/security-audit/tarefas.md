# Tarefas de correção — auditoria de segurança

Derivadas do relatório em `relatorio-auditoria-seguranca.pdf`. Ordem pensada
para reduzir exposição real primeiro, não para agrupar por arquivo.

> **Este arquivo descreve como explorar uma falha que ainda está aberta.** O
> repositório é público. Ver a seção "Antes de publicar qualquer coisa" no fim.

**Estado:** todas concluídas e commitadas em 24/09/2026 — **ainda não publicadas**.

| | Tarefa | Achado | Estado | Commit |
|---|---|---|---|---|
| T0 | Conter o vazamento de nomes | F-01 | ✅ feito | `6e911a7` |
| T1 | Fechar a exposição das fotos de vela | F-01 | ✅ feito | `6e911a7` |
| T2 | Sanitizar o conteúdo litúrgico | F-02 | ✅ feito | `8ab5427` |
| T3 | Proteger a rota de explicação da IA | F-03 | ✅ feito | `0f2d1a0` |
| T4 | Exigir sessão no broadcast de push | F-04 | ✅ feito | `f72a2e5` |
| T5 | Endurecimento (JSON-LD, histórico, segredos) | F-05, F-06, F-07 | ✅ feito | `7908041`, `5451ddd` |

O alcance real do F-01, medido na hora de corrigir: das 14 velas já acesas, 4
têm foto e 9 marcaram nomePrivado. Das 4 com foto, **duas marcaram
nomePrivado** — essas duas pessoas tiveram o nome publicado contra a própria
escolha. Nenhuma foto chegou a ser exposta contra a escolha de quem enviou
(uma única vela marcou fotoPrivada, e ela não tem imagem). A primeira versão
do relatório superestimava esse ponto.

---

## T0 — Conter o vazamento de nomes (agora)

Mitigação imediata enquanto T1 não sai. Sozinha ela já derruba a parte mais
grave: hoje o nome de quem acendeu a vela está no `alt` de documentos
públicos. Tirando o nome, sobra uma foto sem identificação — bem menos sério.

**Passos**

1. Trocar o texto alternativo nos dois pontos que o geram:
   - `app/api/velas/route.ts:86` — `data: { alt: \`Foto da vela de ${nome}\` }`
   - `app/api/velas/[id]/editar/route.ts:54` — idem
   - Para algo sem identificação, ex.: `alt: "Foto enviada com uma vela"`.
2. Corrigir os seis documentos já gravados: ids **10, 11, 12, 15, 16, 17**.
   Pode ser pelo painel (`/cms`, collection Media) ou por rota temporária com
   a Local API, como já foi feito nas tarefas de conteúdo.

**Como verificar**

```sh
curl -s "https://www.paroquiaaltonia.com.br/payload-api/media?limit=50" \
  | grep -c "Foto da vela de"   # precisa devolver 0
```

**Critérios de aceite**

- [ ] Nenhum documento de `media` guarda nome de pessoa no campo `alt`
- [ ] Os seis documentos existentes foram corrigidos
- [ ] Uma vela nova, acesa com foto, não grava o nome no `alt`

---

## T1 — Fechar a exposição das fotos de vela (F-01)

T0 tira o nome; T1 tira a foto de quem pediu sigilo. Aqui há uma **decisão de
design a tomar antes de codar**, porque as saídas óbvias quebram outra coisa.

**Por que não é só fechar `media`**

`collections/Media.ts:5-7` tem `read: () => true`. Trocar para exigir
`req.user` fecharia o vazamento, mas derrubaria **todas** as imagens públicas
do site — capas de notícia, banners, cartazes — porque o Payload aplica o
mesmo `read` ao endpoint de arquivo. Não serve.

**Caminho recomendado: marcar o documento e filtrar na leitura**

O `read` do Payload pode devolver um `Where` em vez de booleano, e ele vira
filtro da consulta. Então:

1. Adicionar um campo `privado` (checkbox, default `false`) em
   `collections/Media.ts`.
2. Ao criar a foto da vela, propagar a flag:
   - `app/api/velas/route.ts:84-88` → `data: { alt: "...", privado: fotoPrivada }`
   - `app/api/velas/[id]/editar/route.ts:52-57` → idem
3. Trocar o access control de `media` por algo como:
   ```ts
   read: ({ req }) => (req.user ? true : { privado: { not_equals: true } }),
   ```
4. Sincronizar quando a pessoa muda a flag depois de acesa: a rota de edição
   (`app/api/velas/[id]/editar/route.ts:62-73`) altera `fotoPrivada` sem tocar
   no documento de mídia — precisa atualizar os dois juntos.
5. Rodar o push de schema (subir o `next dev`, que aplica a coluna nova) e
   marcar `privado` nos documentos já existentes que pertencem a velas
   privadas.

**Verificar antes de dar por pronto:** se o endpoint de arquivo
(`/payload-api/media/file/<nome>`) respeita o `read` do documento. Se não
respeitar, a URL direta continua aberta e será preciso servir as fotos
privadas por uma rota própria que confira o `ownershipToken`.

**Critérios de aceite**

- [ ] `GET /payload-api/media` sem autenticação não devolve nenhuma foto de vela privada
- [ ] `GET /payload-api/media/file/<arquivo-privado>` sem autenticação não entrega o arquivo
- [ ] Vela **sem** `fotoPrivada` continua aparecendo normalmente em `/api/velas/publicas`
- [ ] Marcar/desmarcar `fotoPrivada` na edição reflete no documento de mídia
- [ ] Imagens de notícia, banner e evento seguem públicas

---

## T2 — Sanitizar o conteúdo litúrgico (F-02)

Onze pontos de `app/(frontend)/liturgia/liturgia-content.tsx` injetam HTML
vindo de `liturgia.up.railway.app` sem escapar nada. A defesa já existe no
projeto e só não foi ligada aqui.

**Passos**

1. Importar `sanitizeRichText` de `lib/sanitize.ts` em `liturgia-content.tsx`.
2. Envolver a chamada nos onze pontos — linhas **220, 230, 250, 280, 298, 322,
   346, 369, 377, 385, 395**. O mais limpo é fazer isso dentro de
   `formatarTextoComSobrescrito` (linha 105), que já é o ponto único por onde
   todo esse texto passa:
   ```ts
   const formatarTextoComSobrescrito = (texto: string) =>
     sanitizeRichText(/* ... a transformação de sobrescrito ... */)
   ```
3. Considerar uma allowlist mais estreita que a de rich text: o texto
   litúrgico só precisa de negrito, itálico e quebra de linha.

**Alternativa mais forte:** sanitizar no servidor, em
`app/(frontend)/liturgia/page.tsx:27`, logo depois do `fetch`. Assim nem o
HTML inicial carrega conteúdo não confiável. Exige uma versão da função que
rode fora do navegador (o DOMPurify atual depende de `window`).

**Critérios de aceite**

- [ ] Os onze pontos passam por sanitização
- [ ] Uma resposta forjada da API com `<img src=x onerror=...>` não executa script
- [ ] Os números continuam aparecendo em sobrescrito, como hoje
- [ ] Existe teste cobrindo HTML malicioso vindo da API externa

---

## T3 — Proteger a rota de explicação da IA (F-03)

`app/api/liturgia/explicacao/route.ts` aceita POST anônimo e repassa texto
livre do cliente para a Groq com a chave da paróquia. As outras duas rotas
públicas de escrita já têm a defesa pronta — é replicar.

**Passos**

1. Aplicar o mesmo limite por IP usado em `app/api/velas/route.ts:36-50`
   (tabela de rate limit no schema `bot`, contabilizando antes de validar).
2. Validar tamanho e tipo de `tipo`, `referencia`, `titulo` e `texto`
   (linha 22), rejeitando com 400 fora do limite.
3. Corrigir o `catch`: `tipo.toLowerCase()` na linha 107 estoura se `tipo` não
   for string, transformando o fallback num 500.
4. Idealmente, deixar de aceitar texto livre: receber só a referência
   litúrgica e montar o texto no servidor a partir da liturgia do dia.

**Critérios de aceite**

- [ ] Acima do limite por IP a rota devolve 429
- [ ] Payload fora do tamanho máximo devolve 400
- [ ] `tipo` não string não derruba a rota com 500
- [ ] Requisição anônima em volume não consome a cota da Groq

---

## T4 — Exigir sessão no broadcast de push (F-04)

`app/actions.ts` é `"use server"`: cada função exportada é um endpoint. A
`sendNotificationToAll` (linha 103) envia push com título, corpo e URL
arbitrários para todos, e o arquivo não tem nenhuma verificação de sessão.

**Passos**

1. Extrair o corpo atual para uma função **não exportada**, ex.
   `dispararParaTodos(...)`.
2. Manter `sendNotificationToAll` exportada como a versão que verifica:
   ```ts
   const payload = await payloadClient()
   const { user } = await payload.auth({ headers: await headers() })
   if (!user) return { success: false, error: "não autorizado" }
   ```
3. Trocar as chamadas internas sem sessão para a função interna:
   - `app/lib/live-mass-bot.ts:299-301`
   - `collections/Avisos.ts:57-58`, `collections/Eventos.ts:22-24`,
     `collections/Missas.ts:45-47`, `collections/Noticias.ts:30-32`
   - `app/api/cron/check-velas-expiradas/route.ts:43-52` (usa a variante `ToOne`)
4. Revisar `unsubscribe` (linha 93) pelo mesmo critério: hoje remove qualquer
   inscrição por endpoint, sem prova de posse.

**Critérios de aceite**

- [ ] `sendNotificationToAll` recusa execução sem sessão do CMS
- [ ] Cron, bot e hooks das collections seguem notificando normalmente
- [ ] Nenhuma função exportada de `app/actions.ts` faz operação privilegiada sem verificar autorização

---

## T5 — Endurecimento (F-05, F-06, F-07)

Três correções pequenas e independentes.

**F-06 — escapar o JSON-LD.** Uma linha em `components/json-ld.tsx:6`:

```ts
__html: JSON.stringify(data).replace(/</g, "\\u003c")
```

**F-05 — histórico de notificações.** `app/api/notificacoes/route.ts:13-14`
confia no `deviceId` da query. Mínimo aceitável: parar de colocar o nome no
corpo da notificação de vela apagada quando `nomePrivado` estiver marcado —
`app/api/cron/check-velas-expiradas/route.ts:45` já faz isso, basta manter a
coerência. Ideal: assinar o `deviceId` (HMAC) na primeira gravação e exigir a
assinatura na leitura.

**F-07 — validação de segredos.** Remover o `|| ""` de
`payload.config.ts:70` e validar na inicialização, com mensagem clara.
Estender a `CRON_SECRET`, `VAPID_PRIVATE_KEY` e `DATABASE_URL`.

**Critérios de aceite**

- [ ] Valor de CMS com sequência de fechamento de script não quebra o JSON-LD
- [ ] Notificação de vela apagada não inclui nome quando `nomePrivado` está marcado
- [ ] A aplicação recusa iniciar sem `PAYLOAD_SECRET`, com mensagem clara
- [ ] Não há mais fallback silencioso para string vazia em segredo

---

## Antes de publicar qualquer coisa

O repositório `dionyserlich/paroquiaaltonia` é **público** e tem issues
abertas ao mundo. Três consequências práticas:

1. **Não commitar o PDF nem este arquivo enquanto T0 e T1 não estiverem
   prontos.** Os nomes reais já foram redigidos do relatório e da fonte, mas
   os dois ainda trazem o passo a passo de uma falha aberta. Estão no
   `.gitignore` desta pasta por isso — é só remover as duas linhas depois de
   corrigir.
2. **Se abrir issues no GitHub, use a versão curta**, sem requisição de
   exemplo, sem nome de pessoa e sem caminho de endpoint vulnerável. Sugestão
   de títulos e corpos abaixo.
3. **F-01 merece aviso aos envolvidos**, e não só correção técnica: as fotos e
   os nomes estiveram publicamente acessíveis por tempo indeterminado. São
   seis registros, de quatro pessoas.

### Versão curta para issues públicas

```
[Segurança] Fotos enviadas em velas não respeitam a marcação de privacidade
Labels: security, severity:critica
Corpo: A collection de mídia não aplica a mesma regra de privacidade que a
listagem de velas. Detalhe técnico e passos no relatório interno. Ver T0 e T1.

[Segurança] Sanitizar conteúdo de API externa antes de renderizar
Labels: security, severity:alta
Corpo: A página de liturgia injeta HTML de terceiro sem passar pela
sanitização que já existe no projeto. Ver T2.

[Segurança] Limitar uso da rota de explicação da IA
Labels: security, severity:alta
Corpo: A rota não tem limite por IP nem validação de tamanho, ao contrário
das demais rotas públicas. Ver T3.

[Segurança] Verificar autorização na action de envio de notificações
Labels: security, severity:media
Corpo: Operação privilegiada exposta sem verificação de sessão própria. Ver T4.

[Segurança] Endurecimento: JSON-LD, histórico de notificações e validação de segredos
Labels: security, severity:baixa
Corpo: Três ajustes pequenos de robustez. Ver T5.
```
