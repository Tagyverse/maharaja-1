import { useState, useEffect } from 'react';
import { Paintbrush, Save, UploadCloud, Copy, Check, RotateCcw, Loader2, FileCode2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { ref, get, set } from 'firebase/database';
import { brand } from '../../config/brand';
import { applyBrandColors } from '../../utils/brandTheme';

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

interface RebrandToolProps {
  showToast: (msg: string) => void;
}

export default function RebrandTool({ showToast }: RebrandToolProps) {
  const [state, setState] = useState<RebrandState>(defaults);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

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

  const resetColors = () => {
    setState({ ...state, colors: { ...brand.colors } });
    applyBrandColors(brand.colors);
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

  return (
    <div className="space-y-5">
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <Paintbrush className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Rebrand Tool</h2>
          </div>
          <span className="text-[11px] px-2 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium">
            10-minute rebrand
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Edit identity and theme, preview live, save to Firebase, publish to Cloudflare, or export a ready-to-paste brand.ts for a new client.
        </p>

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

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Theme Colors (live preview)</h3>
          <button onClick={resetColors} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
            <RotateCcw className="w-3 h-3" /> Reset
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

        <div className="rounded-lg border border-slate-700 p-4 mb-6 bg-white">
          <p className="text-[11px] text-gray-400 mb-3 font-medium uppercase tracking-wide">Live Preview</p>
          <div className="flex flex-wrap items-center gap-3">
            <button className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-dark transition-colors">Primary Button</button>
            <button className="px-4 py-2 bg-white border-2 border-brand text-brand text-sm font-semibold rounded-xl hover:bg-brand-soft transition-colors">Outline</button>
            <span className="px-3 py-1 bg-brand-light text-brand-dark text-xs font-medium rounded-full">Badge</span>
            <span className="text-brand text-sm font-semibold">{state.name || 'Brand Name'}</span>
            <div className="px-3 py-2 bg-brand-soft border border-brand-soft rounded-lg text-xs text-gray-700">Soft surface</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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

      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">10-Minute Rebrand Checklist</h3>
        <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside">
          <li>Copy this project to a new repo for the client.</li>
          <li>Edit fields and colors above, then click <span className="text-slate-100 font-medium">Copy brand.ts</span> and paste over <span className="font-mono text-cyan-300">src/config/brand.ts</span>.</li>
          <li>Update the Firebase and Cloudflare sections in brand.ts with the client's project credentials.</li>
          <li>Use the <span className="text-slate-100 font-medium">.env</span> and <span className="text-slate-100 font-medium">wrangler</span> buttons in the header to copy deploy configs.</li>
          <li>Deploy to Cloudflare Pages — done. Remote tweaks later via <span className="text-slate-100 font-medium">Publish to Cloudflare</span> (no redeploy needed).</li>
        </ol>
      </div>
    </div>
  );
}
