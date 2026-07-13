'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface FeaturesContextType {
  features: Record<string, boolean>;
  updateFeatures: (newFeatures: Record<string, boolean>) => void;
}

const defaultFeatures: Record<string, boolean> = {
  // Payment Methods
  codPayment: true,
  razorpayPayment: true,
  upiPayment: true,
  
  // Shopping Features
  reviewsEnabled: true,
  wishlistEnabled: true,
  tryOnEnabled: true,
  giftWrapEnabled: true,
  
  // Display Options
  bannersEnabled: true,
  popupsEnabled: true,
  carouselEnabled: true,
  videoSectionsEnabled: true,
  
  // Logistics & Orders
  trackingEnabled: true,
  multiChannelEnabled: true,
  bulkOrdersEnabled: true,
  
  // Advanced Features
  aiAssistantEnabled: true,
  billCustomizerEnabled: true,
  taxCalculatorEnabled: true,
};

const FeaturesContext = createContext<FeaturesContextType | undefined>(undefined);

export const FeaturesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<Record<string, boolean>>(defaultFeatures);

  // Load features from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('features-config');
      if (stored) {
        const parsed = JSON.parse(stored);
        setFeatures({ ...defaultFeatures, ...parsed });
      }
    } catch (error) {
      console.error('Error loading features from localStorage:', error);
    }
  }, []);

  // Save features to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('features-config', JSON.stringify(features));
    } catch (error) {
      console.error('Error saving features to localStorage:', error);
    }
  }, [features]);

  const updateFeatures = (newFeatures: Record<string, boolean>) => {
    setFeatures(prev => ({
      ...prev,
      ...newFeatures,
    }));
  };

  return (
    <FeaturesContext.Provider value={{ features, updateFeatures }}>
      {children}
    </FeaturesContext.Provider>
  );
};

export const useFeatures = () => {
  const context = useContext(FeaturesContext);
  if (!context) {
    throw new Error('useFeatures must be used within a FeaturesProvider');
  }
  return context;
};
