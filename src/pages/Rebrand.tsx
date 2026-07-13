import { useState, useEffect } from 'react';
import { Settings, ArrowLeft, AlertCircle, Check, Download, Save, Loader2 } from 'lucide-react';
import { brand } from '../config/brand';
import { presetThemes, getDefaultCustomTheme } from '../config/presetThemes';
import { defaultEditableSections } from '../config/editableSections';
import { defaultPaymentModes } from '../config/paymentModes';
import PresetThemeSelector from '../components/admin/PresetThemeSelector';
import CustomThemeBuilder from '../components/admin/CustomThemeBuilder';
import PaymentModesManager from '../components/admin/PaymentModesManager';
import SplashScreenEditor from '../components/admin/SplashScreenEditor';
import EditableSectionManager from '../components/admin/EditableSectionManager';
import { RebrandData, ThemeConfig, PresetTheme } from '../types/rebrandData';
import { r2DataService } from '../services/r2DataService';
import { useR2Data } from '../hooks/useR2Data';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

type TabType = 'themes' | 'splash' | 'payment' | 'policies' | 'preview' | 'export';

const defaultRebrandData: RebrandData = {
  clientName: '',
  clientId: '',
  clientEmail: '',
  clientPhone: '',
  themeType: 'preset',
  selectedPreset: 'modern-green',
  customTheme: getDefaultCustomTheme(),
  paymentModes: defaultPaymentModes,
  splashScreen: {
    enabled: true,
    title: 'Welcome',
    subtitle: 'Premium Quality',
    logoUrl: brand.logo,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#3b82f6',
    animationType: 'fade',
    duration: 3,
    autoHide: true,
  },
  sections: defaultEditableSections,
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  r2Saved: false,
  version: '1.0',
};

export default function Rebrand() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [rebrandData, setRebrandData] = useState<RebrandData>(defaultRebrandData);
  const [activeTab, setActiveTab] = useState<TabType>('themes');
  const [isSaving, setIsSaving] = useState(false);

  const { saveBranding, downloadBranding, isLoading: r2Loading } = useR2Data();

  // Load auth status
  useEffect(() => {
    const auth = sessionStorage.getItem('rebrand_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load saved data from localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const saved = localStorage.getItem('rebrand_current_data');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setRebrandData(data);
        } catch (e) {
          console.error('[Rebrand] Failed to load saved data:', e);
        }
      }
    }
  }, [isAuthenticated]);

  // Auto-save to localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        localStorage.setItem('rebrand_current_data', JSON.stringify(rebrandData));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [rebrandData, isAuthenticated]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Get password from environment or use default
    const correctPassword = import.meta.env.VITE_REBRAND_PASSWORD || 'rebrand@2024';

    if (inputPassword === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('rebrand_auth', 'true');
      setInputPassword('');
      showToast('Authentication successful!', 'success');
    } else {
      setError('Invalid password');
      showToast('Invalid password', 'error');
    }
  };

  const handleThemeSelect = (theme: PresetTheme) => {
    setRebrandData(prev => ({
      ...prev,
      themeType: 'preset',
      selectedPreset: theme.id,
      lastModified: new Date().toISOString(),
    }));
    showToast(`Theme "${theme.name}" selected`, 'success');
  };

  const handleCustomThemeUpdate = (theme: ThemeConfig) => {
    setRebrandData(prev => ({
      ...prev,
      themeType: 'custom',
      customTheme: theme,
      lastModified: new Date().toISOString(),
    }));
  };

  const handleSaveToR2 = async () => {
    if (!rebrandData.clientName || !rebrandData.clientId) {
      showToast('Please enter client name and ID', 'error');
      return;
    }

    setIsSaving(true);
    const success = await saveBranding({
      ...rebrandData,
      lastModified: new Date().toISOString(),
    });

    if (success) {
      showToast('Branding saved to R2 successfully!', 'success');
      setRebrandData(prev => ({
        ...prev,
        r2Saved: true,
        r2SyncedAt: new Date().toISOString(),
      }));
    } else {
      showToast('Failed to save to R2', 'error');
    }
    setIsSaving(false);
  };

  const handleDownloadJSON = () => {
    downloadBranding(rebrandData);
    showToast('Branding downloaded as JSON', 'success');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">Rebrand Tool</h1>
            <p className="text-sm text-slate-400 text-center mb-6">
              Complete client rebranding system. Enter your access password to continue.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Access Password</label>
                <input
                  type="password"
                  value={inputPassword}
                  onChange={e => {
                    setInputPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter password"
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                />
                {error && (
                  <div className="mt-2 flex items-center gap-2 p-2.5 bg-red-500/15 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-300" />
                    <span className="text-sm text-red-300">{error}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Access Rebrand Tool
              </button>
            </form>
          </div>
        </div>

        {/* Toast notifications */}
        <div className="fixed bottom-4 right-4 flex flex-col gap-2">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                toast.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : toast.type === 'error'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              {toast.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: TabType; label: string; icon?: string }> = [
    { id: 'themes', label: 'Themes' },
    { id: 'splash', label: 'Splash Screen' },
    { id: 'payment', label: 'Payment Modes' },
    { id: 'policies', label: 'Policies & Pages' },
    { id: 'preview', label: 'Preview' },
    { id: 'export', label: 'Export & Save' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sessionStorage.removeItem('rebrand_auth');
                window.location.href = '/';
              }}
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Rebrand Tool</h1>
              <p className="text-xs text-slate-400">Multi-Client Rebranding System</p>
            </div>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem('rebrand_auth');
              setIsAuthenticated(false);
            }}
            className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Client Info Section */}
      <div className="border-b border-slate-700 bg-slate-800/40 px-4 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Client Name</label>
            <input
              type="text"
              value={rebrandData.clientName}
              onChange={e => setRebrandData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="e.g., Client ABC"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Client ID</label>
            <input
              type="text"
              value={rebrandData.clientId}
              onChange={e => setRebrandData(prev => ({ ...prev, clientId: e.target.value }))}
              placeholder="e.g., client-001"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={rebrandData.clientEmail}
              onChange={e => setRebrandData(prev => ({ ...prev, clientEmail: e.target.value }))}
              placeholder="client@example.com"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
            <input
              type="text"
              value={rebrandData.clientPhone}
              onChange={e => setRebrandData(prev => ({ ...prev, clientPhone: e.target.value }))}
              placeholder="+91 9000000000"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-700 bg-slate-800 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'themes' && (
          <div className="space-y-8">
            <PresetThemeSelector
              selectedThemeId={rebrandData.selectedPreset}
              onSelectTheme={handleThemeSelect}
            />
            <div className="border-t border-slate-700 pt-8">
              <CustomThemeBuilder
                theme={rebrandData.customTheme}
                onUpdateTheme={handleCustomThemeUpdate}
              />
            </div>
          </div>
        )}

        {activeTab === 'splash' && (
          <SplashScreenEditor
            config={rebrandData.splashScreen}
            onUpdateConfig={config =>
              setRebrandData(prev => ({
                ...prev,
                splashScreen: config,
                lastModified: new Date().toISOString(),
              }))
            }
          />
        )}

        {activeTab === 'payment' && (
          <PaymentModesManager
            paymentModes={rebrandData.paymentModes}
            onUpdatePaymentModes={modes =>
              setRebrandData(prev => ({
                ...prev,
                paymentModes: modes,
                lastModified: new Date().toISOString(),
              }))
            }
          />
        )}

        {activeTab === 'policies' && (
          <EditableSectionManager
            sections={rebrandData.sections}
            onUpdateSections={sections =>
              setRebrandData(prev => ({
                ...prev,
                sections,
                lastModified: new Date().toISOString(),
              }))
            }
          />
        )}

        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-800 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-4">Configuration Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                <div>
                  <p className="text-slate-400">Client Name</p>
                  <p className="font-medium">{rebrandData.clientName || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Theme Type</p>
                  <p className="font-medium capitalize">{rebrandData.themeType}</p>
                </div>
                <div>
                  <p className="text-slate-400">Selected Preset</p>
                  <p className="font-medium">{rebrandData.selectedPreset || 'Custom'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Payment Modes Enabled</p>
                  <p className="font-medium">
                    {[
                      rebrandData.paymentModes.whatsapp.enabled ? 'WhatsApp' : '',
                      rebrandData.paymentModes.telegram.enabled ? 'Telegram' : '',
                      rebrandData.paymentModes.prepayment.enabled ? 'Prepayment' : '',
                    ]
                      .filter(Boolean)
                      .join(', ') || 'None'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Splash Screen</p>
                  <p className="font-medium">{rebrandData.splashScreen.enabled ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Last Modified</p>
                  <p className="font-medium">{new Date(rebrandData.lastModified).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="p-6 bg-slate-800 rounded-lg space-y-4">
              <h2 className="text-xl font-bold text-white">Export & Save Options</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleSaveToR2}
                  disabled={isSaving || r2Loading}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save to R2
                </button>

                <button
                  onClick={handleDownloadJSON}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download JSON
                </button>
              </div>

              {rebrandData.r2Saved && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300">
                    Saved to R2 at {rebrandData.r2SyncedAt ? new Date(rebrandData.r2SyncedAt).toLocaleString() : 'unknown'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : toast.type === 'error'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="line-clamp-2">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
