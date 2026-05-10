import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  preset: "vercel",
  compatibilityDate: "2024-04-03",
  handlers: [
    {
      route: "/**",
      handler: "./dist/server/index.js",
    },
  ],
  output: {
    dir: ".output",
    serverDir: ".output/server",
    publicDir: ".output/static"
  }
});
