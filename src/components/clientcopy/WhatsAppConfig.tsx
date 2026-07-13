import { useState, useEffect } from 'react';
import { MessageCircle, Save, Loader2, AlertCircle, Send, Copy, Check } from 'lucide-react';
import { getWhatsAppConfig, saveWhatsAppConfig, WhatsAppConfig } from '../../utils/clientCopyFirebase';
import Button from '../ui/button';

interface WhatsAppConfigProps {
  clientId: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_MESSAGE_TEMPLATE = 'Hi! I want to know more about your products. Order ID: {orderId}, Total: {total}';

export default function WhatsAppConfigComponent({ clientId, showToast }: WhatsAppConfigProps) {
  const [config, setConfig] = useState<WhatsAppConfig>({
    businessNumber: '',
    prePaymentEnabled: true,
    postPaymentEnabled: true,
    messageTemplate: DEFAULT_MESSAGE_TEMPLATE,
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const existing = await getWhatsAppConfig(clientId);
        if (existing) {
          setConfig(existing);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading config:', error);
        showToast('Failed to load WhatsApp config', 'error');
        setLoading(false);
      }
    };
    loadConfig();
  }, [clientId, showToast]);

  const handleSave = async () => {
    if (!config.businessNumber) {
      showToast('Please enter your business WhatsApp number', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveWhatsAppConfig(clientId, config);
      showToast('WhatsApp config saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving:', error);
      showToast('Failed to save WhatsApp config', 'error');
    } finally {
      setSaving(false);
    }
  };

  const generateWhatsAppLink = (): string => {
    const message = encodeURIComponent('Hi! I&apos;m interested in your products.');
    return `https://wa.me/${config.businessNumber}?text=${message}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generateWhatsAppLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('WhatsApp link copied!', 'success');
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
      {/* Business Number */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-400" />
          Business WhatsApp Number
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">WhatsApp Number (E.164 Format)</label>
            <input
              type="tel"
              value={config.businessNumber}
              onChange={e => setConfig({ ...config, businessNumber: e.target.value })}
              placeholder="+919876543210"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-xs text-slate-400 mt-2">
              Format: +{'{country code}'}{'{phone number}'}. Example: +919876543210 (for India)
            </p>
          </div>

          {/* Test Link */}
          {config.businessNumber && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-xs font-semibold text-green-300 mb-2">Test WhatsApp Link</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generateWhatsAppLink()}
                  readOnly
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-xs text-slate-300 font-mono"
                />
                <button
                  onClick={copyLink}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pre-Payment Option */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Pre-Payment Contact</h3>
              <p className="text-xs text-slate-400 mt-1">Show WhatsApp button on checkout before payment</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, prePaymentEnabled: !config.prePaymentEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                config.prePaymentEnabled ? 'bg-green-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.prePaymentEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="text-xs text-slate-400">
            {config.prePaymentEnabled ? (
              <p>✓ Customers can contact you before making payment</p>
            ) : (
              <p>✗ Pre-payment contact disabled</p>
            )}
          </div>
        </div>

        {/* Post-Payment Option */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Post-Payment Contact</h3>
              <p className="text-xs text-slate-400 mt-1">Redirect to WhatsApp after successful payment</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, postPaymentEnabled: !config.postPaymentEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                config.postPaymentEnabled ? 'bg-green-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.postPaymentEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="text-xs text-slate-400">
            {config.postPaymentEnabled ? (
              <p>✓ Customer redirected to WhatsApp after payment success</p>
            ) : (
              <p>✗ Post-payment redirect disabled</p>
            )}
          </div>
        </div>
      </div>

      {/* Message Template */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Message Template</h3>
        <div className="space-y-4">
          <textarea
            value={config.messageTemplate}
            onChange={e => setConfig({ ...config, messageTemplate: e.target.value })}
            placeholder="Enter message template..."
            rows={4}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
          />
          <div className="text-xs text-slate-400">
            <p className="font-semibold mb-2">Available variables:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>{'{'} orderId {'}'} - Customer&apos;s order ID</li>
              <li>{'{'} total {'}'} - Order total amount</li>
              <li>{'{'} items {'}'} - Number of items</li>
              <li>{'{'} customerName {'}'} - Customer&apos;s name</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview */}
      {config.businessNumber && (
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
          <div className="space-y-3">
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-400 mb-2">When customer clicks button:</p>
              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Contact via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

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
              Save WhatsApp Config
            </>
          )}
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-green-300">
          <p className="font-semibold mb-1">How WhatsApp Links Work</p>
          <p className="text-xs">When enabled, your WhatsApp number will be available to customers. They can contact you directly from the checkout page or order confirmation page.</p>
        </div>
      </div>
    </div>
  );
}
