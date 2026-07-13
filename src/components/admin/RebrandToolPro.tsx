import { useState, useEffect } from 'react';
import {
  Paintbrush, Save, UploadCloud, Copy, Check, RotateCcw, Loader2, FileCode2,
  Palette, Navigation, Layout, Type, Spacing, Zap, FileJson, Settings
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { ref, get, set } from 'firebase/database';
import { brand } from '../../config/brand';
import { applyBrandColors } from '../../utils/brandTheme';
import { advancedBrandingPresets } from '../../config/advancedBrandingPresets';
import type { AdvancedBrandingTheme } from '../../types/brandingAdvanced';

interface RebrandToolProProps {
  showToast: (message: string) => void;
}

type TabType = 'quick-apply' | 'brand-identity' | 'colors' | 'typography' | 'spacing' | 'components' | 'advanced' | 'export';

export default function RebrandToolPro({ showToast }: RebrandToolProProps) {
  const [activeTab, setActiveTab] = useState<TabType>('quick-apply');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<AdvancedBrandingTheme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrandingData();
  }, []);

  const loadBrandingData = async () => {
    try {
      const dbRef = ref(db, 'branding');
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        setCurrentTheme(snapshot.val());
      } else {
        setCurrentTheme(advancedBrandingPresets[0]);
      }
    } catch (err) {
      console.error('Failed to load branding:', err);
      setCurrentTheme(advancedBrandingPresets[0]);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (presetId: string) => {
    const preset = advancedBrandingPresets.find(p => p.id === presetId);
    if (!preset) return;

    setCurrentTheme(preset);
    setSelectedPreset(presetId);
    
    if (preset.colors?.primary) {
      applyBrandColors({
        primary: preset.colors.primary,
        primaryLight: preset.colors.primaryLight || '#FFFFFF',
        primaryDark: preset.colors.primaryDark || '#000000',
        accent: preset.colors.accent || preset.colors.primary,
      });
    }

    showToast(`Applied ${preset.name} preset!`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dbRef = ref(db, 'branding');
      await set(dbRef, currentTheme);
      showToast('Branding saved to Firebase!');
    } catch (err) {
      showToast('Failed to save branding');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const pub = await fetch('/api/publish-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            branding: {
              name: brand.name,
              tagline: brand.tagline,
              theme: currentTheme,
              updated_at: new Date().toISOString(),
            },
            navigation_settings: currentTheme?.navigation,
            card_design: currentTheme?.card,
            published_at: new Date().toISOString(),
            version: '2.0.0',
          },
        }),
      });

      const result = await pub.json();
      if (!pub.ok) {
        throw new Error(result.error || 'Publish failed');
      }

      showToast('Published to Cloudflare! Live in ~5 minutes.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Publish failed');
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const tabs = [
    { id: 'quick-apply', label: 'Quick Apply', icon: Zap },
    { id: 'brand-identity', label: 'Brand Identity', icon: Paintbrush },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'spacing', label: 'Spacing', icon: Spacing },
    { id: 'components', label: 'Components', icon: Layout },
    { id: 'advanced', label: 'Advanced', icon: Settings },
    { id: 'export', label: 'Export', icon: FileJson },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Paintbrush className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Advanced Branding Studio</h2>
              <p className="text-xs text-slate-400">Complete design system editor</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-2 bg-cyan-500 text-white text-sm font-medium rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-300 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6 min-h-96">
        {/* Quick Apply Tab */}
        {activeTab === 'quick-apply' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Select a Preset Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advancedBrandingPresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedPreset === preset.id
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-slate-600 bg-slate-900/40 hover:border-slate-500'
                    }`}
                  >
                    <h4 className="font-semibold text-white text-sm mb-1">{preset.name}</h4>
                    <p className="text-xs text-slate-400 mb-3">{preset.description}</p>
                    <div className="flex gap-2">
                      {preset.colors && [preset.colors.primary, preset.colors.accent, preset.colors.secondary].map((color, i) => (
                        color && (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full border border-slate-600"
                            style={{ backgroundColor: color }}
                          />
                        )
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Brand Identity Tab */}
        {activeTab === 'brand-identity' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Brand Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Brand Name</label>
                <input
                  type="text"
                  value={brand.name}
                  disabled
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-600 rounded-lg text-sm text-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Tagline</label>
                <input
                  type="text"
                  value={brand.tagline}
                  disabled
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-600 rounded-lg text-sm text-slate-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && currentTheme?.colors && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Color Palette</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {Object.entries(currentTheme.colors).map(([key, value]) => (
                value && (
                  <div key={key} className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-lg border border-slate-600 mb-2"
                      style={{ backgroundColor: value }}
                    />
                    <span className="text-xs text-slate-400 font-mono text-center">{key}</span>
                    <span className="text-xs text-slate-500 font-mono">{value}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && currentTheme?.typography && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Typography Scales</h3>
              {Object.entries(currentTheme.typography.sizes).map(([size, scale]) => (
                <div key={size} className="mb-4 p-3 bg-slate-900/40 rounded-lg">
                  <div
                    style={{
                      fontSize: scale.size,
                      lineHeight: scale.lineHeight,
                    }}
                    className="text-white font-medium mb-1"
                  >
                    {size.toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-400">
                    {scale.size} / {scale.lineHeight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spacing Tab */}
        {activeTab === 'spacing' && currentTheme?.spacing && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Spacing Scale</h3>
            <div className="space-y-3">
              {Object.entries(currentTheme.spacing).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-300 w-16">{key}</span>
                  <div className="flex items-center flex-1">
                    <div
                      className="bg-cyan-500/50"
                      style={{ width: value, height: '20px' }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Components Tab */}
        {activeTab === 'components' && currentTheme && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Button Preview</h3>
              <div className="flex gap-3 flex-wrap">
                <button className="px-4 py-2 text-white font-medium rounded-lg" style={{ backgroundColor: currentTheme.colors?.primary }}>
                  Primary Button
                </button>
                <button className="px-4 py-2 font-medium rounded-lg border" style={{ borderColor: currentTheme.colors?.primary, color: currentTheme.colors?.primary }}>
                  Outline Button
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Card Preview</h3>
              <div className="p-4 rounded-lg border" style={{ borderColor: currentTheme.colors?.neutral300, backgroundColor: currentTheme.colors?.neutral50 }}>
                <h4 className="font-medium text-sm mb-2" style={{ color: currentTheme.colors?.neutral900 }}>
                  Card Title
                </h4>
                <p className="text-xs" style={{ color: currentTheme.colors?.neutral600 }}>
                  Card content with default styling
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && currentTheme && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Advanced Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-900/40 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Navigation Mode</p>
                <p className="text-sm text-white">{currentTheme.navigation?.position || 'sticky'}</p>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Card Layout</p>
                <p className="text-sm text-white">{currentTheme.card?.layout || 'grid'}</p>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Theme Category</p>
                <p className="text-sm text-white">{currentTheme.category || 'modern'}</p>
              </div>
              <div className="p-3 bg-slate-900/40 rounded-lg">
                <p className="text-xs text-slate-400 mb-2">Last Updated</p>
                <p className="text-sm text-white">{new Date(currentTheme.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && currentTheme && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Export Theme</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => copyToClipboard(JSON.stringify(currentTheme, null, 2), 'JSON')}
                className="flex items-center gap-2 p-3 bg-slate-900/40 border border-slate-600 rounded-lg hover:border-cyan-500 transition-colors"
              >
                {copied === 'JSON' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="text-sm text-slate-300">Export as JSON</span>
              </button>
              <button
                onClick={() => copyToClipboard(`export const theme = ${JSON.stringify(currentTheme, null, 2)};`, 'TypeScript')}
                className="flex items-center gap-2 p-3 bg-slate-900/40 border border-slate-600 rounded-lg hover:border-cyan-500 transition-colors"
              >
                {copied === 'TypeScript' ? <Check className="w-4 h-4 text-emerald-400" /> : <FileCode2 className="w-4 h-4" />}
                <span className="text-sm text-slate-300">Export as TypeScript</span>
              </button>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-700 max-h-64 overflow-auto">
              <pre className="text-xs text-slate-300 font-mono">{JSON.stringify(currentTheme, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save to Firebase
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          Publish to Cloudflare
        </button>
      </div>
    </div>
  );
}
