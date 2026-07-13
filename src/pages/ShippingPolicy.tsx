import { ArrowLeft } from 'lucide-react';
import { brand } from '../config/brand';

interface ShippingPolicyProps {
  onBack: () => void;
}

export default function ShippingPolicy({ onBack }: ShippingPolicyProps) {
  const shipping = brand.policies.shipping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Shipping Policy</h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-lg leading-relaxed">
              {shipping.intro}
            </p>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Time</h2>
              <ul className="list-disc pl-6 space-y-2">
                {shipping.processingTime.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Time</h2>
              <p className="mb-2">Once shipped, orders usually take:</p>
              <p className="font-semibold">{shipping.shippingTime.domestic}</p>
              <p className="mt-2">{shipping.shippingTime.note}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Charges</h2>
              <ul className="list-disc pl-6 space-y-2">
                {shipping.shippingCharges.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Tracking</h2>
              <p>{shipping.orderTracking}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Incorrect Address</h2>
              <ul className="list-disc pl-6 space-y-2">
                {shipping.incorrectAddress.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Delays</h2>
              <ul className="list-disc pl-6 space-y-2">
                {shipping.delays.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Returns / Exchanges / Refunds</h2>
              <ul className="list-disc pl-6 space-y-2">
                {shipping.returns.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Lost or Damaged Parcels</h2>
              <ul className="list-disc pl-6 space-y-2">
                {shipping.lostDamaged.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
