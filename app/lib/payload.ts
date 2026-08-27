import { getPayload } from "payload"
import config from "@payload-config"

export function payloadClient() {
  return getPayload({ config })
}
