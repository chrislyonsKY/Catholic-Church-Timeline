import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  base: isGitHubPages ? "/Catholic-Church-Timeline/" : "/",
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
