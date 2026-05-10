import { eventHandler, readRawBody } from 'h3'
import server from './dist/server/server.js'

export default eventHandler(async (event) => {
  try {
    // Usamos directamente los objetos de Node para máxima compatibilidad
    const nodeReq = event.node.req
    const headers = nodeReq.headers
    const method = nodeReq.method || 'GET'
    
    // Construcción de URL manual desde Node
    const protocol = headers['x-forwarded-proto'] || 'https'
    const host = headers['host'] || 'vape-house.vercel.app'
    const fullUrl = new URL(event.path || '/', `${protocol}://${host}`).href
    
    let body = null
    if (method !== 'GET' && method !== 'HEAD') {
      // Intentamos leer el body con h3, si falla, seguimos sin body
      body = await readRawBody(event, false).catch(() => null)
    }

    const request = new Request(fullUrl, {
      method,
      headers: headers, // Los headers de Node son compatibles con Request
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
