'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, CreditCard, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { db } from '../../lib/firebase';
import { ref, get, set } from 'firebase/database';

interface OrderChannelConfig {
  activeChannel: 'whatsapp' | 'telegram' | 'payment';
  whatsapp: {
    enabled: boolean;
    apiKey: string;
    phoneNumber: string;
    messageTemplate: string;
  };
  telegram: {
    enabled: boolean;
    botToken: string;
    chatId: string;
    notificationTemplate: string;
  };
  payment: {
    enabled: boolean;
    gatewayType: string;
  };
}

const defaultConfig: OrderChannelConfig = {
  activeChannel: 'payment',
  whatsapp: {
    enabled: false,
    apiKey: '',
    phoneNumber: '',
    messageTemplate: 'Your order {ORDER_ID} has been placed. Total: {TOTAL}. Status: {STATUS}',
  },
  telegram: {
    enabled: false,
    botToken: '',
    chatId: '',
    notificationTemplate: '📦 New Order: {ORDER_ID}\nTotal: {TOTAL}\nCustomer: {CUSTOMER_NAME}',
  },
  payment: {
    enabled: true,
    gatewayType: 'standard',
  },
};

export default function OrderChannelsManager() {
  const [config, setConfig] = useState<OrderChannelConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const configRef = ref(db, 'admin_config/order_channels');
      const snapshot = await get(configRef);
      if (snapshot.exists()) {
        setConfig(snapshot.val());
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading order channels config:', error);
      setLoading(false);
    }
  };

  const validateConfig = () => {
    const newErrors: Record<string, string> = {};

    if (config.activeChannel === 'whatsapp') {
      if (!config.whatsapp.apiKey.trim()) {
        newErrors.whatsappApiKey = 'WhatsApp API Key is required';
      }
      if (!config.whatsapp.phoneNumber.trim()) {
        newErrors.whatsappPhone = 'Phone number is required';
      }
    }

    if (config.activeChannel === 'telegram') {
      if (!config.telegram.botToken.trim()) {
        newErrors.telegramToken = 'Telegram Bot Token is required';
      }
      if (!config.telegram.chatId.trim()) {
        newErrors.telegramChatId = 'Telegram Chat ID is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateConfig()) {
      setMessage('');
      return;
    }

    setSaving(true);
    try {
      const configRef = ref(db, 'admin_config/order_channels');
      await set(configRef, config);
      setMessage('Order channels configuration saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage('Error saving configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChannelChange = (channel: 'whatsapp' | 'telegram' | 'payment') => {
    setConfig({ ...config, activeChannel: channel });
    setErrors({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex items-center gap-4 mb-3">
          <Send className="w-8 h-8 sm:w-10 sm:h-10" />
          <h2 className="text-2xl sm:text-3xl font-bold">Order Notification Channels</h2>
        </div>
        <p className="text-purple-100">Configure how customers receive order confirmations and updates. Only ONE channel can be active at a time.</p>
      </div>

      {/* Channel Selection */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          Select Active Channel
        </h3>
        <p className="text-sm text-gray-600 mb-4">Only one notification channel can be active. Choose the one you want to use:</p>

        <div className="grid gap-4">
          {/* WhatsApp Option */}
          <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition">
            <input
              type="radio"
              name="channel"
              value="whatsapp"
              checked={config.activeChannel === 'whatsapp'}
              onChange={() => handleChannelChange('whatsapp')}
              className="w-4 h-4 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-gray-900">WhatsApp</span>
              </div>
              <p className="text-sm text-gray-600">Send order details via WhatsApp message to customer</p>
            </div>
          </label>

          {/* Telegram Option */}
          <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition">
            <input
              type="radio"
              name="channel"
              value="telegram"
              checked={config.activeChannel === 'telegram'}
              onChange={() => handleChannelChange('telegram')}
              className="w-4 h-4 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Send className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-900">Telegram</span>
              </div>
              <p className="text-sm text-gray-600">Admin receives order notifications via Telegram bot</p>
            </div>
          </label>

          {/* Payment Gateway Option */}
          <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition">
            <input
              type="radio"
              name="channel"
              value="payment"
              checked={config.activeChannel === 'payment'}
              onChange={() => handleChannelChange('payment')}
              className="w-4 h-4 mt-1"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-gray-900">Standard Payment Gateway</span>
              </div>
              <p className="text-sm text-gray-600">Use normal checkout flow with payment processing</p>
            </div>
          </label>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Configure Active Channel</h3>

        {config.activeChannel === 'whatsapp' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp API Key</label>
              <input
                type="password"
                value={config.whatsapp.apiKey}
                onChange={(e) => setConfig({
                  ...config,
                  whatsapp: { ...config.whatsapp, apiKey: e.target.value }
                })}
                placeholder="Enter your WhatsApp API key"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.whatsappApiKey ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.whatsappApiKey && <p className="text-sm text-red-500 mt-1">{errors.whatsappApiKey}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone Number</label>
              <input
                type="tel"
                value={config.whatsapp.phoneNumber}
                onChange={(e) => setConfig({
                  ...config,
                  whatsapp: { ...config.whatsapp, phoneNumber: e.target.value }
                })}
                placeholder="+1234567890"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.whatsappPhone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.whatsappPhone && <p className="text-sm text-red-500 mt-1">{errors.whatsappPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Template</label>
              <textarea
                value={config.whatsapp.messageTemplate}
                onChange={(e) => setConfig({
                  ...config,
                  whatsapp: { ...config.whatsapp, messageTemplate: e.target.value }
                })}
                placeholder="Use {ORDER_ID}, {TOTAL}, {STATUS} as placeholders"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-2">Available variables: {'{ORDER_ID}'}, {'{TOTAL}'}, {'{STATUS}'}</p>
            </div>
          </div>
        )}

        {config.activeChannel === 'telegram' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telegram Bot Token</label>
              <input
                type="password"
                value={config.telegram.botToken}
                onChange={(e) => setConfig({
                  ...config,
                  telegram: { ...config.telegram, botToken: e.target.value }
                })}
                placeholder="Enter your Telegram bot token"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.telegramToken ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.telegramToken && <p className="text-sm text-red-500 mt-1">{errors.telegramToken}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Chat ID</label>
              <input
                type="text"
                value={config.telegram.chatId}
                onChange={(e) => setConfig({
                  ...config,
                  telegram: { ...config.telegram, chatId: e.target.value }
                })}
                placeholder="Enter Telegram chat ID where notifications will be sent"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.telegramChatId ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.telegramChatId && <p className="text-sm text-red-500 mt-1">{errors.telegramChatId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notification Template</label>
              <textarea
                value={config.telegram.notificationTemplate}
                onChange={(e) => setConfig({
                  ...config,
                  telegram: { ...config.telegram, notificationTemplate: e.target.value }
                })}
                placeholder="Use {ORDER_ID}, {TOTAL}, {CUSTOMER_NAME} as placeholders"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-2">Available variables: {'{ORDER_ID}'}, {'{TOTAL}'}, {'{CUSTOMER_NAME}'}</p>
            </div>
          </div>
        )}

        {config.activeChannel === 'payment' && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">Standard Payment Gateway</h4>
                  <p className="text-sm text-green-800">Orders will be processed through the standard payment gateway with normal checkout flow. Customers will receive email confirmations.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Message */}
      {message && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">{message}</p>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Order Channel Configuration
          </>
        )}
      </button>
    </div>
  );
}
