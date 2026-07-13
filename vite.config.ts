import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function apiDevFallback() {
  return {
    name: 'api-dev-fallback',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url?.startsWith('/api/get-published-data')) {
          // Return empty published data fallback for dev mode
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.end(JSON.stringify({ error: 'No published data found', fallback: true }));
          return;
        }
        if (req.url?.startsWith('/api/publish-data') && req.method === 'POST') {
          // Accept publish requests in dev mode
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            try {
              const data = JSON.parse(body);
              const productCount = Object.keys(data.data?.products || {}).length;
              const categoryCount = Object.keys(data.data?.categories || {}).length;
              res.end(JSON.stringify({
                success: true,
                published_at: new Date().toISOString(),
                size: body.length,
                productCount,
                categoryCount,
                message: 'Dev mode: Data would be published to R2 on production'
              }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }
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
