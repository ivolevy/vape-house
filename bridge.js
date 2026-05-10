import { eventHandler, setResponseHeaders, setResponseStatus } from 'h3';

let serverInstance = null;

export default eventHandler(async (event) => {
  const url = new URL(event.node.req.url, `http://${event.node.req.headers.host}`);
  
  // Ignorar assets
  if (url.pathname.startsWith('/assets/') || url.pathname.includes('.')) {
    return;
  }

  try {
    // Cargar el servidor solo una vez
    if (!serverInstance) {
      const { default: server } = await import('./dist/server/server.js');
      serverInstance = server;
    }
    
    // Construir headers del request
    const headers = new Headers();
    for (const [key, value] of Object.entries(event.node.req.headers)) {
      if (value) headers.append(key, Array.isArray(value) ? value.join(',') : value);
    }

    const webReq = new Request(url.href, {
      method: event.node.req.method,
      headers: headers,
      body: ['GET', 'HEAD'].includes(event.node.req.method) ? undefined : event.node.req
    });

    const response = await serverInstance.fetch(webReq);
    
    // Pasar los headers de la respuesta a Nitro
    const responseHeaders = {};
    response.headers.forEach((v, k) => {
      responseHeaders[k] = v;
    });
    setResponseHeaders(event, responseHeaders);
    setResponseStatus(event, response.status);

    // Devolver el cuerpo como texto o stream
    const body = await response.text();
    return body;
  } catch (err) {
    console.error('[Bridge Error]:', err);
    return `Server Error: ${err.message}`;
  }
});
