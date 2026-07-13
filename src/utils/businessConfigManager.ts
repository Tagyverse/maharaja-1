import { db } from '../lib/firebase';
import { ref, get, set, update } from 'firebase/database';
import type { BusinessConfig, OrderChannel } from '../types';

// Fetch business config from Firebase
export async function fetchBusinessConfig(businessId: string = 'default'): Promise<BusinessConfig | null> {
  try {
    const configRef = ref(db, `business_config/${businessId}`);
    const snapshot = await get(configRef);
    if (snapshot.exists()) {
      return {
        id: businessId,
        ...snapshot.val()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching business config:', error);
    throw error;
  }
}

// Save business config to Firebase (preserves existing data - does partial update)
export async function saveBusinessConfig(businessId: string = 'default', config: Partial<BusinessConfig>): Promise<void> {
  try {
    const configRef = ref(db, `business_config/${businessId}`);
    
    // First, fetch existing config to merge with new data
    const snapshot = await get(configRef);
    const existingData = snapshot.exists() ? snapshot.val() : getDefaultBusinessConfig();
    
    // Merge existing data with new config (new data overwrites)
    const mergedData = {
      ...existingData,
      ...config,
      updated_at: new Date().toISOString(),
      id: businessId
    };
    
    // Use set() to save the complete merged data
    await set(configRef, mergedData);
  } catch (error) {
    console.error('Error saving business config:', error);
    throw error;
  }
}

// Update specific business config fields
export async function updateBusinessConfig(businessId: string = 'default', updates: Partial<BusinessConfig>): Promise<void> {
  try {
    const configRef = ref(db, `business_config/${businessId}`);
    const data = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    await update(configRef, data);
  } catch (error) {
    console.error('Error updating business config:', error);
    throw error;
  }
}

// Fetch order channel config
export async function fetchOrderChannel(channelType: 'whatsapp' | 'telegram'): Promise<OrderChannel | null> {
  try {
    const channelRef = ref(db, `integrations/${channelType}`);
    const snapshot = await get(channelRef);
    if (snapshot.exists()) {
      return {
        type: channelType,
        ...snapshot.val()
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${channelType} channel config:`, error);
    throw error;
  }
}

// Save order channel config (preserves existing data - does partial update)
export async function saveOrderChannel(channelType: 'whatsapp' | 'telegram', config: Partial<OrderChannel>): Promise<void> {
  try {
    const channelRef = ref(db, `integrations/${channelType}`);
    
    // First, fetch existing config to merge with new data
    const snapshot = await get(channelRef);
    const existingData = snapshot.exists() ? snapshot.val() : getDefaultOrderChannel(channelType);
    
    // Merge existing data with new config (new data overwrites)
    const mergedData = {
      ...existingData,
      type: channelType,
      ...config,
      updated_at: new Date().toISOString(),
      enabled: config.enabled !== undefined ? config.enabled : (existingData.enabled || false)
    };
    
    // Use set() to save the complete merged data
    await set(channelRef, mergedData);
  } catch (error) {
    console.error(`Error saving ${channelType} channel config:`, error);
    throw error;
  }
}

// Test channel connectivity
export async function testChannelConnection(channelType: 'whatsapp' | 'telegram', config: OrderChannel): Promise<boolean> {
  try {
    // For WhatsApp: validate phone number format
    if (channelType === 'whatsapp') {
      if (!config.phone_number || !config.api_key) {
        return false;
      }
      // Basic validation: phone number should be 10+ digits
      const phoneDigits = config.phone_number.replace(/\D/g, '');
      return phoneDigits.length >= 10;
    }

    // For Telegram: validate bot token format
    if (channelType === 'telegram') {
      if (!config.bot_token || !config.chat_id) {
        return false;
      }
      // Basic validation: Telegram bot token format is number:string
      return config.bot_token.includes(':') && config.bot_token.split(':')[0].match(/^\d+$/);
    }

    return false;
  } catch (error) {
    console.error(`Error testing ${channelType} connection:`, error);
    return false;
  }
}

// Get default business config template
export function getDefaultBusinessConfig(): BusinessConfig {
  return {
    company_name: 'My Company',
    logo_url: '',
    tagline: 'Quality Products & Services',
    legal_business_name: '',
    primary_contact_email: '',
    primary_contact_phone: '',
    business_address: '',
    business_city: '',
    business_state: '',
    business_country: '',
    business_zip: '',
    primary_color: '#06b6d4', // cyan
    secondary_color: '#0f172a', // slate-900
    accent_color: '#06b6d4',
    terms_of_service: 'Our terms of service will be displayed here.',
    return_policy: 'Our return policy will be displayed here.',
    warranty_information: 'Our warranty information will be displayed here.',
    custom_policies: {},
    seo_meta_title: 'My Company',
    seo_meta_description: 'Welcome to our store',
    seo_og_image: '',
    seo_keywords: ['products', 'shop'],
    theme_font_family: 'system-ui',
    theme_dark_mode_enabled: true,
    theme_color_scheme: 'auto',
    theme_button_style: 'rounded',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    updated_by: 'system'
  };
}

// Get default order channel template
export function getDefaultOrderChannel(type: 'whatsapp' | 'telegram'): OrderChannel {
  const baseConfig: OrderChannel = {
    type,
    enabled: false,
    message_templates: {
      order_confirmation: 'Your order has been confirmed. Order ID: {order_id}',
      order_processing: 'Your order is being processed.',
      order_completed: 'Your order has been completed!',
      order_cancelled: 'Your order has been cancelled.'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (type === 'whatsapp') {
    return {
      ...baseConfig,
      phone_number: '',
      api_key: ''
    };
  } else {
    return {
      ...baseConfig,
      bot_token: '',
      chat_id: ''
    };
  }
}
