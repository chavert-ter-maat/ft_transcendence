import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
  server: {
    host: true,
    port: Number(process.env.FRONTEND_PORT) || 5173,
    allowedHosts: true,
    proxy: {
      "/socket.io": {
        target: "http://backend:3000",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
