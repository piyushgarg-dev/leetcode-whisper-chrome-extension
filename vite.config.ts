import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";
import path from "path";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "localhost", // Ensure it's accessible on localhost
    port: 5173,        // Ensure this matches the URL you're accessing
    hmr: {
      protocol: "ws",  // Use WebSocket for HMR
      host: "localhost",
      port: 5173,      // Ensure this matches the server port
    },
  },
});
