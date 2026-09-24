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
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || "",
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
