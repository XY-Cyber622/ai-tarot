import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    strictPort: true,
    open: false,
  },
  optimizeDeps: {
    // Pre-bundle heavy deps so the browser doesn't trigger a
    // "new dependencies optimized" page reload on first request.
    include: ['axios', 'react', 'react-dom', 'react-router-dom'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  // GitHub Pages 部署在 https://<user>.github.io/ai-tarot/ 子路径下，
  // 所以 base 必须是绝对路径 '/ai-tarot/'。本地 dev 仍可通过根路径访问。
  base: '/ai-tarot/',
});
