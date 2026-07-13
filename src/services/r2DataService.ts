import { RebrandData } from '../types/rebrandData';
import { brand } from '../config/brand';

// R2 Configuration
const R2_BUCKET_URL = brand.cloudflare?.r2BucketUrl || '';
const R2_BUCKET_NAME = brand.cloudflare?.r2BucketName || '';

interface R2Response {
  success: boolean;
  data?: any;
  error?: string;
}

// Local storage fallback
const STORAGE_KEY_PREFIX = 'rebrand_';
const STORAGE_KEY_DATA = `${STORAGE_KEY_PREFIX}data`;
const STORAGE_KEY_CLIENTS = `${STORAGE_KEY_PREFIX}clients`;

class R2DataService {
  /**
   * Load existing site data from R2 bucket
   */
  async loadProductsFromR2(): Promise<any[]> {
    try {
      if (!R2_BUCKET_URL) {
        console.warn('[R2] No R2 bucket URL configured');
        return [];
      }

      const response = await fetch(`${R2_BUCKET_URL}/products.json`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('[R2] Failed to load products:', error);
      return [];
    }
  }

  /**
   * Load complete site configuration from R2
   */
  async loadSiteDataFromR2(): Promise<any> {
    try {
      if (!R2_BUCKET_URL) {
        console.warn('[R2] No R2 bucket URL configured');
        return null;
      }

      const response = await fetch(`${R2_BUCKET_URL}/site-config.json`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('[R2] Failed to load site data:', error);
      return null;
    }
  }

  /**
   * Load a specific client's branding from R2
   */
  async loadClientBrandingFromR2(clientId: string): Promise<RebrandData | null> {
    try {
      if (!R2_BUCKET_URL) {
        // Fallback to local storage
        return this.loadClientBrandingFromStorage(clientId);
      }

      const response = await fetch(`${R2_BUCKET_URL}/clients/${clientId}/branding.json`);
      if (response.ok) {
        return await response.json();
      }

      // Fallback to local storage if R2 fails
      return this.loadClientBrandingFromStorage(clientId);
    } catch (error) {
      console.error('[R2] Failed to load client branding:', error);
      return this.loadClientBrandingFromStorage(clientId);
    }
  }

  /**
   * Save complete rebrand configuration to R2
   */
  async saveBrandingToR2(brandData: RebrandData): Promise<R2Response> {
    try {
      if (!R2_BUCKET_URL) {
        // Fallback to local storage
        this.saveClientBrandingToStorage(brandData);
        return { success: true };
      }

      // Prepare data for R2
      const payload = {
        ...brandData,
        r2Saved: true,
        r2SyncedAt: new Date().toISOString(),
      };

      // Save to R2 via API endpoint
      const response = await fetch('/api/r2/save-branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: brandData.clientId,
          data: payload,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save to R2');
      }

      // Also save to local storage as backup
      this.saveClientBrandingToStorage(payload);

      return { success: true, data: payload };
    } catch (error) {
      console.error('[R2] Failed to save branding:', error);
      // Fallback to local storage
      this.saveClientBrandingToStorage(brandData);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Save client-specific data to R2
   */
  async saveClientDataToR2(clientId: string, data: any): Promise<R2Response> {
    try {
      const response = await fetch('/api/r2/save-client-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, data }),
      });

      if (!response.ok) {
        throw new Error('Failed to save client data');
      }

      return { success: true, data: await response.json() };
    } catch (error) {
      console.error('[R2] Failed to save client data:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Export branding data as JSON for download
   */
  exportBrandingAsJSON(brandData: RebrandData): string {
    return JSON.stringify(brandData, null, 2);
  }

  /**
   * Generate downloadable blob from branding data
   */
  generateDownloadBlob(brandData: RebrandData): Blob {
    const json = this.exportBrandingAsJSON(brandData);
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * Trigger download of branding JSON
   */
  downloadBrandingAsJSON(brandData: RebrandData): void {
    const blob = this.generateDownloadBlob(brandData);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${brandData.clientId}-branding-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Local storage fallback methods
   */
  private saveClientBrandingToStorage(brandData: RebrandData): void {
    try {
      const clients = this.getClientsFromStorage();
      const clientIndex = clients.findIndex(c => c.clientId === brandData.clientId);

      if (clientIndex >= 0) {
        clients[clientIndex] = brandData;
      } else {
        clients.push(brandData);
      }

      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
    } catch (error) {
      console.error('[Storage] Failed to save branding:', error);
    }
  }

  private loadClientBrandingFromStorage(clientId: string): RebrandData | null {
    try {
      const clients = this.getClientsFromStorage();
      return clients.find(c => c.clientId === clientId) || null;
    } catch (error) {
      console.error('[Storage] Failed to load branding:', error);
      return null;
    }
  }

  private getClientsFromStorage(): RebrandData[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_CLIENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Storage] Failed to parse clients:', error);
      return [];
    }
  }

  /**
   * Get all saved clients from local storage
   */
  getAllClientsFromStorage(): RebrandData[] {
    return this.getClientsFromStorage();
  }

  /**
   * Delete client branding from local storage
   */
  deleteClientFromStorage(clientId: string): void {
    try {
      const clients = this.getClientsFromStorage();
      const filtered = clients.filter(c => c.clientId !== clientId);
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(filtered));
    } catch (error) {
      console.error('[Storage] Failed to delete client:', error);
    }
  }
}

export const r2DataService = new R2DataService();
