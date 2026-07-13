import { BrandingPreset } from '@/types/branding';

export const brandingPresets: BrandingPreset[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean, contemporary design with bold colors and smooth interactions',
    category: 'modern',
    tags: ['contemporary', 'sleek', 'professional'],
    theme: {
      name: 'Modern',
      colors: {
        primary: '#0f172a',
        primaryLight: '#1e293b',
        primaryDark: '#0a0f1f',
        accent: '#3b82f6',
        themeColor: '#0f172a',
        background: '#ffffff',
        text: '#1f2937',
        border: '#e5e7eb',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      navigation_settings: {
        background: '#0f172a',
        text: '#ffffff',
        activeTab: '#3b82f6',
        inactiveButton: '#1e293b',
        borderRadius: 'md',
        buttonSize: 'md',
        themeMode: 'default',
        buttonLabels: {
          home: 'Home',
          shop: 'Shop All',
          search: 'Search',
          cart: 'Cart',
          myOrders: 'Orders',
          login: 'Login',
          signOut: 'Sign Out',
          admin: 'Admin'
        },
        sticky: true,
        shadow: 'md'
      },
      card_design: {
        style: 'modern',
        imagePosition: 'top',
        textAlignment: 'left',
        shadowEffect: 'lg',
        borderRadius: 'lg',
        borderStyle: 'none',
        hoverEffect: 'lift',
        backgroundColor: '#ffffff',
        textColor: '#1f2937'
      }
    }
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Timeless elegance with traditional color schemes and balanced spacing',
    category: 'classic',
    tags: ['traditional', 'elegant', 'timeless'],
    theme: {
      name: 'Classic',
      colors: {
        primary: '#7c2d12',
        primaryLight: '#fed7aa',
        primaryDark: '#431407',
        accent: '#dc2626',
        themeColor: '#7c2d12',
        background: '#fffbf0',
        text: '#78350f',
        border: '#fed7aa',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626'
      },
      navigation_settings: {
        background: '#7c2d12',
        text: '#fffbf0',
        activeTab: '#fed7aa',
        inactiveButton: '#a16207',
        borderRadius: 'md',
        buttonSize: 'md',
        themeMode: 'default',
        buttonLabels: {
          home: 'Home',
          shop: 'Shop All',
          search: 'Search',
          cart: 'Cart',
          myOrders: 'Orders',
          login: 'Login',
          signOut: 'Sign Out',
          admin: 'Admin'
        },
        sticky: false,
        shadow: 'sm'
      },
      card_design: {
        style: 'classic',
        imagePosition: 'top',
        textAlignment: 'center',
        shadowEffect: 'md',
        borderRadius: 'md',
        borderStyle: 'solid',
        borderColor: '#fed7aa',
        hoverEffect: 'glow',
        backgroundColor: '#fffbf0',
        textColor: '#78350f'
      }
    }
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Premium appearance with rich colors, gold accents, and sophisticated styling',
    category: 'luxury',
    tags: ['premium', 'elegant', 'upscale'],
    theme: {
      name: 'Luxury',
      colors: {
        primary: '#1f1f1f',
        primaryLight: '#3f3f3f',
        primaryDark: '#0a0a0a',
        accent: '#d4af37',
        themeColor: '#1f1f1f',
        background: '#f9f9f9',
        text: '#1a1a1a',
        border: '#d4af37',
        success: '#2d5016',
        warning: '#8b7500',
        error: '#8b0000'
      },
      navigation_settings: {
        background: '#1f1f1f',
        text: '#d4af37',
        activeTab: '#d4af37',
        inactiveButton: '#2f2f2f',
        borderRadius: 'sm',
        buttonSize: 'lg',
        themeMode: 'dark',
        buttonLabels: {
          home: 'Home',
          shop: 'Boutique',
          search: 'Search',
          cart: 'Bag',
          myOrders: 'My Collection',
          login: 'Sign In',
          signOut: 'Sign Out',
          admin: 'Admin'
        },
        sticky: true,
        shadow: 'lg'
      },
      card_design: {
        style: 'luxury',
        imagePosition: 'top',
        textAlignment: 'center',
        shadowEffect: 'lg',
        borderRadius: 'none',
        borderStyle: 'solid',
        borderColor: '#d4af37',
        hoverEffect: 'glow',
        backgroundColor: '#ffffff',
        textColor: '#1a1a1a'
      }
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Minimalist design with neutral tones and maximum whitespace',
    category: 'minimal',
    tags: ['simple', 'clean', 'zen'],
    theme: {
      name: 'Minimal',
      colors: {
        primary: '#404040',
        primaryLight: '#f5f5f5',
        primaryDark: '#212121',
        accent: '#666666',
        themeColor: '#404040',
        background: '#ffffff',
        text: '#262626',
        border: '#e0e0e0',
        success: '#757575',
        warning: '#9e9e9e',
        error: '#d32f2f'
      },
      navigation_settings: {
        background: '#ffffff',
        text: '#262626',
        activeTab: '#404040',
        inactiveButton: '#f5f5f5',
        borderRadius: 'none',
        buttonSize: 'md',
        themeMode: 'light',
        buttonLabels: {
          home: 'Home',
          shop: 'Shop',
          search: 'Search',
          cart: 'Cart',
          myOrders: 'Orders',
          login: 'Login',
          signOut: 'Logout',
          admin: 'Admin'
        },
        sticky: false,
        shadow: 'none'
      },
      card_design: {
        style: 'minimal',
        imagePosition: 'top',
        textAlignment: 'left',
        shadowEffect: 'none',
        borderRadius: 'none',
        borderStyle: 'solid',
        borderColor: '#e0e0e0',
        hoverEffect: 'scale',
        backgroundColor: '#ffffff',
        textColor: '#262626'
      }
    }
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Vibrant and energetic design with bright colors and strong contrasts',
    category: 'bold',
    tags: ['vibrant', 'energetic', 'dynamic'],
    theme: {
      name: 'Bold',
      colors: {
        primary: '#c4073b',
        primaryLight: '#ff69b4',
        primaryDark: '#860027',
        accent: '#ffd700',
        themeColor: '#c4073b',
        background: '#ffffff',
        text: '#1a1a1a',
        border: '#ff69b4',
        success: '#00d084',
        warning: '#ffa500',
        error: '#ff1744'
      },
      navigation_settings: {
        background: '#c4073b',
        text: '#ffffff',
        activeTab: '#ffd700',
        inactiveButton: '#e91e63',
        borderRadius: 'full',
        buttonSize: 'lg',
        themeMode: 'default',
        buttonLabels: {
          home: 'Home',
          shop: 'Shop',
          search: 'Search',
          cart: 'Cart',
          myOrders: 'Orders',
          login: 'Login',
          signOut: 'Logout',
          admin: 'Admin'
        },
        sticky: true,
        shadow: 'lg'
      },
      card_design: {
        style: 'bold',
        imagePosition: 'top',
        textAlignment: 'center',
        shadowEffect: 'lg',
        borderRadius: 'lg',
        borderStyle: 'solid',
        borderColor: '#ffd700',
        hoverEffect: 'scale',
        backgroundColor: '#ffffff',
        textColor: '#1a1a1a'
      }
    }
  },
  {
    id: 'playful',
    name: 'Playful',
    description: 'Fun and friendly design with pastel colors and rounded corners',
    category: 'playful',
    tags: ['fun', 'friendly', 'youthful'],
    theme: {
      name: 'Playful',
      colors: {
        primary: '#6366f1',
        primaryLight: '#a5b4fc',
        primaryDark: '#4338ca',
        accent: '#ec4899',
        themeColor: '#6366f1',
        background: '#f3f4f6',
        text: '#374151',
        border: '#a5b4fc',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171'
      },
      navigation_settings: {
        background: '#6366f1',
        text: '#ffffff',
        activeTab: '#ec4899',
        inactiveButton: '#818cf8',
        borderRadius: 'full',
        buttonSize: 'md',
        themeMode: 'default',
        buttonLabels: {
          home: 'Home',
          shop: 'Shop',
          search: 'Search',
          cart: 'Cart',
          myOrders: 'Orders',
          login: 'Login',
          signOut: 'Logout',
          admin: 'Admin'
        },
        sticky: true,
        shadow: 'md'
      },
      card_design: {
        style: 'playful',
        imagePosition: 'top',
        textAlignment: 'center',
        shadowEffect: 'md',
        borderRadius: 'full',
        borderStyle: 'none',
        hoverEffect: 'lift',
        backgroundColor: '#ffffff',
        textColor: '#374151'
      }
    }
  }
];

// Helper function to get preset by ID
export function getBrandingPreset(id: string): BrandingPreset | undefined {
  return brandingPresets.find(preset => preset.id === id);
}

// Helper function to get presets by category
export function getBrandingPresetsByCategory(category: string): BrandingPreset[] {
  return brandingPresets.filter(preset => preset.category === category);
}
