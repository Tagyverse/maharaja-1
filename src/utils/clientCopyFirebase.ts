import { db } from '../lib/firebase';
import { ref, get, set, update, push } from 'firebase/database';

// Types for Client Copy System
export interface RebrandConfig {
  logo: string;
  favicon: string;
  colors: {
    primary: string;
    accent: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      heading: number;
      body: number;
    };
  };
  navigation: Array<{
    id: string;
    label: string;
    icon: string;
    visible: boolean;
  }>;
  termsAndConditions: string;
  visibleSections: string[];
  status: 'incomplete' | 'complete';
  lastUpdated: string;
}

export interface PaymentConfig {
  primaryGateway: 'razorpay' | 'stripe' | 'paypal';
  testMode: boolean;
  gateways: {
    razorpay?: {
      apiKey: string;
      apiSecret: string;
    };
    stripe?: {
      publishableKey: string;
      secretKey: string;
    };
    paypal?: {
      clientId: string;
      secretId: string;
    };
  };
  lastUpdated: string;
}

export interface WhatsAppConfig {
  businessNumber: string;
  prePaymentEnabled: boolean;
  postPaymentEnabled: boolean;
  messageTemplate: string;
  lastUpdated: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabledEvents: string[];
  lastUpdated: string;
}

export interface OrderData {
  orderId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  cartTotal: number;
  paymentMethod: 'razorpay' | 'stripe' | 'paypal';
  paymentStatus: 'pending' | 'success' | 'failed';
  paymentId: string;
  orderStatus: 'placed' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

// Encryption utilities for sensitive data
export const encryptData = (data: string): string => {
  // TODO: Implement proper encryption (use a library like tweetnacl)
  return btoa(data); // Basic base64 for now, replace with real encryption
};

export const decryptData = (encrypted: string): string => {
  // TODO: Implement proper decryption
  return atob(encrypted); // Basic base64 for now
};

// Rebrand Config Functions
export const getRebrandConfig = async (clientId: string): Promise<RebrandConfig | null> => {
  try {
    const snapshot = await get(ref(db, `clients/${clientId}/rebrand`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error fetching rebrand config:', error);
    return null;
  }
};

export const saveRebrandConfig = async (clientId: string, config: Partial<RebrandConfig>): Promise<void> => {
  try {
    const updatedConfig = {
      ...config,
      lastUpdated: new Date().toISOString(),
    };
    await set(ref(db, `clients/${clientId}/rebrand`), updatedConfig);
  } catch (error) {
    console.error('Error saving rebrand config:', error);
    throw error;
  }
};

// Payment Config Functions
export const getPaymentConfig = async (clientId: string): Promise<PaymentConfig | null> => {
  try {
    const snapshot = await get(ref(db, `clients/${clientId}/payments`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Decrypt sensitive fields
      if (data.gateways?.razorpay?.apiSecret) {
        data.gateways.razorpay.apiSecret = decryptData(data.gateways.razorpay.apiSecret);
      }
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching payment config:', error);
    return null;
  }
};

export const savePaymentConfig = async (clientId: string, config: Partial<PaymentConfig>): Promise<void> => {
  try {
    const updatedConfig = {
      ...config,
      lastUpdated: new Date().toISOString(),
    };
    
    // Encrypt sensitive fields
    if (updatedConfig.gateways?.razorpay?.apiSecret) {
      updatedConfig.gateways.razorpay.apiSecret = encryptData(updatedConfig.gateways.razorpay.apiSecret);
    }
    
    await set(ref(db, `clients/${clientId}/payments`), updatedConfig);
  } catch (error) {
    console.error('Error saving payment config:', error);
    throw error;
  }
};

// WhatsApp Config Functions
export const getWhatsAppConfig = async (clientId: string): Promise<WhatsAppConfig | null> => {
  try {
    const snapshot = await get(ref(db, `clients/${clientId}/notifications/whatsapp`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error fetching WhatsApp config:', error);
    return null;
  }
};

export const saveWhatsAppConfig = async (clientId: string, config: Partial<WhatsAppConfig>): Promise<void> => {
  try {
    const updatedConfig = {
      ...config,
      lastUpdated: new Date().toISOString(),
    };
    await set(ref(db, `clients/${clientId}/notifications/whatsapp`), updatedConfig);
  } catch (error) {
    console.error('Error saving WhatsApp config:', error);
    throw error;
  }
};

// Telegram Config Functions
export const getTelegramConfig = async (clientId: string): Promise<TelegramConfig | null> => {
  try {
    const snapshot = await get(ref(db, `clients/${clientId}/notifications/telegram`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Decrypt bot token
      if (data.botToken) {
        data.botToken = decryptData(data.botToken);
      }
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Telegram config:', error);
    return null;
  }
};

export const saveTelegramConfig = async (clientId: string, config: Partial<TelegramConfig>): Promise<void> => {
  try {
    const updatedConfig = {
      ...config,
      lastUpdated: new Date().toISOString(),
    };
    
    // Encrypt bot token
    if (updatedConfig.botToken) {
      updatedConfig.botToken = encryptData(updatedConfig.botToken);
    }
    
    await set(ref(db, `clients/${clientId}/notifications/telegram`), updatedConfig);
  } catch (error) {
    console.error('Error saving Telegram config:', error);
    throw error;
  }
};

// Order Functions
export const createOrder = async (clientId: string, order: Omit<OrderData, 'orderId'>): Promise<string> => {
  try {
    const orderId = `ORD-${Date.now()}`;
    const orderWithId: OrderData = {
      ...order,
      orderId,
    };
    await set(ref(db, `clients/${clientId}/orders/${orderId}`), orderWithId);
    return orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrder = async (clientId: string, orderId: string): Promise<OrderData | null> => {
  try {
    const snapshot = await get(ref(db, `clients/${clientId}/orders/${orderId}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
};

export const updateOrderStatus = async (clientId: string, orderId: string, status: OrderData['orderStatus']): Promise<void> => {
  try {
    await update(ref(db, `clients/${clientId}/orders/${orderId}`), {
      orderStatus: status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const listClientOrders = async (clientId: string): Promise<OrderData[]> => {
  try {
    const snapshot = await get(ref(db, `clients/${clientId}/orders`));
    if (snapshot.exists()) {
      const orders = snapshot.val();
      return Object.values(orders) as OrderData[];
    }
    return [];
  } catch (error) {
    console.error('Error listing orders:', error);
    return [];
  }
};

// R2/Cloudflare Publishing
export const publishToR2 = async (clientId: string, configData: any): Promise<string> => {
  try {
    const response = await fetch('/api/publish-client-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        data: configData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to publish: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Save R2 URL to Firebase
    await update(ref(db, `clients/${clientId}/publishConfig`), {
      lastPublished: new Date().toISOString(),
      r2Url: result.url,
    });

    return result.url;
  } catch (error) {
    console.error('Error publishing to R2:', error);
    throw error;
  }
};

// Download config as JSON
export const downloadConfigAsJSON = async (clientId: string): Promise<void> => {
  try {
    const rebrand = await getRebrandConfig(clientId);
    const payments = await getPaymentConfig(clientId);
    const whatsapp = await getWhatsAppConfig(clientId);
    const telegram = await getTelegramConfig(clientId);

    const config = {
      rebrand,
      payments,
      notifications: {
        whatsapp,
        telegram,
      },
      downloadedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `client-${clientId}-config-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading config:', error);
    throw error;
  }
};
