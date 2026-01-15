import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    fs: {
      // Disable strict FS serving checks.
      // This is necessary because the project is located inside a '.git' directory,
      // which Vite normally blocks for security reasons.
      strict: false,
    },
  },
})
