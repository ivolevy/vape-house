import { eventHandler, getRequestURL, getRequestHeaders, readRawBody } from 'h3'
import server from './dist/server/server.js'

export default eventHandler(async (event) => {
  const url = getRequestURL(event)
  const headers = getRequestHeaders(event)
  const method = event.method
  
  let body = null
  if (method !== 'GET' && method !== 'HEAD') {
    body = await readRawBody(event, false).catch(() => null)
  }

  const request = new Request(url, {
    method,
    headers,
    body,
    // Importante para evitar errores en algunas versiones de Node
    duplex: body ? 'half' : undefined
  })

  return server.fetch(request, {}, {})
})
