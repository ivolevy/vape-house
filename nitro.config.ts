import { defineNitroConfig } from "nitropack/config";

export default defineNitroConfig({
  preset: "vercel",
  srcDir: ".nitro-empty-dir",
  compatibilityDate: "2024-04-03",
  publicAssets: [
    {
      dir: "../dist/client",
      maxAge: 31536000,
    }
  ],
});
