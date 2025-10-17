// vite.config.mjs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      components: path.resolve(process.cwd(), 'src/components'),
      pages: path.resolve(process.cwd(), 'src/pages'),
      assets: path.resolve(process.cwd(), 'src/assets'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1500, // alza la soglia (KB) per il warning
    rollupOptions: {
      output: {
        // split manuale dei chunk "grossi"
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          charts: ['recharts'],
          icons: ['lucide-react'],
        },
      },
    },
    // sourcemap: false, // (opzionale) lascia false in prod
  },
});
