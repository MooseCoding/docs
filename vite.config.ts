import { defineConfig } from 'vite'
import comptime from './comptime.js'

export default defineConfig({
  plugins: [comptime()],
})
