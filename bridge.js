import { eventHandler } from 'h3';

let serverInstance = null;
process.env.NODE_ENV = 'production';

export default eventHandler(async (event) => {
  const { req, res } = event.node;
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  
  // Ignorar assets y favicon
  if (url.pathname.startsWith('/assets/') || url.pathname === '/favicon.ico') {
    return;
  }

  try {
    if (!serverInstance) {
      // Usar el alias definido en nitro.config.ts
      const { default: server } = await import('@dist/server.js');
      serverInstance = server;
    }
    
    if (!serverInstance || typeof serverInstance.fetch !== 'function') {
      throw new Error('Server instance not found or invalid');
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
    
    res.statusCode = response.status;
    response.headers.forEach((v, k) => {
      res.setHeader(k, v);
    });

    const body = await response.text();
    res.end(body);
  } catch (err) {
    console.error('[Bridge Error]:', err);
    res.statusCode = 500;
    res.end(`Server Error: ${err.message}`);
  }
});
