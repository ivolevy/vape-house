import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    // ... existing plugins
    react(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ['xlsx'],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  }
});
