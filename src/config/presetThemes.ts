import { PresetTheme } from '../types/rebrandData';

export const presetThemes: PresetTheme[] = [
  {
    id: 'modern-green',
    name: 'Modern Green',
    description: 'Fresh and energetic with modern green tones',
    colors: {
      primary: '#11791d',
      secondary: '#207e67',
      accent: '#6fecb6',
      text: '#1f2937',
      background: '#f9fafb',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm and inviting with sunset hues',
    colors: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#fdba74',
      text: '#1f2937',
      background: '#fefce8',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Calm and professional with ocean blues',
    colors: {
      primary: '#0369a1',
      secondary: '#0284c7',
      accent: '#06b6d4',
      text: '#1f2937',
      background: '#f0f9ff',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  {
    id: 'dark-purple',
    name: 'Dark Purple',
    description: 'Elegant and sophisticated with deep purples',
    colors: {
      primary: '#6b21a8',
      secondary: '#7c3aed',
      accent: '#c084fc',
      text: '#1f2937',
      background: '#faf5ff',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  {
    id: 'minimalist-white',
    name: 'Minimalist White',
    description: 'Clean and minimal with neutral tones',
    colors: {
      primary: '#000000',
      secondary: '#404040',
      accent: '#737373',
      text: '#1f2937',
      background: '#ffffff',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  {
    id: 'vibrant-red',
    name: 'Vibrant Red',
    description: 'Bold and energetic with vibrant reds',
    colors: {
      primary: '#dc2626',
      secondary: '#ef4444',
      accent: '#fca5a5',
      text: '#1f2937',
      background: '#fef2f2',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  {
    id: 'forest-teal',
    name: 'Forest Teal',
    description: 'Natural and grounding with forest teals',
    colors: {
      primary: '#0d9488',
      secondary: '#14b8a6',
      accent: '#5eead4',
      text: '#1f2937',
      background: '#f0fdfa',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Luxurious and premium with rose gold tones',
    colors: {
      primary: '#be123c',
      secondary: '#db2777',
      accent: '#fbcfe8',
      text: '#1f2937',
      background: '#ffe4e6',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  },
];

export const getPresetTheme = (id: string): PresetTheme | undefined => {
  return presetThemes.find(theme => theme.id === id);
};

export const getDefaultCustomTheme = (): PresetTheme => {
  return {
    id: 'custom',
    name: 'Custom Theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#ec4899',
      text: '#1f2937',
      background: '#f8fafc',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
  };
};
