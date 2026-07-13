// Comprehensive branding types for unified theme management

export interface BrandingColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  themeColor: string;
  background?: string;
  text?: string;
  border?: string;
  success?: string;
  warning?: string;
  error?: string;
}

export interface NavigationSettings {
  background: string;
  text: string;
  activeTab: string;
  inactiveButton: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  buttonSize: 'sm' | 'md' | 'lg';
  themeMode: 'default' | 'dark' | 'light';
  buttonLabels: {
    home: string;
    shop: string;
    search: string;
    cart: string;
    myOrders: string;
    login: string;
    signOut: string;
    admin: string;
  };
  sticky?: boolean;
  transparency?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardDesign {
  style: 'classic' | 'modern' | 'minimal' | 'luxury' | 'bold' | 'playful';
  imagePosition: 'top' | 'left' | 'right' | 'overlay';
  textAlignment: 'left' | 'center' | 'right';
  shadowEffect: 'none' | 'sm' | 'md' | 'lg';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  borderStyle?: 'none' | 'solid' | 'dashed';
  borderColor?: string;
  hoverEffect?: 'none' | 'lift' | 'glow' | 'scale';
  backgroundColor?: string;
  textColor?: string;
}

export interface OrderChannelSettings {
  whatsappOrders: {
    enabled: boolean;
    phoneNumber?: string;
    message?: string;
  };
  telegramOrders: {
    enabled: boolean;
    botToken?: string;
    chatId?: string;
    notifyAdmin?: boolean;
  };
  prepaymentOrders: {
    enabled: boolean;
    paymentGateway: 'razorpay' | 'paypal' | 'stripe';
    gatewayKey?: string;
  };
}

export interface BrandingTheme {
  name: string;
  description?: string;
  colors: BrandingColors;
  navigation_settings: NavigationSettings;
  card_design: CardDesign;
  order_channels?: OrderChannelSettings;
  customCSS?: string;
  fontFamily?: {
    heading: string;
    body: string;
  };
}

export interface PublishedBrandingData {
  branding: {
    name: string;
    tagline: string;
    colors: BrandingColors;
    updated_at: string;
  };
  navigation_settings: NavigationSettings;
  card_design: CardDesign;
  order_channels?: OrderChannelSettings;
  published_at: string;
  version: string;
  isDefault?: boolean;
}

export interface BrandingPreset {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  theme: BrandingTheme;
  category: 'modern' | 'classic' | 'luxury' | 'minimal' | 'bold' | 'playful';
  tags: string[];
}
