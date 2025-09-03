import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // alias comodi
      '@': path.resolve(process.cwd(), 'src'),
      components: path.resolve(process.cwd(), 'src/components'),
      pages: path.resolve(process.cwd(), 'src/pages'),
      assets: path.resolve(process.cwd(), 'src/assets')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
