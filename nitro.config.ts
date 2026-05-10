import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  preset: "vercel",
  compatibilityDate: "2024-04-03",
  handlers: [
    {
      route: "/**",
      handler: "./bridge.js",
    },
  ]
});
