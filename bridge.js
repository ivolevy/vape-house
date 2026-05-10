import { eventHandler } from 'h3';

export default eventHandler(async (event) => {
  const url = new URL(event.node.req.url, `http://${event.node.req.headers.host}`);
  
  // Ignorar assets y archivos con extensión
  if (url.pathname.startsWith('/assets/') || url.pathname.includes('.')) {
    return;
  }

  try {
    // Importamos el objeto default de server.js
    const { default: server } = await import('./dist/server/server.js');
    
    // Construir headers
    const headers = new Headers();
    for (const [key, value] of Object.entries(event.node.req.headers)) {
      if (value) headers.append(key, Array.isArray(value) ? value.join(',') : value);
    }

    const webReq = new Request(url.href, {
      method: event.node.req.method,
      headers: headers,
      body: ['GET', 'HEAD'].includes(event.node.req.method) ? undefined : event.node.req
    });

    // Llamamos al método fetch del servidor
    const response = await server.fetch(webReq);
    return response;
  } catch (err) {
    console.error('[Bridge Error]:', err);
    return new Response(`Server Error: ${err.message}`, { status: 500 });
  }
});
