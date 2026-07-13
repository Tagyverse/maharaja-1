import React, { useState } from 'react';
import { useFeaturesContext } from '../../contexts/FeaturesContext';
import { Toggle, Save, AlertCircle } from 'lucide-react';

export default function FeatureManagement() {
  const { features, loading, error, updateFeature } = useFeaturesContext();
  const [saving, setSaving] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!features) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap-2">
        <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
        <p className="text-red-800">Failed to load features</p>
      </div>
    );
  }

  const handleToggle = async (key: keyof typeof features, value: boolean) => {
    try {
      setSaving(key);
      await updateFeature(key, value);
      setSavedMessage(`${key.replace(/_/g, ' ')} updated successfully`);
      setTimeout(() => setSavedMessage(null), 2000);
    } catch (err) {
      console.error('Error updating feature:', err);
    } finally {
      setSaving(null);
    }
  };

  const featureGroups = [
    {
      title: 'Payment Methods',
      icon: '💳',
      features: [
        { key: 'cod_enabled' as const, label: 'Cash on Delivery (COD)', description: 'Allow customers to pay on delivery' },
        { key: 'razorpay_enabled' as const, label: 'Razorpay Payment', description: 'Enable online payment via Razorpay' },
      ]
    },
    {
      title: 'Shop Features',
      icon: '🛍️',
      features: [
        { key: 'reviews_enabled' as const, label: 'Product Reviews', description: 'Allow customers to leave reviews' },
        { key: 'ratings_enabled' as const, label: 'Product Ratings', description: 'Display product ratings and stars' },
        { key: 'wishlist_enabled' as const, label: 'Wishlist', description: 'Let customers save items to wishlist' },
      ]
    },
    {
      title: 'Display Options',
      icon: '📺',
      features: [
        { key: 'top_banner_enabled' as const, label: 'Top Banner', description: 'Display announcement banner at top' },
        { key: 'welcome_popup_enabled' as const, label: 'Welcome Popup', description: 'Show welcome dialog to new visitors' },
        { key: 'offer_popup_enabled' as const, label: 'Offer Popup', description: 'Display special offers popup' },
        { key: 'product_carousel_enabled' as const, label: 'Product Carousel', description: 'Show featured products carousel' },
        { key: 'related_products_enabled' as const, label: 'Related Products', description: 'Show related products suggestions' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap-2">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {savedMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-gap-2">
          <Save className="text-green-600 flex-shrink-0" size={20} />
          <p className="text-green-800">{savedMessage}</p>
        </div>
      )}

      {featureGroups.map((group) => (
        <div key={group.title} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{group.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900">{group.title}</h3>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {group.features.map((feature) => (
              <div key={feature.key} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{feature.label}</h4>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                </div>

                <div className="ml-4 flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(feature.key, !features[feature.key])}
                    disabled={saving === feature.key}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      features[feature.key]
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-300 hover:bg-gray-400'
                    } ${saving === feature.key ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        features[feature.key] ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium w-10 text-center text-gray-600">
                    {features[feature.key] ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
