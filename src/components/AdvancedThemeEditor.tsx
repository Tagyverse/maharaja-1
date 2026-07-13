import React from 'react';
import type { BusinessConfig } from '../types';
import { Copy, Check } from 'lucide-react';

interface AdvancedThemeEditorProps {
  config: BusinessConfig;
  onUpdate: (updates: Partial<BusinessConfig>) => void;
}

export default function AdvancedThemeEditor({ config, onUpdate }: AdvancedThemeEditorProps) {
  const [copied, setCopied] = React.useState<string | null>(null);

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 2000);
  };

  const colorInputs = [
    {
      key: 'primary_color',
      label: 'Primary Color',
      description: 'Main brand color - buttons, links, highlights',
      value: config.primary_color,
    },
    {
      key: 'secondary_color',
      label: 'Secondary Color',
      description: 'Background colors, header, footer',
      value: config.secondary_color,
    },
    {
      key: 'accent_color',
      label: 'Accent Color',
      description: 'Call-to-action buttons, badges, special elements',
      value: config.accent_color,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Color Configuration */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-semibold text-cyan-400">Color Customization</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {colorInputs.map((input) => (
            <div key={input.key} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{input.label}</label>
                <p className="text-xs text-slate-400 mb-2">{input.description}</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={input.value}
                  onChange={(e) => onUpdate({ [input.key]: e.target.value })}
                  className="w-12 h-10 rounded-lg cursor-pointer border border-slate-600 hover:border-slate-500 transition-colors"
                />
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={input.value}
                    onChange={(e) => {
                      if (e.target.value.match(/^#[0-9a-f]{6}$/i)) {
                        onUpdate({ [input.key]: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 font-mono text-sm focus:outline-none focus:border-cyan-400"
                    placeholder="#000000"
                  />
                  <button
                    onClick={() => handleCopyColor(input.value)}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    {copied === input.value ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              {/* Color preview */}
              <div className="flex gap-2">
                {[input.value, input.value + '80', input.value + '40', input.value + '20'].map((col, i) => (
                  <div
                    key={i}
                    className="flex-1 h-6 rounded border border-slate-600"
                    style={{ backgroundColor: col }}
                    title={`${100 - i * 20}% opacity`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography Settings */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-semibold text-cyan-400">Typography</h3>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Font Family</label>
          <select
            value={config.theme_font_family}
            onChange={(e) => onUpdate({ theme_font_family: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 focus:outline-none focus:border-cyan-400"
          >
            <option value="sans-serif">Sans Serif (Modern, Clean)</option>
            <option value="serif">Serif (Classic, Elegant)</option>
            <option value="monospace">Monospace (Tech, Code)</option>
          </select>
          <p className="text-xs text-slate-400 mt-2">This affects all text on your website</p>
        </div>
      </div>

      {/* Button Style Settings */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-semibold text-cyan-400">Button & Component Style</h3>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Button Style</label>
          <div className="flex gap-4">
            {['rounded', 'square'].map((style) => (
              <button
                key={style}
                onClick={() => onUpdate({ theme_button_style: style as 'rounded' | 'square' })}
                className={`flex-1 px-4 py-3 font-semibold rounded-lg border-2 transition-all ${
                  config.theme_button_style === style
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                    : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span className={style === 'rounded' ? 'rounded-lg px-2 py-1 bg-slate-600 inline-block text-xs' : 'px-1 py-1 bg-slate-600 inline-block text-xs'}>
                  {style === 'rounded' ? '○ Rounded' : '▭ Square'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Color Scheme Settings */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-semibold text-cyan-400">Color Mode</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Theme Mode</label>
            <div className="flex gap-4">
              {[
                { value: 'light', label: '☀️ Light' },
                { value: 'dark', label: '🌙 Dark' },
                { value: 'auto', label: '🔄 Auto' },
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => onUpdate({ theme_color_scheme: mode.value as any })}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all font-semibold ${
                    config.theme_color_scheme === mode.value
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                      : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {config.theme_color_scheme === 'auto'
                ? 'Respects user system preference'
                : `Forces ${config.theme_color_scheme} mode for all users`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="darkModeToggle"
              checked={config.theme_dark_mode_enabled}
              onChange={(e) => onUpdate({ theme_dark_mode_enabled: e.target.checked })}
              className="w-4 h-4 rounded cursor-pointer accent-cyan-400"
            />
            <label htmlFor="darkModeToggle" className="text-slate-300 cursor-pointer flex-1">
              Enable Dark Mode Support
            </label>
          </div>
        </div>
      </div>

      {/* Theme Summary */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-300">Current Theme Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-slate-800/50 p-3 rounded">
            <p className="text-slate-400 text-xs mb-1">Primary Color</p>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-slate-600"
                style={{ backgroundColor: config.primary_color }}
              />
              <p className="font-mono text-slate-200">{config.primary_color}</p>
            </div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded">
            <p className="text-slate-400 text-xs mb-1">Secondary Color</p>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-slate-600"
                style={{ backgroundColor: config.secondary_color }}
              />
              <p className="font-mono text-slate-200">{config.secondary_color}</p>
            </div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded">
            <p className="text-slate-400 text-xs mb-1">Accent Color</p>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-slate-600"
                style={{ backgroundColor: config.accent_color }}
              />
              <p className="font-mono text-slate-200">{config.accent_color}</p>
            </div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded">
            <p className="text-slate-400 text-xs mb-1">Font</p>
            <p className="font-semibold text-slate-200">{config.theme_font_family}</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded">
            <p className="text-slate-400 text-xs mb-1">Button Style</p>
            <p className="font-semibold text-slate-200 capitalize">{config.theme_button_style}</p>
          </div>
          <div className="bg-slate-800/50 p-3 rounded">
            <p className="text-slate-400 text-xs mb-1">Color Scheme</p>
            <p className="font-semibold text-slate-200 capitalize">{config.theme_color_scheme}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
