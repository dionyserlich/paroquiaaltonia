import { getPayload } from 'payload'
import config from './payload.config'

async function main() {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'noticias', limit: 1 })
  console.log('OK, Local API funcionando. totalDocs:', result.totalDocs)
  process.exit(0)
}
main().catch((e) => { console.error('FAIL:', e); process.exit(1) })
