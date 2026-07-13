import { CheckCircle, Package, X } from 'lucide-react';
import { useEffect } from 'react';

interface OrderConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails?: {
    orderId: string;
    totalAmount: number;
    customerName: string;
  };
}

export default function OrderConfirmationDialog({ isOpen, onClose, orderDetails }: OrderConfirmationDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" onClick={onClose} />

      <div className="relative w-full max-w-[360px] bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>

        <div className="p-6 pt-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">Thank You!</h2>
          <p className="text-sm text-gray-600 mb-5">
            Your order is confirmed and will be processed shortly.
          </p>

          {orderDetails && (
            <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-200 text-left">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Order Details</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-semibold text-gray-900">{orderDetails.orderId.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-gray-900">{'\u20B9'}{orderDetails.totalAmount.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-semibold text-gray-900">{orderDetails.customerName}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-green-100 text-gray-900 py-3 rounded-xl font-bold text-sm hover:bg-green-200 transition-colors border border-green-300"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
