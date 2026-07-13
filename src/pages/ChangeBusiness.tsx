'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Settings, Save, Loader2, ChevronDown, Upload, LogOut, Eye } from 'lucide-react';
import type { BusinessConfig } from '../types';
import { fetchBusinessConfig, saveBusinessConfig, getDefaultBusinessConfig } from '../utils/businessConfigManager';
import { THEME_PRESETS, applyThemePreset, detectPresetFromConfig } from '../utils/themePresets';
import ThemePreview from '../components/ThemePreview';
import AdvancedThemeEditor from '../components/AdvancedThemeEditor';

// Admin Component Managers
import NavigationCustomizer from '../components/admin/NavigationCustomizer';
import CarouselManager from '../components/admin/CarouselManager';
import FooterManager from '../components/admin/FooterManager';
import MarqueeManager from '../components/admin/MarqueeManager';
import SectionManager from '../components/admin/SectionManager';
import CardDesignManager from '../components/admin/CardDesignManager';
import VideoSectionManager from '../components/admin/VideoSectionManager';
import BannerSocialManager from '../components/admin/BannerSocialManager';
import CouponManager from '../components/admin/CouponManager';
import ShippingManager from '../components/admin/ShippingManager';
import TaxManager from '../components/admin/TaxManager';
import PublishManager from '../components/admin/PublishManager';
import OrderChannelManager from '../components/admin/OrderChannelManager';

export default function ChangeBusiness() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(getDefaultBusinessConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'business' | 'navigation' | 'hero' | 'carousel' | 'sections' | 'footer' | 'marquee' | 'card-design' | 'video-sections' | 'banner' | 'coupons' | 'shipping' | 'tax' | 'orders' | 'publish'>('business');
  const [showPreview, setShowPreview] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<string | null>(null);

  useEffect(() => {
    const savedAuth = localStorage.getItem('adminAuthenticated');
    if (savedAuth === 'true') {
      setIsAdminAuthenticated(true);
      loadBusinessConfig();
    } else {
      setLoading(false);
    }
  }, []);

  const loadBusinessConfig = async () => {
    try {
      const config = await fetchBusinessConfig('default');
      if (config) {
        setBusinessConfig(config);
        const detectedPreset = detectPresetFromConfig(config);
        setCurrentPreset(detectedPreset);
      }
    } catch (error) {
      console.error('Error loading business config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (presetName: string) => {
    const preset = THEME_PRESETS[presetName];
    if (preset) {
      const presetConfig = applyThemePreset(preset);
      setBusinessConfig(prev => ({ ...prev, ...presetConfig }));
      setCurrentPreset(presetName);
      setSaveStatus('idle');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const envAdminId = import.meta.env.VITE_ADMIN_ID;
    const envAdminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (adminId === envAdminId && adminPassword === envAdminPassword) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      loadBusinessConfig();
    } else {
      setLoginError('Invalid Admin ID or Password');
      setAdminPassword('');
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    setAdminId('');
    setAdminPassword('');
  };

  const handleConfigChange = (key: keyof BusinessConfig, value: any) => {
    setBusinessConfig(prev => ({
      ...prev,
      [key]: value
    }));
    setSaveStatus('idle');
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      await saveBusinessConfig('default', businessConfig);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving config:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishConfig = async () => {
    if (!confirm('Are you sure you want to publish business config to production? Users will see this branding immediately.')) {
      return;
    }
    
    setPublishing(true);
    setPublishStatus('idle');
    try {
      const response = await fetch('/api/publish-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            business_config: businessConfig,
            published_at: new Date().toISOString()
          }
        })
      });

      const result = await response.json();
      if (response.ok) {
        setPublishStatus('success');
        setTimeout(() => setPublishStatus('idle'), 3000);
        
        // Refresh the app after publishing
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.error('Publish error:', result);
        setPublishStatus('error');
        setTimeout(() => setPublishStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error publishing config:', error);
      setPublishStatus('error');
      setTimeout(() => setPublishStatus('idle'), 3000);
    } finally {
      setPublishing(false);
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Settings className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-bold">Business Settings</h1>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Admin ID
                </label>
                <input
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  placeholder="Enter admin ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              {loginError && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{loginError}</p>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold py-2 rounded-lg transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50 flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 border-3 border-slate-700 border-t-cyan-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Loading business configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-50">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-bold">Business Configuration</h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {saveStatus === 'success' && (
          <div className="mb-4 bg-green-900/30 border border-green-700 rounded-lg p-4 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500"></div>
            <p className="text-green-200">Configuration saved successfully!</p>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="mb-4 bg-red-900/30 border border-red-700 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-200">Error saving configuration. Please try again.</p>
          </div>
        )}

        {/* Horizontal Tab Navigation */}
        <div className="border-b border-slate-700 mb-8 overflow-x-auto">
          <div className="flex gap-1 flex-nowrap pb-4">
            {[
              { id: 'business', label: '🏢 Business' },
              { id: 'navigation', label: '📱 Navigation' },
              { id: 'hero', label: '✨ Hero' },
              { id: 'carousel', label: '🎠 Carousel' },
              { id: 'sections', label: '📦 Sections' },
              { id: 'footer', label: '👣 Footer' },
              { id: 'marquee', label: '📢 Marquee' },
              { id: 'card-design', label: '🎨 Card Design' },
              { id: 'video-sections', label: '🎬 Videos' },
              { id: 'banner', label: '📣 Banner' },
              { id: 'coupons', label: '🎟️ Coupons' },
              { id: 'shipping', label: '📦 Shipping' },
              { id: 'tax', label: '💰 Tax' },
              { id: 'orders', label: '🛒 Orders' },
              { id: 'publish', label: '🚀 Publish' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 whitespace-nowrap font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white border-b-2 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Business Configuration Tab */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            {/* Theme Presets Section */}
            <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-purple-300">Theme Presets</h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
              </div>
              <p className="text-sm text-slate-400">Select a preset to instantly apply a complete theme</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(THEME_PRESETS).map(([presetId, preset]) => (
                  <button
                    key={presetId}
                    onClick={() => handleApplyPreset(presetId)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      currentPreset === presetId
                        ? 'border-cyan-400 bg-cyan-500/20'
                        : 'border-slate-600 bg-slate-800/30 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <p className="font-semibold text-sm">{preset.label}</p>
                      <div className="flex gap-1">
                        <div
                          className="w-6 h-6 rounded border border-slate-600"
                          style={{ backgroundColor: preset.colors.primary }}
                          title="Primary"
                        />
                        <div
                          className="w-6 h-6 rounded border border-slate-600"
                          style={{ backgroundColor: preset.colors.secondary }}
                          title="Secondary"
                        />
                        <div
                          className="w-6 h-6 rounded border border-slate-600"
                          style={{ backgroundColor: preset.colors.accent }}
                          title="Accent"
                        />
                      </div>
                      <p className="text-xs text-slate-400">{preset.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Preview */}
            {showPreview && (
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-cyan-300">Live Preview</h3>
                <p className="text-sm text-slate-400">See how your website will look with the current theme settings</p>
                <div className="max-h-[600px] overflow-y-auto">
                  <ThemePreview config={businessConfig} />
                </div>
              </div>
            )}

            {/* Advanced Theme Editor */}
            <AdvancedThemeEditor config={businessConfig} onUpdate={handleConfigChange} />

            {/* Business Information Section */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-cyan-400">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tagline</label>
                  <input
                    type="text"
                    value={businessConfig.tagline}
                    onChange={(e) => handleConfigChange('tagline', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Legal Business Name</label>
                  <input
                    type="text"
                    value={businessConfig.legal_business_name}
                    onChange={(e) => handleConfigChange('legal_business_name', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Logo URL</label>
                  <input
                    type="url"
                    value={businessConfig.logo_url}
                    onChange={(e) => handleConfigChange('logo_url', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-cyan-400 pt-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Primary Email</label>
                  <input
                    type="email"
                    value={businessConfig.primary_contact_email}
                    onChange={(e) => handleConfigChange('primary_contact_email', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Primary Phone</label>
                  <input
                    type="tel"
                    value={businessConfig.primary_contact_phone}
                    onChange={(e) => handleConfigChange('primary_contact_phone', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-cyan-400 pt-4">Business Address</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Street Address"
                  value={businessConfig.business_address}
                  onChange={(e) => handleConfigChange('business_address', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={businessConfig.business_city}
                    onChange={(e) => handleConfigChange('business_city', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    placeholder="State/Province"
                    value={businessConfig.business_state}
                    onChange={(e) => handleConfigChange('business_state', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Country"
                    value={businessConfig.business_country}
                    onChange={(e) => handleConfigChange('business_country', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="text"
                    placeholder="ZIP/Postal Code"
                    value={businessConfig.business_zip}
                    onChange={(e) => handleConfigChange('business_zip', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tab */}
        {activeTab === 'navigation' && (
          <div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-cyan-400">Color Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={businessConfig.primary_color}
                      onChange={(e) => handleConfigChange('primary_color', e.target.value)}
                      className="w-12 h-10 rounded-lg cursor-pointer border border-slate-600"
                    />
                    <input
                      type="text"
                      value={businessConfig.primary_color}
                      onChange={(e) => handleConfigChange('primary_color', e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Secondary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={businessConfig.secondary_color}
                      onChange={(e) => handleConfigChange('secondary_color', e.target.value)}
                      className="w-12 h-10 rounded-lg cursor-pointer border border-slate-600"
                    />
                    <input
                      type="text"
                      value={businessConfig.secondary_color}
                      onChange={(e) => handleConfigChange('secondary_color', e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={businessConfig.accent_color}
                      onChange={(e) => handleConfigChange('accent_color', e.target.value)}
                      className="w-12 h-10 rounded-lg cursor-pointer border border-slate-600"
                    />
                    <input
                      type="text"
                      value={businessConfig.accent_color}
                      onChange={(e) => handleConfigChange('accent_color', e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-sm">These colors will be applied throughout your website for consistent branding.</p>
            </div>
            {/* SEO Configuration */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-cyan-400">SEO Configuration</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={businessConfig.seo_meta_title}
                  onChange={(e) => handleConfigChange('seo_meta_title', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  placeholder="My Awesome Store"
                />
                <p className="text-xs text-slate-400 mt-1">This appears in browser tabs and search results</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Meta Description</label>
                <textarea
                  value={businessConfig.seo_meta_description}
                  onChange={(e) => handleConfigChange('seo_meta_description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  placeholder="Your store description for search engines..."
                />
                <p className="text-xs text-slate-400 mt-1">50-160 characters recommended for search engines</p>
              </div>
            </div>

            {/* Policy Management */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-cyan-400">Policy Management</h3>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Terms of Service</label>
                <textarea
                  value={businessConfig.terms_of_service}
                  onChange={(e) => handleConfigChange('terms_of_service', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  placeholder="Enter your terms of service..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Return Policy</label>
                <textarea
                  value={businessConfig.return_policy}
                  onChange={(e) => handleConfigChange('return_policy', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  placeholder="Enter your return policy..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tab */}
        {activeTab === 'navigation' && <NavigationCustomizer />}

        {/* Hero/Banner Tab */}
        {activeTab === 'hero' && <BannerSocialManager />}

        {/* Carousel Tab */}
        {activeTab === 'carousel' && <CarouselManager />}

        {/* Sections Tab */}
        {activeTab === 'sections' && <SectionManager />}

        {/* Footer Tab */}
        {activeTab === 'footer' && <FooterManager />}

        {/* Marquee Tab */}
        {activeTab === 'marquee' && <MarqueeManager />}

        {/* Card Design Tab */}
        {activeTab === 'card-design' && <CardDesignManager />}

        {/* Video Sections Tab */}
        {activeTab === 'video-sections' && <VideoSectionManager />}

        {/* Banner Tab */}
        {activeTab === 'banner' && <BannerSocialManager />}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && <CouponManager />}

        {/* Shipping Tab */}
        {activeTab === 'shipping' && <ShippingManager />}

        {/* Tax Tab */}
        {activeTab === 'tax' && <TaxManager />}

        {/* Orders Tab */}
        {activeTab === 'orders' && <OrderChannelManager />}

        {/* Publish Tab */}
        {activeTab === 'publish' && <PublishManager />}

        {/* Action Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col-reverse sm:flex-row gap-3">
          {/* Publish Button */}
          <button
            onClick={handlePublishConfig}
            disabled={publishing}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors shadow-lg"
            title="Publish to production"
          >
            {publishing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Publish to Live
              </>
            )}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors shadow-lg"
            title="Save changes locally"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>

          {/* Status Messages */}
          {saveStatus === 'success' && (
            <div className="fixed bottom-24 right-8 bg-green-500/20 border border-green-500 text-green-200 px-4 py-2 rounded-lg text-sm">
              Changes saved to Firebase!
            </div>
          )}
          {publishStatus === 'success' && (
            <div className="fixed bottom-24 right-8 bg-green-500/20 border border-green-500 text-green-200 px-4 py-2 rounded-lg text-sm">
              Published to production!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="fixed bottom-24 right-8 bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm">
              Error saving changes
            </div>
          )}
          {publishStatus === 'error' && (
            <div className="fixed bottom-24 right-8 bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm">
              Error publishing to production
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
