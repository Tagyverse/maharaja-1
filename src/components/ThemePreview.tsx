import React from 'react';
import type { BusinessConfig } from '../types';
import { ShoppingCart, Heart, Star, ArrowRight } from 'lucide-react';

interface ThemePreviewProps {
  config: BusinessConfig;
}

export default function ThemePreview({ config }: ThemePreviewProps) {
  const isDarkMode = config.theme_dark_mode_enabled || config.theme_color_scheme === 'dark';
  const isRoundedButtons = config.theme_button_style === 'rounded';

  const bgColor = isDarkMode ? '#1e293b' : '#f8fafc';
  const textColor = isDarkMode ? '#f1f5f9' : '#0f172a';
  const cardBg = isDarkMode ? '#334155' : '#ffffff';
  const borderColor = isDarkMode ? '#475569' : '#e2e8f0';

  const buttonClass = isRoundedButtons ? 'rounded-lg' : 'rounded-none';

  return (
    <div
      className="border border-slate-700 rounded-lg overflow-hidden"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {/* Header Preview */}
      <div
        className="p-4 border-b"
        style={{ borderColor, backgroundColor: config.secondary_color }}
      >
        <h2 className="text-xl font-bold" style={{ color: config.primary_color }}>
          {config.company_name || 'Your Store'}
        </h2>
        <p className="text-sm opacity-75">{config.tagline || 'Your business tagline'}</p>
      </div>

      {/* Hero Section Preview */}
      <div
        className="p-6 text-center"
        style={{
          backgroundColor: config.primary_color,
          backgroundImage: `linear-gradient(135deg, ${config.primary_color} 0%, ${config.secondary_color} 100%)`,
        }}
      >
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to {config.company_name}</h1>
        <p className="text-white/80 mb-4">Experience quality and style</p>
        <button
          className={`px-6 py-2 font-semibold transition-all ${buttonClass}`}
          style={{
            backgroundColor: config.accent_color,
            color: isDarkMode ? '#000' : '#fff',
          }}
        >
          Shop Now <ArrowRight className="w-4 h-4 inline ml-2" />
        </button>
      </div>

      {/* Product Cards Preview */}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Featured Products</h3>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`p-4 border transition-all ${buttonClass}`}
              style={{ backgroundColor: cardBg, borderColor }}
            >
              <div
                className="w-full h-24 mb-2 rounded flex items-center justify-center"
                style={{ backgroundColor: config.primary_color }}
              >
                <span className="text-white text-sm">Product {i}</span>
              </div>
              <p className="font-semibold text-sm mb-1">Product Name</p>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-3 h-3"
                    style={{ color: config.accent_color }}
                    fill={config.accent_color}
                  />
                ))}
              </div>
              <p className="text-sm font-bold mb-2">$99.99</p>
              <div className="flex gap-2">
                <button
                  className={`flex-1 px-2 py-1 text-xs font-semibold transition-all ${buttonClass}`}
                  style={{
                    backgroundColor: config.primary_color,
                    color: '#fff',
                  }}
                >
                  <ShoppingCart className="w-3 h-3 inline mr-1" />
                  Add
                </button>
                <button
                  className={`px-2 py-1 text-xs transition-all border ${buttonClass}`}
                  style={{
                    borderColor: config.accent_color,
                    color: config.accent_color,
                  }}
                >
                  <Heart className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Preview */}
      <div
        className="p-4 border-t"
        style={{ borderColor, backgroundColor: config.secondary_color }}
      >
        <p className="text-xs opacity-75 mb-2">© 2024 {config.company_name}</p>
        <p className="text-xs" style={{ color: config.primary_color }}>
          {config.business_address}
        </p>
      </div>

      {/* Theme Info */}
      <div className="p-4 border-t" style={{ borderColor }}>
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold">Font:</span> {config.theme_font_family}
          </div>
          <div>
            <span className="font-semibold">Mode:</span> {config.theme_color_scheme}
          </div>
          <div>
            <span className="font-semibold">Buttons:</span> {config.theme_button_style}
          </div>
          <div className="mt-3 flex gap-2">
            <div
              className="w-8 h-8 rounded border"
              style={{ backgroundColor: config.primary_color }}
              title="Primary"
            />
            <div
              className="w-8 h-8 rounded border"
              style={{ backgroundColor: config.secondary_color }}
              title="Secondary"
            />
            <div
              className="w-8 h-8 rounded border"
              style={{ backgroundColor: config.accent_color }}
              title="Accent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
