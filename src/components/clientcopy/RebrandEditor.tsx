import { useState, useEffect } from 'react';
import { Paintbrush, Save, Eye, EyeOff, RotateCcw, Loader2, Check, Smartphone } from 'lucide-react';
import { getRebrandConfig, saveRebrandConfig, RebrandConfig } from '../../utils/clientCopyFirebase';
import Button from '../ui/button';
import { OrderFlowMode } from '../../contexts/ClientConfigContext';

interface RebrandEditorProps {
  clientId: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const defaultConfig: RebrandConfig = {
  logo: 'https://via.placeholder.com/200x80?text=Logo',
  favicon: 'https://via.placeholder.com/32x32?text=F',
  colors: {
    primary: '#3B82F6',
    accent: '#10B981',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      heading: 32,
      body: 14,
    },
  },
  navigation: [
    { id: '1', label: 'Home', icon: 'home', visible: true },
    { id: '2', label: 'Shop', icon: 'shopping-bag', visible: true },
    { id: '3', label: 'About', icon: 'info', visible: true },
    { id: '4', label: 'Contact', icon: 'mail', visible: true },
  ],
  termsAndConditions: 'Enter your terms and conditions here...',
  visibleSections: ['hero', 'products', 'reviews', 'newsletter', 'footer'],
  orderFlowMode: 'payment' as OrderFlowMode,
  status: 'incomplete',
  lastUpdated: new Date().toISOString(),
};

export function RebrandEditor_Component({ clientId, showToast }: RebrandEditorProps) {
  const [config, setConfig] = useState<RebrandConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const existing = await getRebrandConfig(clientId);
        if (existing) {
          setConfig(existing);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading config:', error);
        showToast('Failed to load rebrand config', 'error');
        setLoading(false);
      }
    };
    loadConfig();
  }, [clientId, showToast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveRebrandConfig(clientId, config);
      showToast('Rebrand config saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving:', error);
      showToast('Failed to save rebrand config', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setConfig(prev => ({
      ...prev,
      visibleSections: prev.visibleSections.includes(section)
        ? prev.visibleSections.filter(s => s !== section)
        : [...prev.visibleSections, section],
    }));
  };

  const toggleNavigation = (id: string) => {
    setConfig(prev => ({
      ...prev,
      navigation: prev.navigation.map(n =>
        n.id === id ? { ...n, visible: !n.visible } : n
      ),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo Section */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Paintbrush className="w-5 h-5 text-cyan-400" />
              Logo & Favicon
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Logo URL</label>
                <input
                  type="text"
                  value={config.logo}
                  onChange={e => setConfig({ ...config, logo: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Favicon URL</label>
                <input
                  type="text"
                  value={config.favicon}
                  onChange={e => setConfig({ ...config, favicon: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Colors Section */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Colors</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.colors.primary}
                      onChange={e => setConfig({
                        ...config,
                        colors: { ...config.colors, primary: e.target.value }
                      })}
                      className="w-12 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.colors.primary}
                      onChange={e => setConfig({
                        ...config,
                        colors: { ...config.colors, primary: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.colors.accent}
                      onChange={e => setConfig({
                        ...config,
                        colors: { ...config.colors, accent: e.target.value }
                      })}
                      className="w-12 h-10 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.colors.accent}
                      onChange={e => setConfig({
                        ...config,
                        colors: { ...config.colors, accent: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Typography</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Font Family</label>
                <select
                  value={config.typography.fontFamily}
                  onChange={e => setConfig({
                    ...config,
                    typography: { ...config.typography, fontFamily: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="Poppins, sans-serif">Poppins</option>
                  <option value="Playfair Display, serif">Playfair Display</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                </select>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Navigation Items</h3>
            <div className="space-y-2">
              {config.navigation.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={() => toggleNavigation(item.id)}
                    className="w-4 h-4 rounded border-slate-600 text-cyan-500 cursor-pointer"
                  />
                  <span className="flex-1 text-slate-300">{item.label}</span>
                  <span className="text-xs text-slate-500">{item.icon}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sections Visibility */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Page Sections</h3>
            <div className="space-y-2">
              {['hero', 'products', 'reviews', 'newsletter', 'footer'].map(section => (
                <div key={section} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={config.visibleSections.includes(section)}
                    onChange={() => toggleSection(section)}
                    className="w-4 h-4 rounded border-slate-600 text-cyan-500 cursor-pointer"
                  />
                  <span className="flex-1 text-slate-300 capitalize">{section}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Flow Mode */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-400" />
              Order Flow Mode
            </h3>
            <p className="text-sm text-slate-400 mb-4">Choose how customers place orders on your store</p>
            
            <div className="space-y-3">
              {[
                { value: 'whatsapp-only' as OrderFlowMode, label: 'WhatsApp Only', desc: 'Customers send orders via WhatsApp (no payment)' },
                { value: 'telegram-only' as OrderFlowMode, label: 'Quick Form', desc: 'Simple form submission, you notify via Telegram' },
                { value: 'payment' as OrderFlowMode, label: 'Full Payment', desc: 'Complete checkout with payment processing' },
              ].map(option => (
                <div
                  key={option.value}
                  onClick={() => setConfig({ ...config, orderFlowMode: option.value })}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    config.orderFlowMode === option.value
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        config.orderFlowMode === option.value
                          ? 'border-cyan-400 bg-cyan-400'
                          : 'border-slate-500'
                      }`}
                    >
                      {config.orderFlowMode === option.value && (
                        <Check className="w-2 h-2 text-slate-900" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100">{option.label}</p>
                      <p className="text-xs text-slate-400">{option.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Terms & Conditions</h3>
            <textarea
              value={config.termsAndConditions}
              onChange={e => setConfig({ ...config, termsAndConditions: e.target.value })}
              placeholder="Enter your terms and conditions..."
              rows={8}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:border-cyan-500 hover:text-cyan-400 transition-colors text-sm"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>

            {showPreview && (
              <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300">Live Preview</h3>
                
                {/* Logo Preview */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <img
                    src={config.logo}
                    alt="Logo"
                    className="max-h-16 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="80"%3E%3Crect fill="%23374151" width="200" height="80"/%3E%3Ctext x="50%" y="50%" font-family="sans-serif" font-size="16" fill="%239CA3AF" text-anchor="middle" dy=".3em"%3ELogo Preview%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>

                {/* Color Preview */}
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 font-semibold">Colors</div>
                  <div className="flex gap-2">
                    <div
                      className="flex-1 h-8 rounded-lg border border-slate-600"
                      style={{ backgroundColor: config.colors.primary }}
                    />
                    <div
                      className="flex-1 h-8 rounded-lg border border-slate-600"
                      style={{ backgroundColor: config.colors.accent }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-xs font-semibold text-amber-300 mb-1">Rebrand Status</p>
                  <p className="text-xs text-amber-200">
                    {config.status === 'complete' ? '✓ Ready to publish' : '⚠ Not complete yet'}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <button
                onClick={() => setConfig(defaultConfig)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RebrandEditor_Component;

