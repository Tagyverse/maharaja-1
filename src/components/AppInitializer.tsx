import { useEffect } from 'react';
import { useClientConfig } from '../contexts/ClientConfigContext';

/**
 * AppInitializer loads the published client config from R2/Cloudflare
 * This runs once when the app starts and applies the theme globally
 */
export function AppInitializer() {
  const { loadConfigFromR2 } = useClientConfig();

  useEffect(() => {
    const initializeConfig = async () => {
      // Try to get the client ID from various sources
      const clientId = 
        new URLSearchParams(window.location.search).get('client') ||
        localStorage.getItem('client_id') ||
        'default';

      console.log('[v0] AppInitializer - loading config for client:', clientId);

      // Construct R2 URL based on client ID
      // This assumes published configs are at: https://r2-url/{clientId}/config.json
      const r2BaseUrl = process.env.REACT_APP_R2_BASE_URL || 'https://r2.example.com';
      const configUrl = `${r2BaseUrl}/${clientId}/config.json`;

      try {
        await loadConfigFromR2(configUrl);
      } catch (error) {
        console.log('[v0] Config not found or error loading:', error);
        // Continue with defaults if config doesn't exist yet
      }
    };

    initializeConfig();
  }, [loadConfigFromR2]);

  // This component doesn't render anything
  return null;
}
