export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface PresetTheme extends ThemeConfig {
  id: string;
  description?: string;
}

export interface WhatsAppConfig {
  enabled: boolean;
  phoneNumber: string;
  messageTemplate: string;
  orderPrefix: string;
}

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  messageTemplate: string;
  orderFormat: string;
}

export interface PrepaymentConfig {
  enabled: boolean;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  upiId: string;
  paymentInstructionsTemplate: string;
}

export interface PaymentModesConfig {
  whatsapp: WhatsAppConfig;
  telegram: TelegramConfig;
  prepayment: PrepaymentConfig;
}

export interface SplashScreenConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  logoUrl: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  animationType: 'fade' | 'slideUp' | 'scaleIn' | 'none';
  duration: number; // in seconds
  autoHide: boolean;
}

export interface EditableSection {
  id: string;
  title: string;
  content: string;
  order: number;
  visible: boolean;
  category: 'policy' | 'page' | 'info';
}

export interface RebrandData {
  // Client Info
  clientName: string;
  clientId: string;
  clientEmail?: string;
  clientPhone?: string;

  // Theme
  themeType: 'preset' | 'custom';
  selectedPreset?: string;
  customTheme: ThemeConfig;

  // Payment Modes
  paymentModes: PaymentModesConfig;

  // Splash Screen
  splashScreen: SplashScreenConfig;

  // Editable Sections
  sections: EditableSection[];

  // Metadata
  createdAt: string;
  lastModified: string;
  r2Saved: boolean;
  r2SyncedAt?: string;
  version: string;
}

// Brand Configuration fields that are editable
export interface BrandConfigEditable {
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  logo: string;
  favicon: string;
  instagram: string;
  facebook: string;
  twitter: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    themeColor: string;
  };
  whatsappGreeting: string;
  whatsappDefaultMessage: string;
  aboutUs: string;
  marqueeText: string;
}
