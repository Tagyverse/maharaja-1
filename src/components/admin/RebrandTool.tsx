import { useState, useEffect } from 'react';
import { Paintbrush, Save, UploadCloud, Copy, Check, RotateCcw, Loader2, FileCode2, Palette, Navigation, Layout } from 'lucide-react';
import { db } from '../../lib/firebase';
import { ref, get, set } from 'firebase/database';
import { brand } from '../../config/brand';
import { applyBrandColors } from '../../utils/brandTheme';
import { brandingPresets } from '../../config/brandingPresets';
import type { BrandingTheme, PublishedBrandingData } from '../../types/branding';

interface RebrandState {
  name: string;
  tagline: string;
  logo: string;
  email: string;
  phone: string;
  whatsapp: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
  };
  theme?: BrandingTheme;
}

const defaults: RebrandState = {
  name: brand.name,
  tagline: brand.tagline,
  logo: brand.logo,
  email: brand.email,
  phone: brand.phone,
  whatsapp: brand.whatsapp,
  colors: { ...brand.colors },
};

type TabType = 'basic' | 'colors' | 'presets' | 'navigation' | 'cards';

interface RebrandToolProps {
  showToast: (msg: string) => void;
}

export default function RebrandTool({ showToast }: RebrandToolProps) {
  const [state, setState] = useState<RebrandState>(defaults);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    get(ref(db, 'super_admin_config/branding'))
      .then(snap => {
        if (snap.exists()) {
          const v = snap.val();
          setState({
            ...defaults,
            ...v,
            colors: { ...defaults.colors, ...(v.colors || {}) },
          });
        }
      })
      .catch(err => console.error('Failed to load branding:', err));
  }, []);

  const updateColor = (key: keyof RebrandState['colors'], value: string) => {
    const colors = { ...state.colors, [key]: value };
    setState({ ...state, colors });
    applyBrandColors(colors);
  };

  const applyPreset = (presetId: string) => {
    const preset = brandingPresets.find(p => p.id === presetId);
    if (!preset) return;
    
    setState({
      ...state,
      colors: { ...preset.theme.colors },
      theme: preset.theme,
    });
    applyBrandColors(preset.theme.colors);
    setSelectedPreset(presetId);
    showToast(`Applied ${preset.name} preset!`);
  };

  const resetColors = () => {
    setState({ ...state, colors: { ...brand.colors } });
    applyBrandColors(brand.colors);
    setSelectedPreset(null);
    showToast('Colors reset to brand.ts defaults');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await set(ref(db, 'super_admin_config/branding'), {
        ...state,
        updated_at: new Date().toISOString(),
      });
      showToast('Branding saved to Firebase!');
    } catch (err) {
      console.error('Failed to save branding:', err);
      showToast('Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch('/api/get-published-data');
      if (!res.ok) throw new Error(`Fetch published data failed (${res.status})`);
      const current = await res.json();
      if (current.error) throw new Error(current.error);

      const merged = {
        ...current,
        branding: { ...state, updated_at: new Date().toISOString() },
        published_at: new Date().toISOString(),
      };

      const pub = await fetch('/api/publish-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: merged }),
      });
      
      const pubResult = await pub.json();
      
      if (!pub.ok) {
        throw new Error(pubResult.error || `Publish failed (${pub.status})`);
      }

      if (pubResult.warning) {
        console.warn('[REBRAND] Warning:', pubResult.warning);
        showToast(`Branding saved but: ${pubResult.warning}`);
      } else {
        showToast('Branding published to Cloudflare! Live in ~5 min.');
      }
    } catch (err) {
      console.error('[REBRAND] Publish failed:', err);
      showToast(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  const generateBrandFile = () => {
    const merged = {
      ...brand,
      name: state.name,
      tagline: state.tagline,
      logo: state.logo,
      email: state.email,
      phone: state.phone,
      whatsapp: state.whatsapp,
      colors: { ...state.colors, themeColor: state.colors.primary },
      splash: { ...brand.splash, title: state.name, subtitle: state.tagline },
      seo: { ...brand.seo, title: `${state.name} - ${state.tagline}` },
    };
    return `// ============================================================\n// BRAND CONFIG - Edit this ONE file to rebrand for any client\n// ============================================================\n\nexport const brand = ${JSON.stringify(merged, null, 2)} as const;\n\nexport type BrandConfig = typeof brand;\n`;
  };

  const copyText = (label: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    showToast(`${label} copied!`);
  };

  const colorFields: { key: keyof RebrandState['colors']; label: string }[] = [
    { key: 'primary', label: 'Primary' },
    { key: 'primaryLight', label: 'Primary Light' },
    { key: 'primaryDark', label: 'Primary Dark' },
    { key: 'accent', label: 'Accent' },
  ];

  const textFields: { key: keyof Omit<RebrandState, 'colors'>; label: string; placeholder?: string }[] = [
    { key: 'name', label: 'Brand Name' },
    { key: 'tagline', label: 'Tagline' },
    { key: 'logo', label: 'Logo URL', placeholder: 'https://...' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', placeholder: '+919876543210' },
    { key: 'whatsapp', label: 'WhatsApp', placeholder: '919876543210' },
  ];

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Paintbrush },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'presets', label: 'Presets', icon: Palette },
    { id: 'navigation', label: 'Navigation', icon: Navigation },
    { id: 'cards', label: 'Cards', icon: Layout },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Paintbrush className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Rebrand Tool</h2>
          </div>
          <span className="text-[11px] px-2 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium">
            Complete branding system
          </span>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 pb-4 border-b border-slate-700 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div>
            <p className="text-xs text-slate-400 mb-4">Edit brand identity and basic information</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {textFields.map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">{f.label}</label>
                  <input
                    type="text"
                    value={state[f.key]}
                    placeholder={f.placeholder}
                    onChange={e => setState({ ...state, [f.key]: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/60 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-slate-700 p-4 bg-slate-900/30">
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide mb-3">Live Preview</p>
              <div className="flex flex-wrap items-center gap-3">
                <button className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-dark transition-colors">Primary Button</button>
                <button className="px-4 py-2 bg-white border-2 border-brand text-brand text-sm font-semibold rounded-xl hover:bg-brand-soft transition-colors">Outline</button>
                <span className="text-brand text-sm font-semibold">{state.name || 'Brand Name'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-slate-400">Customize brand colors with live preview</p>
              <button onClick={resetColors} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                <RotateCcw className="w-3 h-3" /> Reset to Default
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {colorFields.map(f => (
                <div key={f.key} className="bg-slate-900/60 border border-slate-600 rounded-lg p-3">
                  <label className="block text-[11px] font-medium text-slate-300 mb-2">{f.label}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={state.colors[f.key]}
                      onChange={e => updateColor(f.key, e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
                    />
                    <input
                      type="text"
                      value={state.colors[f.key]}
                      onChange={e => updateColor(f.key, e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-slate-700 p-4 bg-white">
              <p className="text-[11px] text-gray-400 mb-3 font-medium uppercase tracking-wide">Color Preview</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-xl">Primary</button>
                  <button className="px-4 py-2 text-white text-sm font-semibold rounded-xl" style={{ backgroundColor: state.colors.primaryLight }}>Light</button>
                  <button className="px-4 py-2 text-white text-sm font-semibold rounded-xl" style={{ backgroundColor: state.colors.primaryDark }}>Dark</button>
                  <button className="px-4 py-2 text-white text-sm font-semibold rounded-xl" style={{ backgroundColor: state.colors.accent }}>Accent</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Presets Tab */}
        {activeTab === 'presets' && (
          <div>
            <p className="text-xs text-slate-400 mb-4">Choose from pre-designed branding presets or customize your own</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {brandingPresets.map(preset => (
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
                    <div
                      className="w-6 h-6 rounded-full border border-slate-600"
                      style={{ backgroundColor: preset.theme.colors.primary }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-slate-600"
                      style={{ backgroundColor: preset.theme.colors.accent }}
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-slate-600"
                      style={{ backgroundColor: preset.theme.colors.primaryLight }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tab */}
        {activeTab === 'navigation' && (
          <div>
            <p className="text-xs text-slate-400 mb-4">Customize navigation styling and behavior</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Navigation Background</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={state.theme?.navigation_settings.background || '#F0F5F0'}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={state.theme?.navigation_settings.background || '#F0F5F0'}
                    className="flex-1 px-3 py-2 bg-slate-900/60 border border-slate-600 rounded text-xs text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Navigation Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={state.theme?.navigation_settings.text || '#3D4A3D'}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={state.theme?.navigation_settings.text || '#3D4A3D'}
                    className="flex-1 px-3 py-2 bg-slate-900/60 border border-slate-600 rounded text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center">More navigation options available through preset selection</p>
          </div>
        )}

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <div>
            <p className="text-xs text-slate-400 mb-4">Configure product card styling and layout</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {state.theme?.card_design && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">Card Style</label>
                    <p className="text-sm text-slate-300 px-3 py-2 bg-slate-900/60 border border-slate-600 rounded">{state.theme.card_design.style}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">Image Position</label>
                    <p className="text-sm text-slate-300 px-3 py-2 bg-slate-900/60 border border-slate-600 rounded">{state.theme.card_design.imagePosition}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">Shadow Effect</label>
                    <p className="text-sm text-slate-300 px-3 py-2 bg-slate-900/60 border border-slate-600 rounded">{state.theme.card_design.shadowEffect}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">Border Radius</label>
                    <p className="text-sm text-slate-300 px-3 py-2 bg-slate-900/60 border border-slate-600 rounded">{state.theme.card_design.borderRadius}</p>
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400 text-center">Card settings are included in preset selection</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-slate-700">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 text-white text-sm font-semibold rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save to Firebase
          </button>
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            Publish to Cloudflare
          </button>
          <button
            onClick={() => copyText('brand.ts', generateBrandFile())}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-600 transition-colors"
          >
            {copied === 'brand.ts' ? <Check className="w-4 h-4 text-emerald-400" /> : <FileCode2 className="w-4 h-4" />}
            Copy brand.ts
          </button>
          <button
            onClick={() => copyText('Branding JSON', JSON.stringify(state, null, 2))}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-600 transition-colors"
          >
            {copied === 'Branding JSON' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            Copy JSON
          </button>
        </div>
      </div>

      {/* Workflow Instructions */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Complete Rebranding Workflow</h3>
        <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
          <li>Choose a preset or customize colors manually in the Presets or Colors tabs.</li>
          <li>Edit brand identity in Basic Info tab.</li>
          <li>Click <span className="text-slate-100 font-medium">Save to Firebase</span> to persist locally.</li>
          <li>Click <span className="text-slate-100 font-medium">Publish to Cloudflare</span> to deploy live (updates in ~5 min).</li>
          <li>Use <span className="text-slate-100 font-medium">Copy brand.ts</span> for new client projects.</li>
        </ol>
      </div>
    </div>
  );
}
