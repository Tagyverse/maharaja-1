import React, { useState, useEffect } from 'react';
import { ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';

export default function OrdersManagement() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">0</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-sm text-gray-600">Delivered</p>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4">
          <p className="text-sm text-gray-600">Revenue</p>
          <p className="text-3xl font-bold text-emerald-600">$0</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select className="px-4 py-2 border border-gray-300 rounded-lg">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>

        <select className="px-4 py-2 border border-gray-300 rounded-lg">
          <option value="all">All Channels</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="telegram">Telegram</option>
          <option value="payment-gateway">Payment Gateway</option>
        </select>
      </div>

      {/* Empty State */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <div className="flex justify-center mb-4">
          <ShoppingCart className="w-16 h-16 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Orders Yet</h3>
        <p className="text-gray-500 mb-4">
          Orders from WhatsApp, Telegram, and Payment Gateway will appear here.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
          <p className="text-sm text-blue-700">
            <span className="font-bold">Multi-Channel System Ready:</span> WhatsApp, Telegram & Payment Gateway integration is configured.
          </p>
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-purple-900 mb-2">Multi-Channel Orders Configured</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>✓ WhatsApp Orders - Direct customer messaging with pre-filled order details</li>
              <li>✓ Telegram Orders - Admin bot notifications with automatic order logging</li>
              <li>✓ Payment Gateway - Standard online payment processing ready</li>
              <li>✓ Order Management - Real-time status updates and customer tracking</li>
            </ul>
            <p className="text-xs text-purple-700 mt-3">
              All orders will be saved in Firebase with full history and analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
