import { eventHandler, getRequestHeaders, readRawBody } from 'h3'
import server from './dist/server/server.js'

export default eventHandler(async (event) => {
  try {
    const headers = getRequestHeaders(event)
    
    // Construcción manual de la URL para evitar el error "Invalid URL"
    const protocol = headers['x-forwarded-proto'] || 'https'
    const host = headers['host'] || 'vape-house.vercel.app'
    const fullUrl = new URL(event.path || '/', `${protocol}://${host}`).href
    
    const method = event.method
    
    let body = null
    if (method !== 'GET' && method !== 'HEAD') {
      body = await readRawBody(event, false).catch(() => null)
    }

    const request = new Request(fullUrl, {
      method,
      headers,
      body,
      duplex: body ? 'half' : undefined
    })

    return await server.fetch(request, process.env, {})
  } catch (error) {
    console.error('Error in bridge:', error)
    return new Response(`Error en el servidor:\n${error.message}\n${error.stack}`, {
      status: 500,
      headers: { 'content-type': 'text/plain' }
    })
  }
})
