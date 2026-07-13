import { useState, useEffect } from 'react';
import { X, CheckCircle, Download, File } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';

interface PaymentSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails?: {
    orderId: string;
    totalAmount: number;
    customerName: string;
    paymentId: string;
  };
}

export default function PaymentSuccessDialog({
  isOpen,
  onClose,
  orderDetails
}: PaymentSuccessDialogProps) {
  const [billImageUrl, setBillImageUrl] = useState<string | null>(null);
  const [loadingBill, setLoadingBill] = useState(false);

  useEffect(() => {
    if (isOpen && orderDetails?.orderId) {
      loadBillImage();
    }
  }, [isOpen, orderDetails?.orderId]);

  const loadBillImage = async () => {
    if (!orderDetails?.orderId) return;
    setLoadingBill(true);
    try {
      const orderRef = ref(db, `orders/${orderDetails.orderId}`);
      const snapshot = await get(orderRef);
      if (snapshot.exists()) {
        const orderData = snapshot.val();
        if (orderData.bill_image_url) {
          setBillImageUrl(orderData.bill_image_url);
        }
      }
    } catch (error) {
      console.error('Error loading bill image:', error);
    } finally {
      setLoadingBill(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px]" onClick={onClose} />

      <div className="relative w-full max-w-[380px] bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-2xl max-h-[90vh] flex flex-col animate-[scaleIn_0.2s_ease-out]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
        >
          <X className="w-3.5 h-3.5 text-gray-500" />
        </button>

        <div className="p-6 pt-8 overflow-y-auto">
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Payment Successful</h2>
            <p className="text-sm text-gray-500">Your order has been confirmed</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="font-bold text-gray-900 font-mono">#{orderDetails?.orderId?.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer</span>
                <span className="font-semibold text-gray-900">{orderDetails?.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-bold text-gray-900 text-base">{'\u20B9'}{orderDetails?.totalAmount.toFixed(0)}</span>
              </div>
              {orderDetails?.paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment ID</span>
                  <span className="font-mono text-xs text-gray-600">{orderDetails.paymentId.slice(0, 16)}...</span>
                </div>
              )}
            </div>
          </div>

          {billImageUrl && (
            <div className="rounded-xl border border-gray-200 overflow-hidden mb-4">
              <div className="px-4 py-2.5 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
                <File className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-700">Order Invoice</span>
              </div>
              <img src={billImageUrl} alt="Invoice" className="w-full h-auto max-h-52 object-cover" />
            </div>
          )}

          {loadingBill && (
            <div className="rounded-xl p-4 border border-gray-200 flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
              <span className="text-xs text-gray-500 ml-2">Loading invoice...</span>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center mb-4">
            You'll receive a confirmation email shortly. Track your order from Orders page.
          </p>

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
