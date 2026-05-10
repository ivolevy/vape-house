import { defineNitroConfig } from "nitropack/config";
import path from "path";

export default defineNitroConfig({
  preset: "vercel",
  alias: {
    "@": path.resolve(__dirname, "./src"),
    "@integrations": path.resolve(__dirname, "./src/integrations")
  },
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
