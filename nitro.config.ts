import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  preset: "vercel",
  // Quitamos srcDir para que Nitro no intente compilar los archivos de React
  handlers: [
    {
      route: "/**",
      handler: "./bridge.js"
    }
  ],
  publicAssets: [
    {
      dir: "dist/client",
      maxAge: 31536000
    }
  ],
  routeRules: {
    "/assets/**": { static: true },
    "/_server/**": { proxy: "/**" }
  },
  output: {
    dir: ".vercel/output",
    serverDir: ".vercel/output/functions/index.func",
    publicDir: ".vercel/output/static"
  }
});
