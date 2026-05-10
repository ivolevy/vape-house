import { eventHandler, toWebRequest } from 'h3'
import server from './dist/server/server.js'

export default eventHandler(async (event) => {
  const request = toWebRequest(event)
  // Llamamos al método fetch del servidor de TanStack
  return server.fetch(request, {}, {})
})
