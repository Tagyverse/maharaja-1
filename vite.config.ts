import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function apiDevFallback() {
  return {
    name: 'api-dev-fallback',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url?.startsWith('/api/')) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'API not available in dev mode', fallback: true }));
          return;
        }
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [apiDevFallback(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/database', 'firebase/storage'],
          // Admin pages separate
          'admin-chunk': ['./src/pages/Admin.tsx'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
  },
  optimizeDeps: {
    exclude: ['lucide-react', '@mediapipe/face_mesh', '@mediapipe/camera_utils'],
    include: ['react', 'react-dom'],
  },
});
