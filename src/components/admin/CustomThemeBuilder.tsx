import { useState } from 'react';
import { Palette } from 'lucide-react';
import { ThemeConfig } from '../../types/rebrandData';
import { getDefaultCustomTheme } from '../../config/presetThemes';

interface CustomThemeBuilderProps {
  theme: ThemeConfig;
  onUpdateTheme: (theme: ThemeConfig) => void;
}

export default function CustomThemeBuilder({ theme, onUpdateTheme }: CustomThemeBuilderProps) {
  const [openColorPicker, setOpenColorPicker] = useState<string | null>(null);

  const handleColorChange = (key: keyof ThemeConfig['colors'], value: string) => {
    const updatedTheme = {
      ...theme,
      colors: {
        ...theme.colors,
        [key]: value,
      },
    };
    onUpdateTheme(updatedTheme);
  };

  const handleReset = () => {
    const defaultTheme = getDefaultCustomTheme();
    onUpdateTheme({
      ...theme,
      colors: defaultTheme.colors,
    });
  };

  const colorFields = [
    {
      key: 'primary' as const,
      label: 'Primary Color',
      description: 'Main brand color',
    },
    {
      key: 'secondary' as const,
      label: 'Secondary Color',
      description: 'Supporting brand color',
    },
    {
      key: 'accent' as const,
      label: 'Accent Color',
      description: 'Highlight and call-to-action elements',
    },
    {
      key: 'text' as const,
      label: 'Text Color',
      description: 'Main text and headings',
    },
    {
      key: 'background' as const,
      label: 'Background Color',
      description: 'Page background color',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Custom Theme Builder
        </h3>
        <p className="text-sm text-gray-600">Create your own color scheme with full customization</p>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {colorFields.map(({ key, label, description }) => (
          <div key={key} className="space-y-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-900">{label}</span>
              <p className="text-xs text-gray-600 mt-1">{description}</p>
            </label>

            <div className="flex gap-2">
              {/* Color Input */}
              <div className="flex-1">
                <input
                  type="text"
                  value={theme.colors[key]}
                  onChange={e => handleColorChange(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="#000000"
                />
              </div>

              {/* Color Picker Button */}
              <button
                onClick={() => setOpenColorPicker(openColorPicker === key ? null : key)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
                style={{
                  backgroundColor: theme.colors[key],
                  borderColor: theme.colors[key],
                }}
              />

              {/* Native Color Picker Input (hidden) */}
              <input
                type="color"
                value={theme.colors[key]}
                onChange={e => handleColorChange(key, e.target.value)}
                className="hidden"
                id={`color-${key}`}
              />
            </div>

            {/* Color Preview */}
            <div
              className="w-full h-12 rounded border-2 border-gray-200"
              style={{ backgroundColor: theme.colors[key] }}
            />
          </div>
        ))}
      </div>

      {/* Preview Panel */}
      <div className="mt-8 p-6 bg-gradient-to-br rounded-lg border border-gray-200" style={{
        backgroundColor: theme.colors.background,
      }}>
        <h4 className="text-lg font-bold mb-4" style={{ color: theme.colors.text }}>
          Preview
        </h4>
        
        <div className="space-y-4">
          {/* Primary Button */}
          <button
            className="px-4 py-2 rounded font-medium text-white"
            style={{ backgroundColor: theme.colors.primary }}
          >
            Primary Button
          </button>

          {/* Secondary Button */}
          <button
            className="px-4 py-2 rounded font-medium"
            style={{
              backgroundColor: theme.colors.secondary,
              color: theme.colors.text,
            }}
          >
            Secondary Button
          </button>

          {/* Text Example */}
          <div style={{ color: theme.colors.text }}>
            <p className="text-sm mb-2">Sample text with your selected text color</p>
            <span
              className="inline-block px-3 py-1 rounded text-sm font-medium text-white"
              style={{ backgroundColor: theme.colors.accent }}
            >
              Accent Tag
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
}
