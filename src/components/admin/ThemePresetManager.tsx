import { useState } from 'react';
import { Palette, Copy, Check, Download } from 'lucide-react';
import { brandingPresets } from '../../config/brandingPresets';

interface ThemePresetManagerProps {
  onSelectPreset: (presetId: string) => void;
  showToast: (msg: string) => void;
}

export default function ThemePresetManager({ onSelectPreset, showToast }: ThemePresetManagerProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const categories = Array.from(new Set(brandingPresets.map(p => p.category)));

  const filteredPresets = activeCategory
    ? brandingPresets.filter(p => p.category === activeCategory)
    : brandingPresets;

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    onSelectPreset(presetId);
  };

  const handleCopyPresetCode = (presetId: string) => {
    const preset = brandingPresets.find(p => p.id === presetId);
    if (!preset) return;

    const code = `export const ${presetId}Theme = ${JSON.stringify(preset.theme, null, 2)};`;
    navigator.clipboard.writeText(code);
    setCopied(presetId);
    setTimeout(() => setCopied(null), 2000);
    showToast('Preset code copied!');
  };

  const handleDownloadPreset = (presetId: string) => {
    const preset = brandingPresets.find(p => p.id === presetId);
    if (!preset) return;

    const data = JSON.stringify(preset.theme, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', `${preset.id}-theme.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast(`Downloaded ${preset.name} theme`);
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Theme Preset Gallery</h2>
          </div>
          <span className="text-[11px] px-2 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-medium">
            {brandingPresets.length} Presets
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Browse pre-designed branding themes. Click to apply, download, or copy code.
        </p>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 pb-4 border-b border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeCategory === null
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                : 'text-slate-400 hover:text-slate-300 border border-transparent'
            }`}
          >
            All ({brandingPresets.length})
          </button>
          {categories.map(category => {
            const count = brandingPresets.filter(p => p.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategory === category
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                    : 'text-slate-400 hover:text-slate-300 border border-transparent'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        {/* Preset Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredPresets.map(preset => (
            <div
              key={preset.id}
              className={`rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${
                selectedPreset === preset.id
                  ? 'border-purple-400 bg-purple-500/10'
                  : 'border-slate-600 bg-slate-900/40 hover:border-slate-500'
              }`}
            >
              {/* Color Preview Strip */}
              <div className="flex h-20">
                <div
                  className="flex-1"
                  style={{ backgroundColor: preset.theme.colors.primary }}
                />
                <div
                  className="flex-1"
                  style={{ backgroundColor: preset.theme.colors.accent }}
                />
                <div
                  className="flex-1"
                  style={{ backgroundColor: preset.theme.colors.primaryLight }}
                />
                <div
                  className="flex-1"
                  style={{ backgroundColor: preset.theme.colors.primaryDark }}
                />
              </div>

              {/* Preset Details */}
              <div className="p-4">
                <h3 className="font-semibold text-white text-sm mb-1">{preset.name}</h3>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{preset.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {preset.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-1 rounded bg-slate-700 text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`flex-1 py-2 px-3 text-xs font-medium rounded transition-colors ${
                      selectedPreset === preset.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    }`}
                  >
                    {selectedPreset === preset.id ? 'Selected' : 'Select'}
                  </button>
                  <button
                    onClick={() => handleDownloadPreset(preset.id)}
                    title="Download as JSON"
                    className="py-2 px-3 bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCopyPresetCode(preset.id)}
                    title="Copy preset code"
                    className="py-2 px-3 bg-slate-700 text-slate-200 rounded hover:bg-slate-600 transition-colors"
                  >
                    {copied === preset.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPresets.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No presets found in this category</p>
          </div>
        )}
      </div>

      {/* Preset Details Panel */}
      {selectedPreset && (
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            {brandingPresets.find(p => p.id === selectedPreset)?.name} Details
          </h3>

          {selectedPreset && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2 uppercase">Colors</h4>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(
                    brandingPresets.find(p => p.id === selectedPreset)?.theme.colors || {}
                  ).map(([key, color]) => (
                    <div key={key} className="text-center">
                      <div
                        className="w-full h-16 rounded-lg border border-slate-600 mb-2"
                        style={{ backgroundColor: color as string }}
                      />
                      <p className="text-[10px] text-slate-400 font-mono">{key}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{color}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2 uppercase">Card Design</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {brandingPresets
                    .find(p => p.id === selectedPreset)
                    ?.theme.card_design && (
                    <>
                      <div className="bg-slate-900/60 border border-slate-600 rounded p-2">
                        <p className="text-slate-400">Style</p>
                        <p className="text-white font-semibold">
                          {
                            brandingPresets.find(p => p.id === selectedPreset)?.theme.card_design
                              .style
                          }
                        </p>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-600 rounded p-2">
                        <p className="text-slate-400">Image Position</p>
                        <p className="text-white font-semibold">
                          {
                            brandingPresets.find(p => p.id === selectedPreset)?.theme.card_design
                              .imagePosition
                          }
                        </p>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-600 rounded p-2">
                        <p className="text-slate-400">Shadow</p>
                        <p className="text-white font-semibold">
                          {
                            brandingPresets.find(p => p.id === selectedPreset)?.theme.card_design
                              .shadowEffect
                          }
                        </p>
                      </div>
                      <div className="bg-slate-900/60 border border-slate-600 rounded p-2">
                        <p className="text-slate-400">Border Radius</p>
                        <p className="text-white font-semibold">
                          {
                            brandingPresets.find(p => p.id === selectedPreset)?.theme.card_design
                              .borderRadius
                          }
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
