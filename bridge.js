import { eventHandler, readRawBody } from 'h3'
import server from './dist/server/server.js'

export default eventHandler(async (event) => {
  if (event.path.startsWith('/assets/')) {
    return
  }

  try {
    const nodeReq = event.node.req
    const headers = nodeReq.headers
    const method = nodeReq.method || 'GET'
    
    const protocol = headers['x-forwarded-proto'] || 'https'
    const host = headers['host'] || 'vape-house.vercel.app'
    const fullUrl = new URL(event.path || '/', `${protocol}://${host}`).href
    
    let body = null
    if (method !== 'GET' && method !== 'HEAD') {
      body = await readRawBody(event, false).catch(() => null)
    }

    const request = new Request(fullUrl, {
      method,
      headers: headers,
      body,
      duplex: body ? 'half' : undefined
    })

    // Forzamos la visibilidad de las variables de entorno para el servidor de TanStack
    const env = {
      ...process.env,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
    }

    return await server.fetch(request, env, {})
  } catch (error) {
    console.error('Error in bridge:', error)
    return new Response(`Error en el servidor:\n${error.message}\n${error.stack}`, {
      status: 500,
      headers: { 'content-type': 'text/plain' }
    })
  }
})
