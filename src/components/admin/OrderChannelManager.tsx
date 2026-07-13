'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, AlertCircle, CheckCircle, Send, Loader2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { ref, get, set, update } from 'firebase/database';
import type { OrderChannel, Order } from '../../types';
import { fetchOrderChannel, saveOrderChannel, testChannelConnection, getDefaultOrderChannel } from '../../utils/businessConfigManager';

export default function OrderChannelManager() {
  // WhatsApp State
  const [whatsappConfig, setWhatsappConfig] = useState<OrderChannel>({
    type: 'whatsapp',
    enabled: false,
    phone_number: '',
    api_key: '',
    message_templates: {
      order_confirmation: 'Your order has been confirmed. Order ID: {order_id}',
      order_processing: 'Your order is being processed.',
      order_completed: 'Your order has been completed!',
      order_cancelled: 'Your order has been cancelled.'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Telegram State
  const [telegramConfig, setTelegramConfig] = useState<OrderChannel>({
    type: 'telegram',
    enabled: false,
    bot_token: '',
    chat_id: '',
    message_templates: {
      order_confirmation: 'Your order has been confirmed. Order ID: {order_id}',
      order_processing: 'Your order is being processed.',
      order_completed: 'Your order has been completed!',
      order_cancelled: 'Your order has been cancelled.'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: string; status: 'pending' | 'success' | 'failed' }>({ type: '', status: 'pending' });
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadChannelConfigs();
    loadOrders();
  }, []);

  const loadChannelConfigs = async () => {
    try {
      setLoading(true);
      const [whatsappData, telegramData] = await Promise.all([
        fetchOrderChannel('whatsapp'),
        fetchOrderChannel('telegram')
      ]);

      if (whatsappData) setWhatsappConfig(whatsappData);
      if (telegramData) setTelegramConfig(telegramData);
    } catch (error) {
      console.error('Error loading channel configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const ordersRef = ref(db, 'orders');
      const snapshot = await get(ordersRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const ordersList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key]
        })) as Order[];
        setOrders(ordersList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleConfigChange = (channel: 'whatsapp' | 'telegram', key: string, value: any) => {
    if (channel === 'whatsapp') {
      setWhatsappConfig(prev => ({ ...prev, [key]: value }));
    } else {
      setTelegramConfig(prev => ({ ...prev, [key]: value }));
    }
    setSaveMessage(null);
  };

  const handleTemplateChange = (channel: 'whatsapp' | 'telegram', templateKey: string, value: string) => {
    if (channel === 'whatsapp') {
      setWhatsappConfig(prev => ({
        ...prev,
        message_templates: { ...prev.message_templates, [templateKey]: value }
      }));
    } else {
      setTelegramConfig(prev => ({
        ...prev,
        message_templates: { ...prev.message_templates, [templateKey]: value }
      }));
    }
    setSaveMessage(null);
  };

  const handleSaveConfig = async (channel: 'whatsapp' | 'telegram') => {
    setSaving(true);
    try {
      const config = channel === 'whatsapp' ? whatsappConfig : telegramConfig;
      await saveOrderChannel(channel, config);
      setSaveMessage({
        type: 'success',
        message: `${channel.charAt(0).toUpperCase() + channel.slice(1)} configuration saved successfully!`
      });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving config:', error);
      setSaveMessage({
        type: 'error',
        message: `Failed to save ${channel} configuration`
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (channel: 'whatsapp' | 'telegram') => {
    setTesting(true);
    setTestStatus({ type: channel, status: 'pending' });
    try {
      const config = channel === 'whatsapp' ? whatsappConfig : telegramConfig;
      const isValid = await testChannelConnection(channel, config);
      setTestStatus({
        type: channel,
        status: isValid ? 'success' : 'failed'
      });
      setTimeout(() => setTestStatus({ type: '', status: 'pending' }), 3000);
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestStatus({ type: channel, status: 'failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleToggleChannel = async (channel: 'whatsapp' | 'telegram') => {
    try {
      const config = channel === 'whatsapp' ? whatsappConfig : telegramConfig;
      await saveOrderChannel(channel, { ...config, enabled: !config.enabled });
      if (channel === 'whatsapp') {
        setWhatsappConfig(prev => ({ ...prev, enabled: !prev.enabled }));
      } else {
        setTelegramConfig(prev => ({ ...prev, enabled: !prev.enabled }));
      }
      setSaveMessage({
        type: 'success',
        message: `${channel} channel ${!config.enabled ? 'enabled' : 'disabled'}`
      });
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (error) {
      console.error('Error toggling channel:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = ref(db, `orders/${orderId}`);
      await update(orderRef, {
        status: newStatus,
        updated_at: new Date().toISOString()
      });
      await loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Loading order channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {saveMessage && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${saveMessage.type === 'success' ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
          {saveMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <p className={saveMessage.type === 'success' ? 'text-green-200' : 'text-red-200'}>{saveMessage.message}</p>
        </div>
      )}

      {/* Channel Toggle */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Order Notification Channels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border-2 border-slate-700 hover:border-cyan-400 cursor-pointer transition-colors"
            onClick={() => setActiveChannel('whatsapp')}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-50">WhatsApp</h4>
                <p className="text-sm text-slate-400">Send order updates via WhatsApp</p>
              </div>
              <input
                type="checkbox"
                checked={whatsappConfig.enabled}
                onChange={() => handleToggleChannel('whatsapp')}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 rounded accent-cyan-400"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg border-2 border-slate-700 hover:border-cyan-400 cursor-pointer transition-colors"
            onClick={() => setActiveChannel('telegram')}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-50">Telegram Bot</h4>
                <p className="text-sm text-slate-400">Send order updates via Telegram</p>
              </div>
              <input
                type="checkbox"
                checked={telegramConfig.enabled}
                onChange={() => handleToggleChannel('telegram')}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 rounded accent-cyan-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Configuration */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-cyan-400">WhatsApp Configuration</h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
          <input
            type="tel"
            value={whatsappConfig.phone_number || ''}
            onChange={(e) => handleConfigChange('whatsapp', 'phone_number', e.target.value)}
            placeholder="e.g., +1234567890"
            className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
          <p className="text-xs text-slate-400 mt-1">Include country code (e.g., +1 for USA)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">API Key</label>
          <input
            type="password"
            value={whatsappConfig.api_key || ''}
            onChange={(e) => handleConfigChange('whatsapp', 'api_key', e.target.value)}
            placeholder="Your WhatsApp API key"
            className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-slate-300">Message Templates</h4>
          {Object.entries(whatsappConfig.message_templates).map(([key, template]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-300 mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
              <textarea
                value={template}
                onChange={(e) => handleTemplateChange('whatsapp', key, e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400 resize-none h-16 text-sm"
                placeholder="Message template"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleTestConnection('whatsapp')}
            disabled={testing || !whatsappConfig.phone_number || !whatsappConfig.api_key}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-50 font-medium transition-colors"
          >
            {testing && testStatus.type === 'whatsapp' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Test Connection
              </>
            )}
          </button>
          {testStatus.type === 'whatsapp' && (
            testStatus.status === 'success' ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-900/30 border border-green-700">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-200 text-sm">Connection valid</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/30 border border-red-700">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-200 text-sm">Connection failed</span>
              </div>
            )
          )}
        </div>

        <button
          onClick={() => handleSaveConfig('whatsapp')}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors"
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
        </button>
      </div>

      {/* Telegram Configuration */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-cyan-400">Telegram Bot Configuration</h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Bot Token</label>
          <input
            type="password"
            value={telegramConfig.bot_token || ''}
            onChange={(e) => handleConfigChange('telegram', 'bot_token', e.target.value)}
            placeholder="Your Telegram bot token"
            className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
          <p className="text-xs text-slate-400 mt-1">Get this from BotFather on Telegram (@BotFather)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Chat ID</label>
          <input
            type="text"
            value={telegramConfig.chat_id || ''}
            onChange={(e) => handleConfigChange('telegram', 'chat_id', e.target.value)}
            placeholder="Your Telegram chat ID"
            className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-slate-300">Message Templates</h4>
          {Object.entries(telegramConfig.message_templates).map(([key, template]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-300 mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
              <textarea
                value={template}
                onChange={(e) => handleTemplateChange('telegram', key, e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400 resize-none h-16 text-sm"
                placeholder="Message template"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleTestConnection('telegram')}
            disabled={testing || !telegramConfig.bot_token || !telegramConfig.chat_id}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-50 font-medium transition-colors"
          >
            {testing && testStatus.type === 'telegram' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Test Connection
              </>
            )}
          </button>
          {testStatus.type === 'telegram' && (
            testStatus.status === 'success' ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-900/30 border border-green-700">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-200 text-sm">Connection valid</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/30 border border-red-700">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-200 text-sm">Connection failed</span>
              </div>
            )
          )}
        </div>

        <button
          onClick={() => handleSaveConfig('telegram')}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors"
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
        </button>
      </div>

      {/* Recent Orders */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Recent Orders</h3>
        
        {orders.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-2 text-slate-300 font-medium">Order ID</th>
                  <th className="text-left py-2 px-2 text-slate-300 font-medium">Customer</th>
                  <th className="text-left py-2 px-2 text-slate-300 font-medium">Amount</th>
                  <th className="text-left py-2 px-2 text-slate-300 font-medium">Channel</th>
                  <th className="text-left py-2 px-2 text-slate-300 font-medium">Status</th>
                  <th className="text-left py-2 px-2 text-slate-300 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="py-2 px-2 text-slate-300 font-mono text-xs">{order.id.substring(0, 8)}</td>
                    <td className="py-2 px-2 text-slate-300">{order.customer_name}</td>
                    <td className="py-2 px-2 text-slate-300">${order.amount.toFixed(2)}</td>
                    <td className="py-2 px-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-slate-700 text-slate-200 capitalize">
                        {order.channel}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="px-2 py-1 rounded text-xs bg-slate-700 border border-slate-600 text-slate-300 focus:outline-none focus:border-cyan-400"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <button className="text-cyan-400 hover:text-cyan-300 text-xs font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
