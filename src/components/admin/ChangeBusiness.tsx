import React, { useState, useEffect } from 'react';
import { useFeatures } from '../../contexts/FeaturesContext';
import { AlertCircle, Save, CheckCircle2, XCircle, Lock, Unlock } from 'lucide-react';

interface BusinessConfig {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  features: Record<string, boolean>;
}

export default function ChangeBusiness() {
  const { features, updateFeatures } = useFeatures();
  const [config, setConfig] = useState<BusinessConfig>({
    businessName: localStorage.getItem('businessName') || 'My Store',
    businessEmail: localStorage.getItem('businessEmail') || '',
    businessPhone: localStorage.getItem('businessPhone') || '',
    features: { ...features },
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [selectedCategory, setSelectedCategory] = useState<string>('payment');

  const featureCategories = {
    payment: {
      label: 'Payment Methods',
      icon: '💳',
      features: [
        { key: 'codPayment', label: 'Cash on Delivery (COD)' },
        { key: 'razorpayPayment', label: 'Razorpay Payments' },
        { key: 'upiPayment', label: 'UPI Payments' },
      ],
    },
    shopping: {
      label: 'Shopping Features',
      icon: '🛍️',
      features: [
        { key: 'reviewsEnabled', label: 'Customer Reviews' },
        { key: 'wishlistEnabled', label: 'Wishlist Feature' },
        { key: 'tryOnEnabled', label: 'Virtual Try-On' },
        { key: 'giftWrapEnabled', label: 'Gift Wrap Option' },
      ],
    },
    display: {
      label: 'Display Options',
      icon: '📺',
      features: [
        { key: 'bannersEnabled', label: 'Welcome Banners' },
        { key: 'popupsEnabled', label: 'Promotional Popups' },
        { key: 'carouselEnabled', label: 'Product Carousel' },
        { key: 'videoSectionsEnabled', label: 'Video Sections' },
      ],
    },
    logistics: {
      label: 'Logistics & Orders',
      icon: '📦',
      features: [
        { key: 'trackingEnabled', label: 'Order Tracking' },
        { key: 'multiChannelEnabled', label: 'Multi-Channel Orders' },
        { key: 'bulkOrdersEnabled', label: 'Bulk Orders' },
      ],
    },
    advanced: {
      label: 'Advanced Features',
      icon: '⚙️',
      features: [
        { key: 'aiAssistantEnabled', label: 'AI Assistant' },
        { key: 'billCustomizerEnabled', label: 'Bill Customizer' },
        { key: 'taxCalculatorEnabled', label: 'Tax Calculator' },
      ],
    },
  };

  const handleBusinessChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFeatureToggle = (featureKey: string) => {
    setConfig(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: !prev.features[featureKey],
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      
      // Save business info
      localStorage.setItem('businessName', config.businessName);
      localStorage.setItem('businessEmail', config.businessEmail);
      localStorage.setItem('businessPhone', config.businessPhone);
      
      // Update features globally
      updateFeatures(config.features);
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving business config:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const currentCategoryFeatures = (featureCategories as any)[selectedCategory]?.features || [];
  const enabledCount = currentCategoryFeatures.filter(
    (f: any) => config.features[f.key]
  ).length;

  return (
    <div className="space-y-6">
      {/* Business Information Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" />
          Business Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={config.businessName}
              onChange={(e) => handleBusinessChange('businessName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter business name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={config.businessEmail}
              onChange={(e) => handleBusinessChange('businessEmail', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="business@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={config.businessPhone}
              onChange={(e) => handleBusinessChange('businessPhone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </div>

      {/* Feature Categories Navigation */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Unlock className="w-5 h-5 text-purple-600" />
          Feature Management
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(featureCategories).map(([key, category]: [string, any]) => {
            const enabledInCategory = (category.features as any[]).filter(
              (f: any) => config.features[f.key]
            ).length;
            const total = (category.features as any[]).length;
            
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === key
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
                <span className={`text-xs font-bold ${
                  selectedCategory === key ? 'bg-white/20' : 'bg-gray-300'
                } px-2 py-1 rounded`}>
                  {enabledInCategory}/{total}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feature Toggles for Selected Category */}
        <div className="space-y-3">
          {currentCategoryFeatures.map((feature: any) => (
            <div
              key={feature.key}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="flex items-center gap-3 flex-1">
                {config.features[feature.key] ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{feature.label}</p>
                  <p className="text-sm text-gray-500">
                    {config.features[feature.key] ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleFeatureToggle(feature.key)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  config.features[feature.key]
                    ? 'bg-green-600'
                    : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    config.features[feature.key] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Total Features</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {Object.values(featureCategories).reduce(
              (sum, cat: any) => sum + cat.features.length,
              0
            )}
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600 font-medium">Enabled</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {Object.values(config.features).filter(Boolean).length}
          </p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 font-medium">Disabled</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {Object.values(config.features).filter(v => !v).length}
          </p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-600 font-medium">Active %</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {Math.round(
              (Object.values(config.features).filter(Boolean).length /
                Object.keys(config.features).length) *
                100
            )}%
          </p>
        </div>
      </div>

      {/* Alert Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-blue-900">Feature Changes</p>
          <p className="text-sm text-blue-700 mt-1">
            Changes to feature toggles will affect the entire store experience. Users will see different options based on enabled features.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
            saveStatus === 'success'
              ? 'bg-green-600 text-white'
              : saveStatus === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50'
          }`}
        >
          {saveStatus === 'saving' && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
          {saveStatus === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {saveStatus === 'error' && <XCircle className="w-5 h-5" />}
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
