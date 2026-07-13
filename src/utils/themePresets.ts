import type { BusinessConfig } from '../types';

export interface ThemePreset {
  name: string;
  label: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  theme: {
    font_family: string;
    dark_mode: boolean;
    color_scheme: 'light' | 'dark' | 'auto';
    button_style: 'rounded' | 'square';
  };
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  modern: {
    name: 'modern',
    label: 'Modern',
    description: 'Clean, contemporary design with vibrant accents',
    colors: {
      primary: '#0ea5e9',
      secondary: '#1e293b',
      accent: '#f97316',
    },
    theme: {
      font_family: 'sans-serif',
      dark_mode: true,
      color_scheme: 'dark',
      button_style: 'rounded',
    },
  },
  minimal: {
    name: 'minimal',
    label: 'Minimal',
    description: 'Simple and elegant with neutral tones',
    colors: {
      primary: '#18181b',
      secondary: '#f5f5f5',
      accent: '#64748b',
    },
    theme: {
      font_family: 'sans-serif',
      dark_mode: false,
      color_scheme: 'light',
      button_style: 'square',
    },
  },
  luxury: {
    name: 'luxury',
    label: 'Luxury',
    description: 'Premium feel with gold and deep tones',
    colors: {
      primary: '#d4af37',
      secondary: '#1a1a1a',
      accent: '#fbbf24',
    },
    theme: {
      font_family: 'serif',
      dark_mode: true,
      color_scheme: 'dark',
      button_style: 'rounded',
    },
  },
  vibrant: {
    name: 'vibrant',
    label: 'Vibrant',
    description: 'Bold colors and energetic design',
    colors: {
      primary: '#ec4899',
      secondary: '#7c3aed',
      accent: '#f59e0b',
    },
    theme: {
      font_family: 'sans-serif',
      dark_mode: true,
      color_scheme: 'dark',
      button_style: 'rounded',
    },
  },
  ocean: {
    name: 'ocean',
    label: 'Ocean',
    description: 'Cool blues and ocean-inspired palette',
    colors: {
      primary: '#0369a1',
      secondary: '#0c4a6e',
      accent: '#06b6d4',
    },
    theme: {
      font_family: 'sans-serif',
      dark_mode: true,
      color_scheme: 'dark',
      button_style: 'rounded',
    },
  },
  forest: {
    name: 'forest',
    label: 'Forest',
    description: 'Natural greens with earthy tones',
    colors: {
      primary: '#16a34a',
      secondary: '#1f2937',
      accent: '#84cc16',
    },
    theme: {
      font_family: 'sans-serif',
      dark_mode: true,
      color_scheme: 'dark',
      button_style: 'rounded',
    },
  },
  sunset: {
    name: 'sunset',
    label: 'Sunset',
    description: 'Warm oranges and reds with dark background',
    colors: {
      primary: '#ea580c',
      secondary: '#431407',
      accent: '#f97316',
    },
    theme: {
      font_family: 'sans-serif',
      dark_mode: true,
      color_scheme: 'dark',
      button_style: 'rounded',
    },
  },
  cyberpunk: {
    name: 'cyberpunk',
    label: 'Cyberpunk',
    description: 'Neon colors with futuristic feel',
    colors: {
      primary: '#ff006e',
      secondary: '#0a0e27',
      accent: '#00f5ff',
    },
    theme: {
      font_family: 'monospace',
      dark_mode: true,
      color_scheme: 'dark',
      button_style: 'square',
    },
  },
};

export function applyThemePreset(preset: ThemePreset): Partial<BusinessConfig> {
  return {
    primary_color: preset.colors.primary,
    secondary_color: preset.colors.secondary,
    accent_color: preset.colors.accent,
    theme_font_family: preset.theme.font_family,
    theme_dark_mode_enabled: preset.theme.dark_mode,
    theme_color_scheme: preset.theme.color_scheme,
    theme_button_style: preset.theme.button_style,
  };
}

export function getPresetLabel(presetName: string): string {
  const preset = THEME_PRESETS[presetName];
  return preset ? preset.label : 'Custom';
}

export function detectPresetFromConfig(config: BusinessConfig): string | null {
  for (const [name, preset] of Object.entries(THEME_PRESETS)) {
    if (
      config.primary_color === preset.colors.primary &&
      config.secondary_color === preset.colors.secondary &&
      config.accent_color === preset.colors.accent &&
      config.theme_font_family === preset.theme.font_family &&
      config.theme_dark_mode_enabled === preset.theme.dark_mode &&
      config.theme_color_scheme === preset.theme.color_scheme &&
      config.theme_button_style === preset.theme.button_style
    ) {
      return name;
    }
  }
  return null;
}
