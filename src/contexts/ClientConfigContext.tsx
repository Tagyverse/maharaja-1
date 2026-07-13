import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type OrderFlowMode = 'whatsapp-only' | 'telegram-only' | 'payment';

export interface PublishedConfig {
  // Branding
  logo: string;
  favicon: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  
  // Order Flow
  orderFlowMode: OrderFlowMode;
  
  // Infrastructure
  firebaseConfig: {
    apiKey: string;
    projectId: string;
    messagingSenderId: string;
    appId: string;
  };
  cloudflareConfig: {
    accountId: string;
    bucketName: string;
    accessKeyId: string;
    accessKeySecret: string;
  };
  
  // Integrations
  whatsapp?: {
    enabled: boolean;
    businessNumber: string;
    requireBeforeCheckout: boolean;
  };
  telegram?: {
    enabled: boolean;
    botToken: string;
    chatId: string;
  };
  payment?: {
    enabled: boolean;
    gateway: 'razorpay' | 'stripe' | 'paypal';
    testMode: boolean;
    credentials: Record<string, string>;
  };
  
  // Content
  termsAndConditions: string;
  sections: {
    hero: boolean;
    products: boolean;
    reviews: boolean;
    newsletter: boolean;
    footer: boolean;
  };
  
  // Published metadata
  publishedAt: string;
  publishUrl: string;
}

interface ClientConfigContextType {
  config: PublishedConfig | null;
  loading: boolean;
  setConfig: (config: PublishedConfig) => void;
  loadConfigFromR2: (url: string) => Promise<void>;
  applyTheme: (config: PublishedConfig) => void;
}

const ClientConfigContext = createContext<ClientConfigContextType | undefined>(undefined);

export function ClientConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PublishedConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const loadConfigFromR2 = useCallback(async (url: string) => {
    setLoading(true);
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
        applyTheme(data);
        console.log('[v0] Loaded config from R2:', data);
      }
    } catch (error) {
      console.error('[v0] Failed to load config from R2:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyTheme = useCallback((cfg: PublishedConfig) => {
    // Apply CSS variables for theming
    const root = document.documentElement;
    root.style.setProperty('--primary-color', cfg.primaryColor);
    root.style.setProperty('--accent-color', cfg.accentColor);
    root.style.setProperty('--font-family', cfg.fontFamily);
    
    // Update favicon
    if (cfg.favicon) {
      const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (link) link.href = cfg.favicon;
    }
    
    // Update logo in header
    const logoImg = document.querySelector('[data-logo]') as HTMLImageElement;
    if (logoImg && cfg.logo) {
      logoImg.src = cfg.logo;
    }
    
    console.log('[v0] Applied theme:', { primaryColor: cfg.primaryColor, accentColor: cfg.accentColor });
  }, []);

  return (
    <ClientConfigContext.Provider
      value={{
        config,
        loading,
        setConfig,
        loadConfigFromR2,
        applyTheme,
      }}
    >
      {children}
    </ClientConfigContext.Provider>
  );
}

export function useClientConfig() {
  const context = useContext(ClientConfigContext);
  if (!context) {
    throw new Error('useClientConfig must be used within ClientConfigProvider');
  }
  return context;
}
