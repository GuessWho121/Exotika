import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  envDir: "./server",
  plugins: [react()],
  server: {
    host: true,
    watch: {
      usePolling: true
    },
    proxy: {
      "/api": {
        target: "http://exotika-backend-dev:8080",
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
