import { defineNitroConfig } from "nitropack/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineNitroConfig({
  preset: "vercel",
  alias: {
    "@": path.resolve(__dirname, "./src"),
    "@integrations": path.resolve(__dirname, "./src/integrations")
  },
  // Dejamos que TanStack Start maneje los handlers automáticamente
  // Eliminamos el bridge manual que causaba errores de h3
  publicAssets: [
    {
      dir: "dist/client",
      maxAge: 31536000
    }
  ],
  routeRules: {
    "/assets/**": { static: true }
  }
});
