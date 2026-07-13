import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Building2, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Globe, Youtube, AlertCircle } from 'lucide-react';
import { db } from '../../lib/firebase';
import { ref, get, set } from 'firebase/database';

interface BusinessData {
  companyName: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    youtube: string;
  };
  copyrightText: string;
  showContact: boolean;
  showSocial: boolean;
}

const defaultBusinessData: BusinessData = {
  companyName: 'Your Business',
  description: 'Your business description goes here',
  email: 'contact@yourbusiness.com',
  phone: '+1 (555) 000-0000',
  address: 'Your address here',
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
  },
  copyrightText: '© 2024 Your Business. All rights reserved.',
  showContact: true,
  showSocial: true,
};

export default function ChangeBusiness() {
  const [businessData, setBusinessData] = useState<BusinessData>(defaultBusinessData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      const footerRef = ref(db, 'footer_config');
      const snapshot = await get(footerRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Only load the business-relevant fields
        setBusinessData(prevData => ({
          ...prevData,
          companyName: data.companyName || prevData.companyName,
          description: data.description || prevData.description,
          email: data.email || prevData.email,
          phone: data.phone || prevData.phone,
          address: data.address || prevData.address,
          social: {
            facebook: data.social?.facebook || '',
            instagram: data.social?.instagram || '',
            twitter: data.social?.twitter || '',
            linkedin: data.social?.linkedin || '',
            youtube: data.social?.youtube || '',
          },
          copyrightText: data.copyrightText || prevData.copyrightText,
          showContact: data.showContact !== false,
          showSocial: data.showSocial !== false,
        }));
      }
    } catch (err) {
      console.error('Error loading business data:', err);
      setError('Failed to load business data');
    }
  };

  const validateData = (): boolean => {
    if (!businessData.companyName.trim()) {
      setError('Company name is required');
      return false;
    }
    if (!businessData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (businessData.email && !businessData.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (!businessData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!businessData.address.trim()) {
      setError('Address is required');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateData()) {
      setShowValidation(true);
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Get existing footer config to preserve other settings
      const footerRef = ref(db, 'footer_config');
      const snapshot = await get(footerRef);
      const existingData = snapshot.exists() ? snapshot.val() : {};

      // Update only the business data fields
      const updatedData = {
        ...existingData,
        companyName: businessData.companyName,
        description: businessData.description,
        email: businessData.email,
        phone: businessData.phone,
        address: businessData.address,
        social: businessData.social,
        copyrightText: businessData.copyrightText,
        showContact: businessData.showContact,
        showSocial: businessData.showSocial,
        updated_at: new Date().toISOString(),
      };

      await set(footerRef, updatedData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      console.log('[v0] Business information saved successfully');
    } catch (err) {
      console.error('Error saving business data:', err);
      setError('Failed to save business information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSocialChange = (platform: keyof BusinessData['social'], value: string) => {
    setBusinessData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: value,
      },
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Business Information</h2>
            <p className="text-white/90 mt-1">Update your business details that appear on the homepage footer</p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && showValidation && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-900">{error}</p>
          </div>
        </div>
      )}

      {/* Success message */}
      {saveSuccess && (
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-green-900">Business information saved successfully!</p>
        </div>
      )}

      {/* Main form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Info Section */}
        <div className="bg-white rounded-2xl p-6 border-2 border-amber-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Company Details</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Company Name *</label>
              <input
                type="text"
                value={businessData.companyName}
                onChange={(e) => setBusinessData({ ...businessData, companyName: e.target.value })}
                placeholder="Your Business Name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
              <textarea
                value={businessData.description}
                onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                placeholder="Brief description of your business"
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Copyright Text</label>
              <input
                type="text"
                value={businessData.copyrightText}
                onChange={(e) => setBusinessData({ ...businessData, copyrightText: e.target.value })}
                placeholder="© 2024 Your Business. All rights reserved."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="bg-white rounded-2xl p-6 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address *</label>
              <input
                type="email"
                value={businessData.email}
                onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                placeholder="contact@yourbusiness.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number *</label>
              <input
                type="tel"
                value={businessData.phone}
                onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Address *</label>
              <textarea
                value={businessData.address}
                onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                placeholder="Your business address"
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer bg-blue-50 px-4 py-3 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all">
              <input
                type="checkbox"
                checked={businessData.showContact}
                onChange={(e) => setBusinessData({ ...businessData, showContact: e.target.checked })}
                className="w-5 h-5 text-blue-500 border-2 border-blue-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-900">Show contact information on homepage</span>
            </label>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="bg-white rounded-2xl p-6 border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Social Media Links</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Facebook className="w-4 h-4" />
                Facebook
              </label>
              <input
                type="url"
                value={businessData.social.facebook}
                onChange={(e) => handleSocialChange('facebook', e.target.value)}
                placeholder="https://facebook.com/yourbusiness"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </label>
              <input
                type="url"
                value={businessData.social.instagram}
                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                placeholder="https://instagram.com/yourbusiness"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter/X
              </label>
              <input
                type="url"
                value={businessData.social.twitter}
                onChange={(e) => handleSocialChange('twitter', e.target.value)}
                placeholder="https://twitter.com/yourbusiness"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                LinkedIn
              </label>
              <input
                type="url"
                value={businessData.social.linkedin}
                onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/yourbusiness"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Youtube className="w-4 h-4" />
                YouTube
              </label>
              <input
                type="url"
                value={businessData.social.youtube}
                onChange={(e) => handleSocialChange('youtube', e.target.value)}
                placeholder="https://youtube.com/@yourbusiness"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer bg-purple-50 px-4 py-3 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all">
              <input
                type="checkbox"
                checked={businessData.showSocial}
                onChange={(e) => setBusinessData({ ...businessData, showSocial: e.target.checked })}
                className="w-5 h-5 text-purple-500 border-2 border-purple-300 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-sm font-semibold text-gray-900">Show social media links on homepage</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-orange-700"
          >
            {isSaving ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Business Information
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">Changes are saved to Firebase. Don't forget to publish to make them live on your homepage!</p>
      </form>
    </div>
  );
}
