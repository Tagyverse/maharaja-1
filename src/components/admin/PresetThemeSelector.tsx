import { useState } from 'react';
import { Check } from 'lucide-react';
import { presetThemes } from '../../config/presetThemes';
import { PresetTheme } from '../../types/rebrandData';

interface PresetThemeSelectorProps {
  selectedThemeId?: string;
  onSelectTheme: (theme: PresetTheme) => void;
}

export default function PresetThemeSelector({
  selectedThemeId,
  onSelectTheme,
}: PresetThemeSelectorProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preset Themes</h3>
        <p className="text-sm text-gray-600 mb-6">Choose from our curated collection of professional themes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presetThemes.map(theme => (
          <button
            key={theme.id}
            onMouseEnter={() => setHoveredId(theme.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelectTheme(theme)}
            className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedThemeId === theme.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {/* Theme Preview */}
            <div className="mb-3 space-y-2">
              <div className="flex gap-2 items-center">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: theme.colors.primary }}
                  title="Primary"
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: theme.colors.secondary }}
                  title="Secondary"
                />
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: theme.colors.accent }}
                  title="Accent"
                />
              </div>
            </div>

            {/* Theme Info */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{theme.name}</h4>
                {theme.description && (
                  <p className="text-xs text-gray-600 mt-1">{theme.description}</p>
                )}
              </div>

              {/* Selection Indicator */}
              {selectedThemeId === theme.id && (
                <div className="flex-shrink-0 ml-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Hover Effect */}
            {hoveredId === theme.id && selectedThemeId !== theme.id && (
              <div className="absolute inset-0 rounded-lg bg-gray-100 opacity-10 pointer-events-none" />
            )}
          </button>
        ))}
      </div>

      {/* Theme Details */}
      {selectedThemeId && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            {presetThemes
              .filter(t => t.id === selectedThemeId)
              .map(theme => (
                <div key={theme.id}>
                  <h4 className="font-semibold text-gray-900 mb-3">{theme.name} - Color Palette</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(theme.colors).map(([key, value]) => (
                      <div key={key}>
                        <div
                          className="w-full h-16 rounded border border-gray-200 mb-2"
                          style={{ backgroundColor: value }}
                        />
                        <p className="text-xs font-medium text-gray-700 capitalize">{key}</p>
                        <p className="text-xs text-gray-500">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
