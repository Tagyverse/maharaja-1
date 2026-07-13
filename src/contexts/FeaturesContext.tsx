'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, get, set } from 'firebase/database';

export interface Features {
  // Payment Methods
  cod_enabled: boolean;
  razorpay_enabled: boolean;
  
  // Shop Features
  reviews_enabled: boolean;
  wishlist_enabled: boolean;
  ratings_enabled: boolean;
  
  // Display Options
  top_banner_enabled: boolean;
  welcome_popup_enabled: boolean;
  offer_popup_enabled: boolean;
  product_carousel_enabled: boolean;
  related_products_enabled: boolean;
}

interface FeaturesContextType {
  features: Features | null;
  loading: boolean;
  error: string | null;
  updateFeature: (key: keyof Features, value: boolean) => Promise<void>;
  updateAllFeatures: (features: Partial<Features>) => Promise<void>;
}

const defaultFeatures: Features = {
  cod_enabled: true,
  razorpay_enabled: true,
  reviews_enabled: true,
  wishlist_enabled: true,
  ratings_enabled: true,
  top_banner_enabled: true,
  welcome_popup_enabled: true,
  offer_popup_enabled: true,
  product_carousel_enabled: true,
  related_products_enabled: true,
};

const FeaturesContext = createContext<FeaturesContextType | undefined>(undefined);

export const FeaturesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<Features | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load features from Firebase
  useEffect(() => {
    const loadFeatures = async () => {
      try {
        setLoading(true);
        const featuresRef = ref(db, 'settings/features');
        const snapshot = await get(featuresRef);
        
        if (snapshot.exists()) {
          setFeatures({ ...defaultFeatures, ...snapshot.val() });
        } else {
          setFeatures(defaultFeatures);
          // Initialize with default features
          await set(featuresRef, defaultFeatures);
        }
        setError(null);
      } catch (err) {
        console.error('Error loading features:', err);
        setError('Failed to load features');
        setFeatures(defaultFeatures);
      } finally {
        setLoading(false);
      }
    };

    loadFeatures();
  }, []);

  const updateFeature = async (key: keyof Features, value: boolean) => {
    try {
      const featuresRef = ref(db, `settings/features/${key}`);
      await set(featuresRef, value);
      setFeatures(prev => prev ? { ...prev, [key]: value } : null);
    } catch (err) {
      console.error('Error updating feature:', err);
      setError('Failed to update feature');
      throw err;
    }
  };

  const updateAllFeatures = async (newFeatures: Partial<Features>) => {
    try {
      const featuresRef = ref(db, 'settings/features');
      const updated = { ...features, ...newFeatures };
      await set(featuresRef, updated);
      setFeatures(updated as Features);
    } catch (err) {
      console.error('Error updating features:', err);
      setError('Failed to update features');
      throw err;
    }
  };

  return (
    <FeaturesContext.Provider value={{ features, loading, error, updateFeature, updateAllFeatures }}>
      {children}
    </FeaturesContext.Provider>
  );
};

export const useFeaturesContext = () => {
  const context = useContext(FeaturesContext);
  if (!context) {
    throw new Error('useFeaturesContext must be used within a FeaturesProvider');
  }
  return context;
};
