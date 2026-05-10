import { eventHandler } from 'h3';

let serverInstance = null;

export default eventHandler(async (event) => {
  const { req, res } = event.node;
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Ignorar assets
  if (url.pathname.startsWith('/assets/') || url.pathname.includes('.')) {
    return;
  }

  try {
    if (!serverInstance) {
      const { default: server } = await import('./dist/server/server.js');
      serverInstance = server;
    }
    
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.append(key, Array.isArray(value) ? value.join(',') : value);
    }

    const webReq = new Request(url.href, {
      method: req.method,
      headers: headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req
    });

    const response = await serverInstance.fetch(webReq);
    
    // Usar métodos nativos de Node.js para las cabeceras y el estado
    res.statusCode = response.status;
    response.headers.forEach((v, k) => {
      res.setHeader(k, v);
    });

    const body = await response.text();
    res.end(body);
  } catch (err) {
    console.error('[Bridge Error]:', err);
    res.statusCode = 500;
    res.end(`Server Error: ${err.message}\n${err.stack}`);
  }
});
