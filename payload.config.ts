import path from "path"
import { fileURLToPath } from "url"
import { buildConfig } from "payload"
import { postgresAdapter } from "@payloadcms/db-postgres"
import { lexicalEditor, EXPERIMENTAL_TableFeature } from "@payloadcms/richtext-lexical"
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob"
import sharp from "sharp"

import { Users } from "./collections/Users"
import { Media } from "./collections/Media"
import { Noticias } from "./collections/Noticias"
import { Eventos } from "./collections/Eventos"
import { Missas } from "./collections/Missas"
import { Banners } from "./collections/Banners"
import { Pastorais } from "./collections/Pastorais"
import { Capelas } from "./collections/Capelas"
import { Intencoes } from "./collections/Intencoes"
import { Velas } from "./collections/Velas"
import { Avisos } from "./collections/Avisos"
import { resendEmailAdapter } from "./app/lib/payload-email"
import { MassSchedule } from "./globals/MassSchedule"
import { Sobre } from "./globals/Sobre"
import { Dizimo } from "./globals/Dizimo"
import { Ofertas } from "./globals/Ofertas"
import { ContactInfo } from "./globals/ContactInfo"
import { Horarios } from "./globals/Horarios"

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Variáveis sem as quais o servidor não tem como funcionar: o Payload assina
// as sessões do painel com PAYLOAD_SECRET e conversa com o banco pela
// DATABASE_URL. O padrão antigo aqui era `process.env.X || ""`, que transforma
// variável ausente em valor vazio e deixa o processo subir mesmo assim.
//
// Hoje isso não é explorável: o próprio Payload recusa segredo falsy na
// inicialização ("missing secret key", ver payload/dist/index.js). Mas essa
// proteção é DELE, não nossa — uma versão futura que afrouxe a checagem
// transforma o fallback numa chave de assinatura previsível, com a qual
// qualquer pessoa forja o cookie de sessão do CMS. Melhor o servidor não subir
// do que subir com chave em branco.
//
// CRON_SECRET e VAPID_PRIVATE_KEY ficam fora desta lista de propósito: elas já
// são checadas no ponto de uso (app/api/cron/*/route.ts recusa a chamada com
// 500, app/actions.ts simplesmente não configura o push), porque faltar uma
// delas degrada um recurso isolado, enquanto as duas daqui derrubam o site
// inteiro.
const VARIAVEIS_OBRIGATORIAS = ["PAYLOAD_SECRET", "DATABASE_URL"] as const

// A checagem é pulada durante o `next build`, e esse é o detalhe delicado: o
// build importa este módulo pra montar as rotas do painel, então um throw aqui
// não falha na inicialização do Payload — falha na análise estática, e um
// build feito sem segredos (CI, imagem de container) nem compilaria, por um
// motivo que só importa na hora de executar. O Next define
// NEXT_PHASE=phase-production-build antes de compilar (ver
// next/dist/build/index.js), então em build a gente deixa passar e cobra no
// primeiro import de verdade — que é quando o Payload realmente inicializa.
if (process.env.NEXT_PHASE !== "phase-production-build") {
  const faltando = VARIAVEIS_OBRIGATORIAS.filter((nome) => !process.env[nome])
  if (faltando.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não configuradas: ${faltando.join(", ")}. ` +
        "Copie .env.example para .env.local e preencha os valores antes de subir o servidor."
    )
  }
}

export default buildConfig({
  admin: {
    user: Users.slug,
    // Raiz do projeto, e não app/(payload)/cms: os caminhos de componente
    // custom são declarados a partir da raiz (ver Missas.ts, que aponta
    // "/components/cms/verificar-transmissao"). Com o baseDir apontando para
    // dentro de app/(payload)/cms, o Payload regerava o importMap.js com
    // ".//components/cms/..." — um caminho que não existe — toda vez que o
    // dev subia, quebrando o campo no painel até alguém desfazer à mão.
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // /admin e /api já são usados pelo painel legado e pelas rotas públicas
  // deste app — namespacing dedicado evita colisão de rotas.
  routes: {
    admin: "/cms",
    api: "/payload-api",
  },
  graphQL: {
    disable: true,
  },
  // Sem isto o Payload só escreve os e-mails no console, e o
  // "Esqueci minha senha" do CMS não chega a ninguém.
  email: resendEmailAdapter,
  collections: [Users, Media, Noticias, Eventos, Missas, Banners, Pastorais, Capelas, Intencoes, Velas, Avisos],
  globals: [MassSchedule, Sobre, Dizimo, Ofertas, ContactInfo, Horarios],
  // Tabela não vem no conjunto padrão. Entrou por causa das tabelas de preço
  // das festas de comunidade, que em lista corrida viram uma parede de texto
  // — e serve para qualquer conteúdo com colunas daqui pra frente.
  //
  // O `EXPERIMENTAL_` é do Payload e se refere à edição no painel; o formato
  // salvo é o nó de tabela padrão do Lexical, e quem desenha no site são os
  // conversores próprios em components/conteudo-rico.tsx (os que vêm no
  // pacote embutem borda cinza inline, que destoa do tema escuro). Ou seja, o
  // risco fica na experiência de editar, não no que já está publicado.
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [...defaultFeatures, EXPERIMENTAL_TableFeature()],
  }),
  // Sem `|| ""`: a ausência é erro, não valor padrão. O `!` se sustenta na
  // validação do topo do arquivo — e no build, onde ela não roda, quem recusa
  // inicializar sem segredo é o próprio Payload.
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  sharp,
  plugins: [
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: { media: true },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
})
