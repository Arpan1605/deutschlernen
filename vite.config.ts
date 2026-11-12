import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// The app ships as one self-contained HTML file so it can be published as a
// Claude artifact (or dropped on any static host).
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { target: "es2020", assetsInlineLimit: 100000000, chunkSizeWarningLimit: 5000 },
});
