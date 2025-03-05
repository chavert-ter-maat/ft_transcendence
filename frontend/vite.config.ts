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
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/socket.io": {
        target: "ws://localhost:4000",
        ws: true,
      },
    },
  },
});
