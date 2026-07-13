'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Settings, Save, Loader2, ChevronDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import type { BusinessConfig } from '../types';
import { fetchBusinessConfig, saveBusinessConfig, getDefaultBusinessConfig } from '../utils/businessConfigManager';

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
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'seo' | 'policies' | 'theme'>('general');

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
      }
    } catch (error) {
      console.error('Error loading business config:', error);
    } finally {
      setLoading(false);
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

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <TabsList className="grid grid-cols-5 gap-2 bg-slate-800/50 border border-slate-700 p-2 rounded-lg mb-6">
            <TabsTrigger value="general" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              General
            </TabsTrigger>
            <TabsTrigger value="branding" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Branding
            </TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              SEO
            </TabsTrigger>
            <TabsTrigger value="policies" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Policies
            </TabsTrigger>
            <TabsTrigger value="theme" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Theme
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-cyan-400">Business Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={businessConfig.company_name}
                    onChange={(e) => handleConfigChange('company_name', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
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
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
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
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-cyan-400">Search Engine Optimization</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Meta Title (55-60 chars)</label>
                  <input
                    type="text"
                    maxLength={60}
                    value={businessConfig.seo_meta_title}
                    onChange={(e) => handleConfigChange('seo_meta_title', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    placeholder="Your page title"
                  />
                  <p className="text-slate-400 text-xs mt-1">{businessConfig.seo_meta_title.length}/60 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Meta Description (150-160 chars)</label>
                  <textarea
                    maxLength={160}
                    value={businessConfig.seo_meta_description}
                    onChange={(e) => handleConfigChange('seo_meta_description', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400 resize-none h-20"
                    placeholder="Your page description"
                  />
                  <p className="text-slate-400 text-xs mt-1">{businessConfig.seo_meta_description.length}/160 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">OG Image URL</label>
                  <input
                    type="url"
                    value={businessConfig.seo_og_image}
                    onChange={(e) => handleConfigChange('seo_og_image', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-cyan-400">Business Policies</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Terms of Service</label>
                <textarea
                  value={businessConfig.terms_of_service}
                  onChange={(e) => handleConfigChange('terms_of_service', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400 resize-none h-32 font-mono text-sm"
                  placeholder="Enter your terms of service..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Return Policy</label>
                <textarea
                  value={businessConfig.return_policy}
                  onChange={(e) => handleConfigChange('return_policy', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400 resize-none h-32 font-mono text-sm"
                  placeholder="Enter your return policy..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Warranty Information</label>
                <textarea
                  value={businessConfig.warranty_information}
                  onChange={(e) => handleConfigChange('warranty_information', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 placeholder-slate-400 focus:outline-none focus:border-cyan-400 resize-none h-32 font-mono text-sm"
                  placeholder="Enter warranty information..."
                />
              </div>
            </div>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-cyan-400">Theme Settings</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Font Family</label>
                <select
                  value={businessConfig.theme_font_family}
                  onChange={(e) => handleConfigChange('theme_font_family', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 focus:outline-none focus:border-cyan-400"
                >
                  <option value="system-ui">System UI (Default)</option>
                  <option value="sans-serif">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-300">Color Scheme</h4>
                <select
                  value={businessConfig.theme_color_scheme}
                  onChange={(e) => handleConfigChange('theme_color_scheme', e.target.value as any)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 focus:outline-none focus:border-cyan-400"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-300">Button Style</h4>
                <select
                  value={businessConfig.theme_button_style}
                  onChange={(e) => handleConfigChange('theme_button_style', e.target.value as any)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 focus:outline-none focus:border-cyan-400"
                >
                  <option value="rounded">Rounded</option>
                  <option value="square">Square</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
                <input
                  type="checkbox"
                  id="darkMode"
                  checked={businessConfig.theme_dark_mode_enabled}
                  onChange={(e) => handleConfigChange('theme_dark_mode_enabled', e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-400"
                />
                <label htmlFor="darkMode" className="text-sm text-slate-300">Enable Dark Mode</label>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="fixed bottom-8 right-8">
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 disabled:cursor-not-allowed text-slate-900 font-semibold transition-colors shadow-lg"
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
        </div>
      </div>
    </div>
  );
}
