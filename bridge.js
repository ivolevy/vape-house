import { eventHandler, getRequestURL, getRequestHeaders, readRawBody } from 'h3'
import server from './dist/server/server.js'

export default eventHandler(async (event) => {
  try {
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
      duplex: body ? 'half' : undefined
    })

    // Pasamos process.env por si la app necesita variables de entorno
    return await server.fetch(request, process.env, {})
  } catch (error) {
    console.error('Error in bridge:', error)
    return new Response(`Error en el servidor:\n${error.message}\n${error.stack}`, {
      status: 500,
      headers: { 'content-type': 'text/plain' }
    })
  }
})
