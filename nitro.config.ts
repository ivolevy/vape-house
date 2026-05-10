import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  preset: "vercel",
  srcDir: "src",
  handlers: [
    {
      route: "/**",
      handler: "./bridge.js"
    }
  ],
  publicAssets: [
    {
      dir: "../dist/client",
      maxAge: 31536000
    }
  ],
  routeRules: {
    "/assets/**": { static: true, headers: { "Content-Type": "application/javascript" } },
    "/_server/**": { proxy: "/**" }
  },
  output: {
    dir: ".vercel/output",
    serverDir: ".vercel/output/functions/index.func",
    publicDir: ".vercel/output/static"
  }
});
