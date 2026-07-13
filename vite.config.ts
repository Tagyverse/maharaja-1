import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In-memory storage for dev mode R2 simulation
const devStorage: Record<string, string> = {};

function apiDevFallback() {
  return {
    name: 'api-dev-fallback',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url?.startsWith('/api/get-published-data')) {
          // Return published data if it exists in dev storage
          const hasData = 'site-data.json' in devStorage;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          
          if (!hasData) {
            console.log('[DEV-API] No published data in dev storage');
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'No published data found', fallback: true }));
            return;
          }
          
          res.statusCode = 200;
          res.end(devStorage['site-data.json']);
          console.log('[DEV-API] Returned published data from dev storage');
          return;
        }
        
        if (req.url?.startsWith('/api/publish-data') && req.method === 'POST') {
          // Store published data in dev storage
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            
            try {
              const payload = JSON.parse(body);
              const { data } = payload;
              
              if (!data) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'No data provided' }));
                return;
              }
              
              // Add navigation settings if missing
              if (!data.navigation_settings || Object.keys(data.navigation_settings).length === 0) {
                data.navigation_settings = {
                  background: '#ffffff',
                  text: '#111827',
                  activeTab: '#14b8a6',
                  inactiveButton: '#f3f4f6',
                  borderRadius: 'full',
                  buttonSize: 'md',
                  themeMode: 'default',
                  buttonLabels: { home: 'Home', shop: 'Shop All', search: 'Search', cart: 'Cart', myOrders: 'My Orders', login: 'Login', signOut: 'Sign Out', admin: 'Admin' }
                };
              }
              
              // Store in dev storage
              const publishedData = { ...data, published_at: new Date().toISOString(), version: '1.0.0' };
              const jsonContent = JSON.stringify(publishedData);
              devStorage['site-data.json'] = jsonContent;
              
              const productCount = Object.keys(data.products || {}).length;
              const categoryCount = Object.keys(data.categories || {}).length;
              
              console.log(`[DEV-API] Published data stored: ${jsonContent.length} bytes, ${productCount} products, ${categoryCount} categories`);
              
              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                published_at: publishedData.published_at,
                size: jsonContent.length,
                productCount,
                categoryCount,
                message: 'Dev mode: Data stored locally (use production deploy for real R2 storage)'
              }));
            } catch (e) {
              console.error('[DEV-API] Publish error:', e);
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON or processing error' }));
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
