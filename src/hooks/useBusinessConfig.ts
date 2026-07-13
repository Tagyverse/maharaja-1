import { useEffect, useState } from 'react';
import type { BusinessConfig } from '../types';
import { fetchBusinessConfig, getDefaultBusinessConfig } from '../utils/businessConfigManager';

interface UseBusinessConfigReturn {
  config: BusinessConfig | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useBusinessConfig(): UseBusinessConfigReturn {
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const businessConfig = await fetchBusinessConfig('default');
      
      if (businessConfig) {
        setConfig(businessConfig);
        console.log('[useBusinessConfig] Loaded business config:', businessConfig);
      } else {
        // Use default if not found
        const defaultConfig = getDefaultBusinessConfig();
        setConfig(defaultConfig);
        console.log('[useBusinessConfig] Using default config');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load business config');
      setError(error);
      console.error('[useBusinessConfig] Error loading config:', error);
      
      // Fallback to default on error
      setConfig(getDefaultBusinessConfig());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return { config, loading, error, refresh: loadConfig };
}
