import { useState, useCallback, useEffect } from 'react';
import { RebrandData } from '../types/rebrandData';
import { r2DataService } from '../services/r2DataService';

interface UseR2DataReturn {
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  siteData: any | null;
  products: any[] | null;
  clientBranding: RebrandData | null;
  lastSyncTime: string | null;

  loadSiteData: () => Promise<void>;
  loadProducts: () => Promise<void>;
  loadClientBranding: (clientId: string) => Promise<void>;
  saveBranding: (brandData: RebrandData) => Promise<boolean>;
  saveClientData: (clientId: string, data: any) => Promise<boolean>;
  downloadBranding: (brandData: RebrandData) => void;
  clearError: () => void;
}

export function useR2Data(): UseR2DataReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<any | null>(null);
  const [products, setProducts] = useState<any[] | null>(null);
  const [clientBranding, setClientBranding] = useState<RebrandData | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const loadSiteData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await r2DataService.loadSiteDataFromR2();
      setSiteData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load site data';
      setError(message);
      console.error('[useR2Data] Error loading site data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await r2DataService.loadProductsFromR2();
      setProducts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load products';
      setError(message);
      console.error('[useR2Data] Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadClientBranding = useCallback(async (clientId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await r2DataService.loadClientBrandingFromR2(clientId);
      setClientBranding(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load client branding';
      setError(message);
      console.error('[useR2Data] Error loading client branding:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveBranding = useCallback(async (brandData: RebrandData): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await r2DataService.saveBrandingToR2(brandData);
      if (response.success) {
        setClientBranding(response.data || brandData);
        setLastSyncTime(new Date().toISOString());
        return true;
      } else {
        setError(response.error || 'Failed to save branding');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save branding';
      setError(message);
      console.error('[useR2Data] Error saving branding:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const saveClientData = useCallback(async (clientId: string, data: any): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await r2DataService.saveClientDataToR2(clientId, data);
      if (response.success) {
        setLastSyncTime(new Date().toISOString());
        return true;
      } else {
        setError(response.error || 'Failed to save client data');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save client data';
      setError(message);
      console.error('[useR2Data] Error saving client data:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const downloadBranding = useCallback((brandData: RebrandData) => {
    try {
      r2DataService.downloadBrandingAsJSON(brandData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download branding';
      setError(message);
      console.error('[useR2Data] Error downloading branding:', err);
    }
  }, []);

  return {
    isLoading,
    isSaving,
    error,
    siteData,
    products,
    clientBranding,
    lastSyncTime,
    loadSiteData,
    loadProducts,
    loadClientBranding,
    saveBranding,
    saveClientData,
    downloadBranding,
    clearError,
  };
}
