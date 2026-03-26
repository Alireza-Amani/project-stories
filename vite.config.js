import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  base: "/project-stories/",
  server: {
    host: true,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        flashDenken: resolve(__dirname, "flash-denken.html"),
        hucPaper: resolve(__dirname, "huc-paper.html"),
        contact: resolve(__dirname, "contact.html"),
      },
    },
  },
});
