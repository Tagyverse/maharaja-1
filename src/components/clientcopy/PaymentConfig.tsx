import { useState, useEffect } from 'react';
import { CreditCard, Save, Eye, EyeOff, Check, Loader2, AlertCircle } from 'lucide-react';
import { getPaymentConfig, savePaymentConfig, PaymentConfig } from '../../utils/clientCopyFirebase';
import Button from '../ui/button';

interface PaymentConfigProps {
  clientId: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function PaymentConfigComponent({ clientId, showToast }: PaymentConfigProps) {
  const [config, setConfig] = useState<PaymentConfig>({
    primaryGateway: 'razorpay',
    testMode: true,
    gateways: {},
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const existing = await getPaymentConfig(clientId);
        if (existing) {
          setConfig(existing);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading config:', error);
        showToast('Failed to load payment config', 'error');
        setLoading(false);
      }
    };
    loadConfig();
  }, [clientId, showToast]);

  const handleSave = async () => {
    if (!config.primaryGateway) {
      showToast('Please select a primary payment gateway', 'error');
      return;
    }

    const gateway = config.gateways[config.primaryGateway as keyof typeof config.gateways];
    if (!gateway) {
      showToast(`Please configure ${config.primaryGateway}`, 'error');
      return;
    }

    setSaving(true);
    try {
      await savePaymentConfig(clientId, config);
      showToast('Payment config saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving:', error);
      showToast('Failed to save payment config', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateGateway = (gateway: string, field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      gateways: {
        ...prev.gateways,
        [gateway]: {
          ...(prev.gateways[gateway as keyof typeof prev.gateways] || {}),
          [field]: value,
        },
      },
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
      {/* Primary Gateway Selection */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-cyan-400" />
          Primary Payment Gateway
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['razorpay', 'stripe', 'paypal'].map(gw => (
            <button
              key={gw}
              onClick={() => setConfig({ ...config, primaryGateway: gw as any })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                config.primaryGateway === gw
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="font-semibold text-white capitalize mb-1">{gw}</div>
              <div className="text-xs text-slate-400">
                {gw === 'razorpay' && 'Recommended for India'}
                {gw === 'stripe' && 'Global payments'}
                {gw === 'paypal' && 'PayPal & credit cards'}
              </div>
              {config.primaryGateway === gw && (
                <Check className="w-5 h-5 text-cyan-400 mt-2" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Test Mode Toggle */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Test Mode</h3>
            <p className="text-sm text-slate-400 mt-1">When enabled, transactions won&apos;t be charged to real cards</p>
          </div>
          <button
            onClick={() => setConfig({ ...config, testMode: !config.testMode })}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              config.testMode ? 'bg-cyan-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                config.testMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Gateway Configurations */}
      <div className="space-y-4">
        {/* Razorpay */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Razorpay Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">API Key</label>
              <input
                type="text"
                value={config.gateways.razorpay?.apiKey || ''}
                onChange={e => updateGateway('razorpay', 'apiKey', e.target.value)}
                placeholder="rzp_live_XXXXX"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-xs text-slate-400 mt-1">Get from: Dashboard → Settings → API Keys</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">API Secret</label>
              <div className="flex gap-2">
                <input
                  type={showKeys.razorpay ? 'text' : 'password'}
                  value={config.gateways.razorpay?.apiSecret || ''}
                  onChange={e => updateGateway('razorpay', 'apiSecret', e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => setShowKeys({ ...showKeys, razorpay: !showKeys.razorpay })}
                  className="px-3 py-2 text-slate-400 hover:text-slate-200"
                >
                  {showKeys.razorpay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Keep this secret - never share publicly</p>
            </div>
          </div>
        </div>

        {/* Stripe */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Stripe Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Publishable Key</label>
              <input
                type="text"
                value={config.gateways.stripe?.publishableKey || ''}
                onChange={e => updateGateway('stripe', 'publishableKey', e.target.value)}
                placeholder="pk_live_XXXXX"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <p className="text-xs text-slate-400 mt-1">Public key - safe to share in frontend</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Secret Key</label>
              <div className="flex gap-2">
                <input
                  type={showKeys.stripe ? 'text' : 'password'}
                  value={config.gateways.stripe?.secretKey || ''}
                  onChange={e => updateGateway('stripe', 'secretKey', e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => setShowKeys({ ...showKeys, stripe: !showKeys.stripe })}
                  className="px-3 py-2 text-slate-400 hover:text-slate-200"
                >
                  {showKeys.stripe ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Keep this secret - use only on backend</p>
            </div>
          </div>
        </div>

        {/* PayPal */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">PayPal Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Client ID</label>
              <input
                type="text"
                value={config.gateways.paypal?.clientId || ''}
                onChange={e => updateGateway('paypal', 'clientId', e.target.value)}
                placeholder="AZ_XXXXX"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Secret ID</label>
              <div className="flex gap-2">
                <input
                  type={showKeys.paypal ? 'text' : 'password'}
                  value={config.gateways.paypal?.secretId || ''}
                  onChange={e => updateGateway('paypal', 'secretId', e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => setShowKeys({ ...showKeys, paypal: !showKeys.paypal })}
                  className="px-3 py-2 text-slate-400 hover:text-slate-200"
                >
                  {showKeys.paypal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 flex-1"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Payment Config
            </>
          )}
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-300">
          <p className="font-semibold mb-1">Getting your API Keys</p>
          <ul className="text-xs space-y-1 list-disc list-inside">
            <li><strong>Razorpay:</strong> Dashboard → Settings → API Keys</li>
            <li><strong>Stripe:</strong> Developers → API Keys</li>
            <li><strong>PayPal:</strong> App & Credentials → Production or Sandbox</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
