import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { multiChannelOrderHandler } from '../utils/multiChannelOrderHandler';
import type { OrderItem } from '../types/orders';

interface OrderChannelSelectorProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  onClose: () => void;
  onOrderPlaced: (channel: string) => void;
  adminWhatsAppNumber?: string;
  adminBotToken?: string;
  adminChatId?: string;
}

export default function OrderChannelSelector({
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  city,
  state,
  zipCode,
  items,
  subtotal,
  tax,
  shipping,
  onClose,
  onOrderPlaced,
  adminWhatsAppNumber = '919876543210',
  adminBotToken,
  adminChatId,
}: OrderChannelSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWhatsAppOrder = async () => {
    try {
      setLoading(true);
      setError('');
      
      await multiChannelOrderHandler.handleWhatsAppOrder(
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        city,
        state,
        zipCode,
        items,
        subtotal,
        tax,
        shipping,
        adminWhatsAppNumber
      );
      
      onOrderPlaced('whatsapp');
    } catch (err) {
      setError('Failed to create WhatsApp order. Please try again.');
      setLoading(false);
    }
  };

  const handleTelegramOrder = async () => {
    try {
      setLoading(true);
      setError('');
      
      await multiChannelOrderHandler.handleTelegramOrder(
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        city,
        state,
        zipCode,
        items,
        subtotal,
        tax,
        shipping,
        adminBotToken,
        adminChatId
      );
      
      onOrderPlaced('telegram');
    } catch (err) {
      setError('Failed to create Telegram order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8">
        <h2 className="text-2xl font-bold mb-2">Choose Order Channel</h2>
        <p className="text-gray-600 mb-6">Select how you would like to place your order</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleWhatsAppOrder}
            disabled={loading}
            className="border-2 border-green-500 rounded-xl p-6 text-left hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-green-700 mb-1">WhatsApp Order</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Share your order details with us via WhatsApp. We&apos;ll confirm and arrange delivery.
                </p>
                <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full w-fit">
                  Quick & Easy
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={handleTelegramOrder}
            disabled={loading || !adminBotToken}
            className="border-2 border-blue-500 rounded-xl p-6 text-left hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-blue-700 mb-1">Telegram Order</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Place order via Telegram. We&apos;ll notify admin and call you back soon.
                </p>
                <div className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full w-fit">
                  We&apos;ll Call Back
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-bold mb-3">Order Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">${shipping.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-green-600">${(subtotal + tax + shipping).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Payment Gateway support coming soon! For now, you can place orders via WhatsApp or Telegram. We handle payments after order confirmation.
          </p>
        </div>

        <button
          onClick={onClose}
          disabled={loading}
          className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
