import path from "path"
import { fileURLToPath } from "url"
import { buildConfig } from "payload"
import { postgresAdapter } from "@payloadcms/db-postgres"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
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
    importMap: {
      baseDir: path.resolve(dirname, "app/(payload)/cms"),
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
  editor: lexicalEditor(),
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
