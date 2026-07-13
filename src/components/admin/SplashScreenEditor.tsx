import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { SplashScreenConfig } from '../../types/rebrandData';

interface SplashScreenEditorProps {
  config: SplashScreenConfig;
  onUpdateConfig: (config: SplashScreenConfig) => void;
}

export default function SplashScreenEditor({ config, onUpdateConfig }: SplashScreenEditorProps) {
  const [previewEnabled, setPreviewEnabled] = useState(true);

  const handleChange = (field: keyof SplashScreenConfig, value: any) => {
    onUpdateConfig({
      ...config,
      [field]: value,
    });
  };

  const animationTypes: Array<SplashScreenConfig['animationType']> = [
    'fade',
    'slideUp',
    'scaleIn',
    'none',
  ];

  return (
    <div className="space-y-6">
      {/* Enable/Disable */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={e => handleChange('enabled', e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 cursor-pointer"
        />
        <label className="text-sm font-medium text-gray-700">
          Enable splash screen on app load
        </label>
      </div>

      {config.enabled && (
        <>
          {/* Content Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={config.title}
                onChange={e => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={config.subtitle}
                onChange={e => handleChange('subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Logo URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="text"
                value={config.logoUrl}
                onChange={e => handleChange('logoUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.backgroundColor}
                    onChange={e => handleChange('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={e => handleChange('backgroundColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.textColor}
                    onChange={e => handleChange('textColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={e => handleChange('textColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.accentColor}
                    onChange={e => handleChange('accentColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="color"
                    value={config.accentColor}
                    onChange={e => handleChange('accentColor', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Animation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Animation Type</label>
              <select
                value={config.animationType}
                onChange={e => handleChange('animationType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {animationTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={config.duration}
                onChange={e => handleChange('duration', parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Auto Hide */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={config.autoHide}
              onChange={e => handleChange('autoHide', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 cursor-pointer"
            />
            <label className="text-sm font-medium text-gray-700">
              Auto-hide after {config.duration} seconds
            </label>
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Live Preview</h3>
              <button
                onClick={() => setPreviewEnabled(!previewEnabled)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                {previewEnabled ? (
                  <Eye className="w-4 h-4 text-gray-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            {previewEnabled && (
              <div
                className="w-full h-64 rounded-lg flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-gray-300"
                style={{
                  backgroundColor: config.backgroundColor,
                }}
              >
                {config.logoUrl && (
                  <img
                    src={config.logoUrl}
                    alt="Logo"
                    className="w-16 h-16 mb-4 rounded-lg object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <h1
                  className="text-2xl font-bold mb-2"
                  style={{ color: config.textColor }}
                >
                  {config.title}
                </h1>
                <p
                  className="text-sm"
                  style={{ color: config.accentColor }}
                >
                  {config.subtitle}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {!config.enabled && (
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">Splash screen is currently disabled</p>
        </div>
      )}
    </div>
  );
}
