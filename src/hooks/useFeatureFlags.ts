import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import { brand } from '../config/brand';

interface FeatureFlags {
  virtual_try_on: boolean;
  dress_color_matcher: boolean;
  wishlist: boolean;
  customer_reviews: boolean;
  faq_section: boolean;
  whatsapp_chat: boolean;
  whatsapp_fab: boolean;
  cart_fab: boolean;
  purchase_notifications: boolean;
  offer_popup: boolean;
  welcome_coupon: boolean;
  top_banner: boolean;
  welcome_banner: boolean;
  video_sections: boolean;
  video_overlay: boolean;
  featured_categories: boolean;
  might_you_like: boolean;
  enquiry_form: boolean;
  feedback_panel: boolean;
  scroll_to_top: boolean;
  smart_feature_fab: boolean;
  ai_assistant: boolean;
  size_chart: boolean;
  product_zoom: boolean;
  gallery_view: boolean;
  international_whatsapp_checkout: boolean;
  social_share: boolean;
  order_tracking: boolean;
  invoice_download: boolean;
  coupon_system: boolean;
  multi_currency: boolean;
  product_filters: boolean;
  search_bar: boolean;
  splash_screen: boolean;
}

const defaultFlags: FeatureFlags = {
  virtual_try_on: brand.features.virtual_try_on,
  dress_color_matcher: brand.features.dress_color_matcher,
  wishlist: brand.features.wishlist,
  customer_reviews: brand.features.customer_reviews,
  faq_section: brand.features.faq_section,
  whatsapp_chat: brand.features.whatsapp_chat,
  whatsapp_fab: brand.features.whatsapp_fab,
  cart_fab: brand.features.cart_fab,
  purchase_notifications: brand.features.purchase_notifications,
  offer_popup: brand.features.offer_popup,
  welcome_coupon: brand.features.welcome_coupon,
  top_banner: brand.features.top_banner,
  welcome_banner: brand.features.welcome_banner,
  video_sections: brand.features.video_sections,
  video_overlay: brand.features.video_overlay,
  featured_categories: brand.features.featured_categories,
  might_you_like: brand.features.might_you_like,
  enquiry_form: brand.features.enquiry_form,
  feedback_panel: brand.features.feedback_panel,
  scroll_to_top: brand.features.scroll_to_top,
  smart_feature_fab: brand.features.smart_feature_fab,
  ai_assistant: brand.features.ai_assistant,
  size_chart: brand.features.size_chart,
  product_zoom: brand.features.product_zoom,
  gallery_view: brand.features.gallery_view,
  international_whatsapp_checkout: brand.features.international_whatsapp_checkout,
  social_share: brand.features.social_share,
  order_tracking: brand.features.order_tracking,
  invoice_download: brand.features.invoice_download,
  coupon_system: brand.features.coupon_system,
  multi_currency: brand.features.multi_currency,
  product_filters: brand.features.product_filters,
  search_bar: brand.features.search_bar,
  splash_screen: brand.features.splash_screen,
};

let cachedFlags: FeatureFlags | null = null;
let loadPromise: Promise<FeatureFlags> | null = null;

function loadFlags(): Promise<FeatureFlags> {
  if (cachedFlags) return Promise.resolve(cachedFlags);
  if (loadPromise) return loadPromise;

  loadPromise = get(ref(db, 'super_admin_config/features'))
    .then(snap => {
      if (snap.exists()) {
        cachedFlags = { ...defaultFlags, ...snap.val() };
      } else {
        cachedFlags = defaultFlags;
      }
      return cachedFlags;
    })
    .catch(() => {
      cachedFlags = defaultFlags;
      return cachedFlags;
    });

  return loadPromise;
}

export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(cachedFlags || defaultFlags);

  useEffect(() => {
    loadFlags().then(setFlags);
  }, []);

  return flags;
}

export type { FeatureFlags };
