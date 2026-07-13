export interface BrandColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
}

export interface BrandingOverride {
  name?: string;
  colors?: Partial<BrandColors>;
}

function hexToChannels(hex: string): string | null {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

function mixWithWhite(hex: string, whiteRatio: number): string | null {
  const channels = hexToChannels(hex);
  if (!channels) return null;
  const [r, g, b] = channels.split(' ').map(Number);
  const mix = (c: number) => Math.round(c * (1 - whiteRatio) + 255 * whiteRatio);
  return `${mix(r)} ${mix(g)} ${mix(b)}`;
}

export function applyBrandColors(colors: Partial<BrandColors>) {
  const root = document.documentElement;
  const setVar = (name: string, value: string | null) => {
    if (value) root.style.setProperty(name, value);
  };

  if (colors.primary) {
    setVar('--brand-rgb', hexToChannels(colors.primary));
    setVar('--brand-soft-rgb', mixWithWhite(colors.primary, 0.9));
  }
  if (colors.primaryLight) setVar('--brand-light-rgb', hexToChannels(colors.primaryLight));
  if (colors.primaryDark) setVar('--brand-dark-rgb', hexToChannels(colors.primaryDark));
  if (colors.accent) setVar('--brand-accent-rgb', hexToChannels(colors.accent));
}

export function applyBrandingOverride(branding: BrandingOverride | undefined | null) {
  if (!branding) return;
  if (branding.colors) applyBrandColors(branding.colors);
  if (branding.name) document.title = branding.name;
}
