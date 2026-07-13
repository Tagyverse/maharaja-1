import { X, XCircle } from 'lucide-react';

interface PaymentCancelledDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export default function PaymentCancelledDialog({
  isOpen,
  onClose,
  onRetry
}: PaymentCancelledDialogProps) {
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

        <div className="p-6 pt-8">
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Payment Cancelled</h2>
            <p className="text-sm text-gray-500">No charges were made to your account</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-5">
            <p className="text-xs font-bold text-gray-700 mb-2">What you can do:</p>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>Try again with a different payment method</li>
              <li>Review your cart and shipping details</li>
              <li>Continue shopping for more items</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={onRetry}
              className="w-full bg-green-100 text-gray-900 py-3 rounded-xl font-bold text-sm hover:bg-green-200 transition-colors border border-green-300"
            >
              Try Payment Again
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
            >
              Back to Cart
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">Your items are still in your cart</p>
        </div>
      </div>
    </div>
  );
}
