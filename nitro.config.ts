import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  preset: 'vercel',
  srcDir: '.',
  // Especificamos dónde están los archivos estáticos generados por Vite
  publicAssets: [
    {
      dir: './dist/client',
      maxAge: 31536000 // 1 año de caché para assets
    }
  ],
  handlers: [
    {
      route: '/**',
      handler: './bridge.js'
    }
  ],
  // Reglas de ruta para asegurar que los assets no pasen por el bridge
  routeRules: {
    '/assets/**': { static: true },
    '/_server/**': { cors: true }
  }
})
