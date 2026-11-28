import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"

export default defineConfig({
  base: "./",
  plugins: [solidPlugin()],
  define: {
    'process.env': {}
  },
  server: {
    port: 3040,
    host: true
  }
})
