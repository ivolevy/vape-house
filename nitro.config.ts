import { defineNitroConfig } from "nitropack/config";
import { resolve } from "node:path";

export default defineNitroConfig({
  preset: "vercel",
  compatibilityDate: "2024-04-03",
  handlers: [
    {
      route: "/**",
      handler: resolve(process.cwd(), "dist/server/index.js"),
    },
  ]
});
