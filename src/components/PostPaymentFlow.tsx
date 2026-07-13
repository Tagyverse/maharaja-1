import { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle, Loader2, AlertCircle, Copy, Check } from 'lucide-react';
import { getWhatsAppConfig, getPaymentConfig } from '../utils/clientCopyFirebase';

interface PostPaymentFlowProps {
  clientId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  cartTotal: number;
  itemsCount: number;
  onClose: () => void;
}

export default function PostPaymentFlow({
  clientId,
  orderId,
  customerName,
  customerEmail,
  cartTotal,
  itemsCount,
  onClose,
}: PostPaymentFlowProps) {
  const [whatsappConfig, setWhatsappConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getWhatsAppConfig(clientId);
        setWhatsappConfig(config);
        setLoading(false);
      } catch (error) {
        console.error('Error loading WhatsApp config:', error);
        setLoading(false);
      }
    };
    loadConfig();
  }, [clientId]);

  const generateWhatsAppMessage = (): string => {
    const template = whatsappConfig?.messageTemplate || 
      `Hi! I just placed an order {orderId}. Order Total: ₹{total}. {items} items. Thanks!`;
    
    return template
      .replace('{orderId}', orderId)
      .replace('{total}', cartTotal.toString())
      .replace('{items}', itemsCount.toString())
      .replace('{customerName}', customerName);
  };

  const getWhatsAppLink = (): string => {
    if (!whatsappConfig?.businessNumber) return '';
    const message = encodeURIComponent(generateWhatsAppMessage());
    return `https://wa.me/${whatsappConfig.businessNumber}?text=${message}`;
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-xl">
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Order Placed!</h1>
          <p className="text-gray-600">Thank you for your purchase.</p>
        </div>

        {/* Order Details */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Order ID</span>
            <div className="flex items-center gap-2">
              <code className="font-mono text-sm font-semibold text-gray-900">{orderId}</code>
              <button
                onClick={copyOrderId}
                className="p-1 hover:bg-blue-100 rounded transition-colors"
                title="Copy order ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Amount</span>
            <span className="font-semibold text-gray-900">₹{cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Items</span>
            <span className="font-semibold text-gray-900">{itemsCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Confirmation</span>
            <span className="font-semibold text-gray-900">{customerEmail}</span>
          </div>
        </div>

        {/* WhatsApp Option */}
        {whatsappConfig?.postPaymentEnabled && whatsappConfig?.businessNumber && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center font-medium">
              Want to track your order?
            </p>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Contact via WhatsApp
            </a>
            <p className="text-xs text-gray-500 text-center">
              Click to chat with us about your order via WhatsApp
            </p>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <div className="flex gap-2 items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-amber-900">What's Next?</p>
              <ul className="text-xs text-amber-800 list-disc list-inside space-y-0.5">
                <li>Check your email for order confirmation</li>
                <li>We'll dispatch your order within 2-3 days</li>
                <li>You'll receive tracking info via SMS/Email</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => {
              // Download invoice functionality
              console.log('Download invoice for order:', orderId);
            }}
            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors"
          >
            Download Invoice
          </button>
        </div>

        {/* Support Info */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>Need help? Contact us via</p>
          <div className="flex justify-center gap-4">
            <a href={`mailto:${customerEmail}`} className="hover:text-blue-600 underline">
              Email
            </a>
            {whatsappConfig?.businessNumber && (
              <a
                href={`https://wa.me/${whatsappConfig.businessNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-green-600 underline"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
