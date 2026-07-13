import { useState, useEffect } from 'react';
import { useClientConfig, OrderFlowMode } from '../contexts/ClientConfigContext';
import { getCheckoutUIConfig, getRequiredCheckoutFields, validateOrderForFlow, handleWhatsAppFlow, handleTelegramFlow } from '../utils/orderFlowManager';
import { MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import Button from '../components/ui/button';

interface CheckoutItem {
  name: string;
  quantity: number;
  price: number;
}

interface ConditionalCheckoutProps {
  items: CheckoutItem[];
  totalAmount: number;
  onSuccess?: (orderId: string) => void;
}

export default function ConditionalCheckout({ items, totalAmount, onSuccess }: ConditionalCheckoutProps) {
  const { config } = useClientConfig();
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const flowMode: OrderFlowMode = config?.orderFlowMode || 'payment';
  const uiConfig = getCheckoutUIConfig(flowMode);
  const requiredFields = getRequiredCheckoutFields(flowMode);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setError('');
      
      // Validate order
      const orderData = {
        id: `ORD-${Date.now()}`,
        ...formData,
        cartItems: items,
        totalAmount,
        flowMode,
        paymentStatus: 'pending' as const,
        orderStatus: 'placed' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const validation = validateOrderForFlow(orderData, flowMode);
      if (!validation.valid) {
        setError(validation.errors[0]);
        return;
      }

      setLoading(true);

      if (flowMode === 'whatsapp-only') {
        // Handle WhatsApp flow - redirect to WhatsApp
        const whatsappConfig = config?.whatsapp;
        if (!whatsappConfig?.businessNumber) {
          setError('WhatsApp business number not configured');
          return;
        }

        const { redirectUrl } = handleWhatsAppFlow(orderData as any, whatsappConfig.businessNumber);
        
        // Save order to Firebase first
        await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        // Redirect to WhatsApp
        setTimeout(() => {
          window.open(redirectUrl, '_blank');
          if (onSuccess) onSuccess(orderData.id);
          setStep('success');
        }, 1000);
      } else if (flowMode === 'telegram-only') {
        // Handle Telegram flow - notify admin and show confirmation
        const telegramConfig = config?.telegram;
        if (telegramConfig?.enabled && telegramConfig?.botToken && telegramConfig?.chatId) {
          await handleTelegramFlow(orderData as any, telegramConfig.botToken, telegramConfig.chatId);
        }

        // Save order
        await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        if (onSuccess) onSuccess(orderData.id);
        setStep('success');
      } else if (flowMode === 'payment') {
        // Handle Payment flow - process payment and create order
        const response = await fetch('/api/process-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...orderData,
            paymentGateway: config?.payment?.gateway,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.redirectUrl) {
            // Redirect to payment gateway
            window.location.href = result.redirectUrl;
          } else {
            if (onSuccess) onSuccess(orderData.id);
            setStep('success');
          }
        } else {
          setError('Failed to process payment');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('[v0] Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-green-300 mb-2">Order Placed Successfully!</h3>
        <p className="text-sm text-slate-300 mb-4">
          {flowMode === 'whatsapp-only'
            ? 'You will be redirected to WhatsApp to complete your order.'
            : flowMode === 'telegram-only'
            ? 'We will notify you via email shortly.'
            : 'Proceeding to payment...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-800/60 rounded-xl border border-slate-700">
      <h2 className="text-xl font-bold text-white mb-2">{uiConfig.submitButtonText}</h2>
      <p className="text-sm text-slate-400 mb-6">{uiConfig.subtitle}</p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Order Summary */}
      <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <div className="space-y-2 mb-3 pb-3 border-b border-slate-700">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm text-slate-300">
              <span>{item.name} x{item.quantity}</span>
              <span>Rs.{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-bold text-cyan-300">
          <span>Total</span>
          <span>Rs.{totalAmount}</span>
        </div>
      </div>

      {/* Customer Information Form */}
      <div className="space-y-3 mb-6">
        {requiredFields.includes('name') && (
          <input
            type="text"
            placeholder="Full Name"
            value={formData.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
          />
        )}

        {requiredFields.includes('email') && (
          <input
            type="email"
            placeholder="Email Address"
            value={formData.customerEmail}
            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
          />
        )}

        {requiredFields.includes('phone') && (
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.customerPhone}
            onChange={(e) => handleInputChange('customerPhone', e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400"
          />
        )}

        {requiredFields.includes('address') && (
          <textarea
            placeholder="Shipping Address"
            value={formData.shippingAddress}
            onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-400 resize-none"
          />
        )}
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {flowMode === 'whatsapp-only' ? 'Preparing WhatsApp...' : 'Processing...'}
          </>
        ) : (
          <>
            {flowMode === 'whatsapp-only' && <MessageCircle className="w-4 h-4" />}
            {uiConfig.submitButtonText}
          </>
        )}
      </Button>

      {/* Flow Info */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-300">
          {flowMode === 'whatsapp-only'
            ? '💬 You will be connected to WhatsApp to complete your order'
            : flowMode === 'telegram-only'
            ? '✓ Your order will be received and confirmed shortly'
            : '💳 Secure payment processing'}
        </p>
      </div>
    </div>
  );
}
