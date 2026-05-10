import { eventHandler, toWebRequest } from 'h3';

export default eventHandler(async (event) => {
  const url = new URL(event.node.req.url, `http://${event.node.req.headers.host}`);
  
  // Si es un asset, dejar que Nitro lo maneje solo
  if (url.pathname.startsWith('/assets/') || url.pathname.includes('.')) {
    return;
  }

  console.log('[Bridge] Request:', url.pathname);

  try {
    const { handler } = await import('./.vercel/output/functions/index.func/index.mjs');
    
    // Construir un Request manual para evitar fallos de h3.toWebRequest
    const headers = new Headers();
    for (const [key, value] of Object.entries(event.node.req.headers)) {
      if (value) headers.append(key, Array.isArray(value) ? value.join(',') : value);
    }

    const webReq = new Request(url.href, {
      method: event.node.req.method,
      headers: headers,
      body: ['GET', 'HEAD'].includes(event.node.req.method) ? undefined : event.node.req
    });

    const response = await handler(webReq);
    return response;
  } catch (err) {
    console.error('[Bridge] Error:', err);
    return new Response(`Server Error: ${err.message}`, { status: 500 });
  }
});
