// ============================================================
// ADVANCED BRANDING SYSTEM TYPES
// Complete design system for comprehensive rebranding
// ============================================================

export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  accentLight: string;
  neutral50: string;
  neutral100: string;
  neutral200: string;
  neutral300: string;
  neutral400: string;
  neutral500: string;
  neutral600: string;
  neutral700: string;
  neutral800: string;
  neutral900: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface TypographyScale {
  // Font families
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  // Font weights
  fontWeight: {
    thin: number;
    extralight: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
  // Font sizes & line heights
  sizes: {
    xs: { size: string; lineHeight: string };
    sm: { size: string; lineHeight: string };
    base: { size: string; lineHeight: string };
    lg: { size: string; lineHeight: string };
    xl: { size: string; lineHeight: string };
    '2xl': { size: string; lineHeight: string };
    '3xl': { size: string; lineHeight: string };
    '4xl': { size: string; lineHeight: string };
    '5xl': { size: string; lineHeight: string };
  };
}

export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface BorderRadius {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface Shadow {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface Animation {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  timing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
  keyframes: {
    [key: string]: string;
  };
}

export interface ButtonStyle {
  size: {
    xs: { padding: string; fontSize: string };
    sm: { padding: string; fontSize: string };
    md: { padding: string; fontSize: string };
    lg: { padding: string; fontSize: string };
    xl: { padding: string; fontSize: string };
  };
  variant: {
    solid: { bg: string; text: string; hover: string };
    outline: { border: string; text: string; hover: string };
    ghost: { bg: string; text: string; hover: string };
  };
  radius: string;
  fontWeight: string;
}

export interface CardStyle {
  layout: 'grid' | 'list' | 'carousel';
  imagePosition: 'top' | 'left' | 'right' | 'bottom';
  imageHeight: string;
  imageWidth: string;
  textAlignment: 'left' | 'center' | 'right';
  shadow: 'none' | 'sm' | 'md' | 'lg';
  borderRadius: string;
  padding: string;
  gap: string;
  hoverEffect: 'lift' | 'scale' | 'glow' | 'none';
}

export interface NavigationStyle {
  background: string;
  text: string;
  activeTab: string;
  inactiveButton: string;
  hoverColor: string;
  borderRadius: string;
  buttonSize: 'sm' | 'md' | 'lg';
  alignment: 'left' | 'center' | 'right';
  position: 'sticky' | 'fixed' | 'relative';
  themeMode: 'light' | 'dark' | 'auto';
  transparency: 'none' | 'low' | 'medium' | 'high';
  shadow: boolean;
}

export interface FormStyle {
  inputBg: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  labelText: string;
  errorColor: string;
  successColor: string;
  borderRadius: string;
  focusRing: string;
  shadow: boolean;
}

export interface AdvancedBrandingTheme {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'luxury' | 'minimal' | 'bold' | 'playful' | 'corporate' | 'eco' | 'festival' | 'custom';
  
  // Core Design System
  colors: Partial<ColorPalette>;
  typography: TypographyScale;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadow: Shadow;
  animation: Animation;
  
  // Component Styles
  button: ButtonStyle;
  card: CardStyle;
  navigation: NavigationStyle;
  form: FormStyle;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  author?: string;
  preview?: {
    thumbnail: string;
    colors: string[];
  };
}

export interface BrandingPresetMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  colors: string[];
  popularity: number;
  rating: number;
  downloads: number;
}

export interface PublishedBrandingData {
  branding: {
    name: string;
    tagline: string;
    theme: AdvancedBrandingTheme;
    updated_at: string;
  };
  navigation_settings: NavigationStyle;
  card_design: CardStyle;
  published_at: string;
  version: string;
  isDefault?: boolean;
}

export interface BrandingExport {
  format: 'json' | 'css' | 'tailwind' | 'typescript';
  theme: AdvancedBrandingTheme;
  timestamp: string;
  version: string;
}
