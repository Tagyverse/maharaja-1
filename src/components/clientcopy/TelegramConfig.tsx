import { useState, useEffect } from 'react';
import { Send, Save, Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react';
import { getTelegramConfig, saveTelegramConfig, TelegramConfig } from '../../utils/clientCopyFirebase';
import Button from '../ui/button';

interface TelegramConfigProps {
  clientId: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const EVENT_TYPES = [
  { id: 'new_order', label: 'New Orders', description: 'Alert when a customer places an order' },
  { id: 'payment_received', label: 'Payment Received', description: 'Alert when payment is successful' },
  { id: 'payment_failed', label: 'Payment Failed', description: 'Alert when payment fails' },
  { id: 'order_status_change', label: 'Order Status Changes', description: 'Alert when order status is updated' },
  { id: 'customer_message', label: 'Customer Messages', description: 'Alert when customer sends a message' },
  { id: 'system_alerts', label: 'System Alerts', description: 'General system notifications' },
];

export default function TelegramConfigComponent({ clientId, showToast }: TelegramConfigProps) {
  const [config, setConfig] = useState<TelegramConfig>({
    botToken: '',
    chatId: '',
    enabledEvents: ['new_order', 'payment_received', 'payment_failed'],
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const existing = await getTelegramConfig(clientId);
        if (existing) {
          setConfig(existing);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading config:', error);
        showToast('Failed to load Telegram config', 'error');
        setLoading(false);
      }
    };
    loadConfig();
  }, [clientId, showToast]);

  const handleSave = async () => {
    if (!config.botToken || !config.chatId) {
      showToast('Please enter Bot Token and Chat ID', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveTelegramConfig(clientId, config);
      showToast('Telegram config saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving:', error);
      showToast('Failed to save Telegram config', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleEvent = (eventId: string) => {
    setConfig(prev => ({
      ...prev,
      enabledEvents: prev.enabledEvents.includes(eventId)
        ? prev.enabledEvents.filter(e => e !== eventId)
        : [...prev.enabledEvents, eventId],
    }));
  };

  const sendTestNotification = async () => {
    if (!config.botToken || !config.chatId) {
      showToast('Please save your Telegram config first', 'error');
      return;
    }

    setTestingNotification(true);
    try {
      const response = await fetch('/api/send-telegram-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: config.botToken,
          chatId: config.chatId,
          message: `🧪 Test notification from ${clientId}. Your Telegram bot is configured correctly!`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      showToast('Test notification sent! Check your Telegram.', 'success');
    } catch (error) {
      console.error('Error sending test:', error);
      showToast('Failed to send test notification. Check your credentials.', 'error');
    } finally {
      setTestingNotification(false);
    }
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
      {/* Setup Instructions */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Setup Instructions</h3>
        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex gap-3">
            <div className="bg-cyan-500/20 text-cyan-300 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
            <div>
              <p className="font-semibold">Create a Bot with BotFather</p>
              <p className="text-xs text-slate-400 mt-1">Open Telegram, search for @BotFather, and follow the prompts to create a new bot</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-cyan-500/20 text-cyan-300 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
            <div>
              <p className="font-semibold">Get Your Bot Token</p>
              <p className="text-xs text-slate-400 mt-1">BotFather will give you a token like: 123456789:ABCdefGHIjklmnoPQRstuvWXYZ</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-cyan-500/20 text-cyan-300 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
            <div>
              <p className="font-semibold">Get Your Chat ID</p>
              <p className="text-xs text-slate-400 mt-1">Create a Telegram group, add your bot, then visit: https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="bg-cyan-500/20 text-cyan-300 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</div>
            <div>
              <p className="font-semibold">Enter Your Credentials</p>
              <p className="text-xs text-slate-400 mt-1">Paste the token and chat ID below, then select which events you want notifications for</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bot Token */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Bot Credentials</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Bot Token</label>
            <div className="flex gap-2">
              <input
                type={showToken ? 'text' : 'password'}
                value={config.botToken}
                onChange={e => setConfig({ ...config, botToken: e.target.value })}
                placeholder="123456789:ABCdefGHIjklmnoPQRstuvWXYZ"
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono text-sm"
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="px-3 py-2 text-slate-400 hover:text-slate-200"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Keep this secret - never share publicly</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Chat ID</label>
            <input
              type="text"
              value={config.chatId}
              onChange={e => setConfig({ ...config, chatId: e.target.value })}
              placeholder="-1001234567890"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <p className="text-xs text-slate-400 mt-1">Group ID or personal chat ID where notifications will be sent</p>
          </div>
        </div>
      </div>

      {/* Event Selection */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Events</h3>
        <p className="text-sm text-slate-400 mb-4">Select which events should trigger admin notifications</p>
        <div className="space-y-3">
          {EVENT_TYPES.map(event => (
            <div key={event.id} className="flex items-start gap-3 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={config.enabledEvents.includes(event.id)}
                onChange={() => toggleEvent(event.id)}
                className="w-4 h-4 rounded border-slate-600 text-cyan-500 cursor-pointer mt-1 flex-shrink-0"
              />
              <div className="flex-1">
                <p className="font-medium text-white">{event.label}</p>
                <p className="text-xs text-slate-400">{event.description}</p>
              </div>
              {config.enabledEvents.includes(event.id) && (
                <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
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
              Save Telegram Config
            </>
          )}
        </Button>
        <button
          onClick={sendTestNotification}
          disabled={testingNotification || !config.botToken || !config.chatId}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testingNotification ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Test
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-purple-300">
          <p className="font-semibold mb-1">Admin Notifications</p>
          <p className="text-xs">Once configured, you&apos;ll receive Telegram notifications for all selected events. This helps you stay updated on orders and customer activity in real-time.</p>
        </div>
      </div>
    </div>
  );
}
