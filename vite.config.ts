import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const applicationRoot = fileURLToPath(new URL("./app", import.meta.url));
const buildDirectory = fileURLToPath(new URL("./dist", import.meta.url));

export default defineConfig({
  root: applicationRoot,
  plugins: [react(), tailwindcss()],
  build: {
    emptyOutDir: true,
    outDir: buildDirectory,
    sourcemap: false,
    target: "es2022",
  },
});
