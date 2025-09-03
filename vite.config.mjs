import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Assicurati che NON ci sia `root: 'src'` o simili.
  build: {
    outDir: 'dist',   // <— importantissimo
    emptyOutDir: true
  }
})
