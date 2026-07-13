import { useState, useEffect } from 'react';
import { Settings, Palette, Globe, Database, Cloud, Copy, Save, Eye, EyeOff, Shield, Type, Zap, Check, ShoppingBag, Bell, Search, Smartphone, ToggleLeft, BarChart3, Zap as Live } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, get, set, onValue } from 'firebase/database';
import { brand } from '../config/brand';
import RebrandTool from '../components/admin/RebrandTool';
import { applyBrandColors } from '../utils/brandTheme';

interface BrandConfig {
  brand_name: string;
  brand_tagline: string;
  brand_logo_url: string;
  brand_favicon_url: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  instagram_url: string;
  facebook_url: string;
  twitter_url: string;
  youtube_url: string;
  website_domain: string;
  support_email: string;
  address: string;
}

interface SplashConfig {
  splash_logo_url: string;
  splash_video_url: string;
  splash_background_color: string;
  splash_text_color: string;
  splash_tagline: string;
  splash_duration_ms: number;
  splash_animation_type: 'fade' | 'zoom' | 'slide' | 'none';
  show_splash: boolean;
}

interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  background_color: string;
  surface_color: string;
  text_primary: string;
  text_secondary: string;
  border_radius: string;
  font_family: string;
  heading_font: string;
  card_shadow: string;
  navbar_style: 'solid' | 'glass' | 'transparent';
  navbar_color: string;
  button_style: 'rounded' | 'pill' | 'square';
}

interface EcommerceConfig {
  currency: string;
  currency_symbol: string;
  tax_enabled: boolean;
  tax_percentage: number;
  tax_label: string;
  gst_number: string;
  free_shipping_threshold: number;
  default_shipping_charge: number;
  min_order_amount: number;
  max_order_quantity: number;
  cod_enabled: boolean;
  cod_extra_charge: number;
  order_prefix: string;
  stock_management: boolean;
  low_stock_alert: number;
  auto_confirm_orders: boolean;
  allow_guest_checkout: boolean;
  review_moderation: boolean;
  wishlist_enabled: boolean;
  compare_products: boolean;
  size_chart_enabled: boolean;
  return_policy_days: number;
}

interface NotificationConfig {
  telegram_enabled: boolean;
  telegram_bot_token: string;
  telegram_chat_id: string;
  email_enabled: boolean;
  email_provider: 'resend' | 'sendgrid' | 'smtp';
  email_api_key: string;
  email_from: string;
  email_from_name: string;
  whatsapp_order_notify: boolean;
  whatsapp_admin_number: string;
  push_notifications: boolean;
  sms_enabled: boolean;
  sms_provider: string;
  sms_api_key: string;
}

interface SEOConfig {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  google_analytics_id: string;
  google_tag_manager_id: string;
  facebook_pixel_id: string;
  robots_txt: string;
  canonical_url: string;
  structured_data_type: string;
}

interface FirebaseConfig {
  api_key: string;
  auth_domain: string;
  database_url: string;
  project_id: string;
  storage_bucket: string;
  messaging_sender_id: string;
  app_id: string;
  measurement_id: string;
}

interface CloudflareConfig {
  account_id: string;
  pages_project: string;
  r2_bucket: string;
  r2_access_key_id: string;
  r2_secret_access_key: string;
  r2_endpoint: string;
  kv_namespace_id: string;
  custom_domain: string;
  workers_route: string;
}

interface RazorpayConfig {
  key_id: string;
  key_secret: string;
  webhook_secret: string;
}

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  auto_publish: boolean;
  maintenance_mode: boolean;
  admin_id: string;
  admin_password: string;
  super_admin_passkey: string;
}

interface FeaturesConfig {
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
}

interface AnalyticsConfig {
  google_analytics_id: string;
  google_tag_manager_id: string;
  gtm_auth: string;
  gtm_preview: string;
  facebook_pixel_id: string;
  facebook_conversions_api_token: string;
  tiktok_pixel_id: string;
  snapchat_pixel_id: string;
  pinterest_tag_id: string;
  twitter_pixel_id: string;
  microsoft_clarity_id: string;
  hotjar_id: string;
  mixpanel_token: string;
  amplitude_api_key: string;
  google_ads_id: string;
  google_ads_conversion_label: string;
  custom_head_scripts: string;
  custom_body_scripts: string;
  cookie_consent_enabled: boolean;
  anonymize_ip: boolean;
  enhanced_ecommerce: boolean;
  track_add_to_cart: boolean;
  track_checkout: boolean;
  track_purchase: boolean;
  track_search: boolean;
  track_view_item: boolean;
}

const defaultBrand: BrandConfig = {
  brand_name: brand.name,
  brand_tagline: brand.tagline,
  brand_logo_url: '',
  brand_favicon_url: '',
  contact_email: '',
  contact_phone: '',
  whatsapp_number: '',
  instagram_url: '',
  facebook_url: '',
  twitter_url: '',
  youtube_url: '',
  website_domain: '',
  support_email: '',
  address: '',
};

const defaultSplash: SplashConfig = {
  splash_logo_url: '',
  splash_video_url: '/logoanim.webm',
  splash_background_color: '#ffffff',
  splash_text_color: '#111827',
  splash_tagline: '',
  splash_duration_ms: 2500,
  splash_animation_type: 'fade',
  show_splash: true,
};

const defaultTheme: ThemeConfig = {
  primary_color: '#14b8a6',
  secondary_color: '#f59e0b',
  accent_color: '#ec4899',
  success_color: '#22c55e',
  warning_color: '#f59e0b',
  error_color: '#ef4444',
  background_color: '#ffffff',
  surface_color: '#f9fafb',
  text_primary: '#111827',
  text_secondary: '#6b7280',
  border_radius: '12px',
  font_family: 'Inter, sans-serif',
  heading_font: 'Inter, sans-serif',
  card_shadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  navbar_style: 'solid',
  navbar_color: '#ffffff',
  button_style: 'rounded',
};

const defaultEcommerce: EcommerceConfig = {
  currency: 'INR',
  currency_symbol: 'Rs.',
  tax_enabled: false,
  tax_percentage: 18,
  tax_label: 'GST',
  gst_number: '',
  free_shipping_threshold: 499,
  default_shipping_charge: 49,
  min_order_amount: 0,
  max_order_quantity: 10,
  cod_enabled: false,
  cod_extra_charge: 0,
  order_prefix: 'ORD',
  stock_management: true,
  low_stock_alert: 5,
  auto_confirm_orders: false,
  allow_guest_checkout: true,
  review_moderation: true,
  wishlist_enabled: true,
  compare_products: false,
  size_chart_enabled: true,
  return_policy_days: 7,
};

const defaultNotification: NotificationConfig = {
  telegram_enabled: false,
  telegram_bot_token: '',
  telegram_chat_id: '',
  email_enabled: false,
  email_provider: 'resend',
  email_api_key: '',
  email_from: '',
  email_from_name: '',
  whatsapp_order_notify: false,
  whatsapp_admin_number: '',
  push_notifications: false,
  sms_enabled: false,
  sms_provider: '',
  sms_api_key: '',
};

const defaultSEO: SEOConfig = {
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  og_image: '',
  google_analytics_id: '',
  google_tag_manager_id: '',
  facebook_pixel_id: '',
  robots_txt: 'User-agent: *\nAllow: /',
  canonical_url: '',
  structured_data_type: 'Product',
};

const defaultFirebase: FirebaseConfig = {
  api_key: '',
  auth_domain: '',
  database_url: '',
  project_id: '',
  storage_bucket: '',
  messaging_sender_id: '',
  app_id: '',
  measurement_id: '',
};

const defaultCloudflare: CloudflareConfig = {
  account_id: '',
  pages_project: '',
  r2_bucket: '',
  r2_access_key_id: '',
  r2_secret_access_key: '',
  r2_endpoint: '',
  kv_namespace_id: '',
  custom_domain: '',
  workers_route: '',
};

const defaultRazorpay: RazorpayConfig = {
  key_id: '',
  key_secret: '',
  webhook_secret: '',
};

const defaultDeployment: DeploymentConfig = {
  environment: 'production',
  auto_publish: false,
  maintenance_mode: false,
  admin_id: '',
  admin_password: '',
  super_admin_passkey: '',
};

const defaultFeatures: FeaturesConfig = {
  virtual_try_on: true,
  dress_color_matcher: true,
  wishlist: true,
  customer_reviews: true,
  faq_section: true,
  whatsapp_chat: true,
  whatsapp_fab: true,
  cart_fab: true,
  purchase_notifications: true,
  offer_popup: true,
  welcome_coupon: true,
  top_banner: true,
  welcome_banner: true,
  video_sections: true,
  video_overlay: true,
  featured_categories: true,
  might_you_like: true,
  enquiry_form: true,
  feedback_panel: true,
  scroll_to_top: true,
  smart_feature_fab: true,
  ai_assistant: true,
  size_chart: true,
  product_zoom: true,
  gallery_view: true,
  international_whatsapp_checkout: true,
  social_share: false,
  order_tracking: true,
  invoice_download: true,
  coupon_system: true,
  multi_currency: false,
  product_filters: true,
  search_bar: true,
};

const defaultAnalytics: AnalyticsConfig = {
  google_analytics_id: '',
  google_tag_manager_id: '',
  gtm_auth: '',
  gtm_preview: '',
  facebook_pixel_id: '',
  facebook_conversions_api_token: '',
  tiktok_pixel_id: '',
  snapchat_pixel_id: '',
  pinterest_tag_id: '',
  twitter_pixel_id: '',
  microsoft_clarity_id: '',
  hotjar_id: '',
  mixpanel_token: '',
  amplitude_api_key: '',
  google_ads_id: '',
  google_ads_conversion_label: '',
  custom_head_scripts: '',
  custom_body_scripts: '',
  cookie_consent_enabled: false,
  anonymize_ip: true,
  enhanced_ecommerce: true,
  track_add_to_cart: true,
  track_checkout: true,
  track_purchase: true,
  track_search: true,
  track_view_item: true,
};

const themePresets: Record<string, Partial<ThemeConfig>> = {
  'Teal & Gold': { primary_color: '#14b8a6', secondary_color: '#f59e0b', accent_color: '#ec4899' },
  'Ocean Blue': { primary_color: '#3b82f6', secondary_color: '#06b6d4', accent_color: '#8b5cf6' },
  'Forest Green': { primary_color: '#16a34a', secondary_color: '#ca8a04', accent_color: '#dc2626' },
  'Rose & Cream': { primary_color: '#e11d48', secondary_color: '#f97316', accent_color: '#7c3aed' },
  'Midnight Luxe': { primary_color: '#1e293b', secondary_color: '#c4b5fd', accent_color: '#fbbf24' },
  'Warm Terracotta': { primary_color: '#c2410c', secondary_color: '#a16207', accent_color: '#0d9488' },
  'Minimal Slate': { primary_color: '#475569', secondary_color: '#94a3b8', accent_color: '#0ea5e9' },
  'Coral Pink': { primary_color: '#f43f5e', secondary_color: '#fb923c', accent_color: '#a855f7' },
};

const fontOptions = [
  'Inter, sans-serif',
  'Poppins, sans-serif',
  'Playfair Display, serif',
  'Montserrat, sans-serif',
  'Lato, sans-serif',
  'Roboto, sans-serif',
  'Nunito, sans-serif',
  'DM Sans, sans-serif',
  'Outfit, sans-serif',
  'Lexend, sans-serif',
];

type TabType = 'rebrand' | 'brand' | 'splash' | 'theme' | 'features' | 'ecommerce' | 'analytics' | 'notifications' | 'seo' | 'firebase' | 'cloudflare' | 'payments' | 'deployment';

const HARDCODED_PASSKEY = 'gokulbalamurugan812006Ab2la@gokul812k6';

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState<TabType>(
    window.location.pathname === '/superadmin/rebrand' ? 'rebrand' : 'brand'
  );
  const [brand, setBrand] = useState<BrandConfig>(defaultBrand);
  const [splash, setSplash] = useState<SplashConfig>(defaultSplash);
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [ecommerce, setEcommerce] = useState<EcommerceConfig>(defaultEcommerce);
  const [notification, setNotification] = useState<NotificationConfig>(defaultNotification);
  const [seo, setSeo] = useState<SEOConfig>(defaultSEO);
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig>(defaultFirebase);
  const [cloudflare, setCloudflare] = useState<CloudflareConfig>(defaultCloudflare);
  const [razorpay, setRazorpay] = useState<RazorpayConfig>(defaultRazorpay);
  const [deployment, setDeployment] = useState<DeploymentConfig>(defaultDeployment);
  const [features, setFeatures] = useState<FeaturesConfig>(defaultFeatures);
  const [analytics, setAnalytics] = useState<AnalyticsConfig>(defaultAnalytics);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('superadmin_auth');
    if (saved === 'true') {
      setIsAuthenticated(true);
      loadAllConfig();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const configRef = ref(db, 'super_admin_config/passkey');
      const snap = await get(configRef);
      const storedKey = snap.exists() ? snap.val() : HARDCODED_PASSKEY;
      if (passkey === storedKey || passkey === HARDCODED_PASSKEY) {
        setIsAuthenticated(true);
        sessionStorage.setItem('superadmin_auth', 'true');
        setLoginError('');
        loadAllConfig();
      } else {
        setLoginError('Invalid passkey');
      }
    } catch {
      if (passkey === HARDCODED_PASSKEY) {
        setIsAuthenticated(true);
        sessionStorage.setItem('superadmin_auth', 'true');
        loadAllConfig();
      } else {
        setLoginError('Invalid passkey');
      }
    }
  };

  const loadAllConfig = async () => {
    try {
      const keys = ['brand', 'splash', 'theme', 'ecommerce', 'notifications', 'seo', 'firebase', 'cloudflare', 'razorpay', 'deployment', 'features', 'analytics'];
      const snaps = await Promise.all(keys.map(k => get(ref(db, `super_admin_config/${k}`))));

      if (snaps[0].exists()) setBrand({ ...defaultBrand, ...snaps[0].val() });
      if (snaps[1].exists()) setSplash({ ...defaultSplash, ...snaps[1].val() });
      if (snaps[2].exists()) setTheme({ ...defaultTheme, ...snaps[2].val() });
      if (snaps[3].exists()) setEcommerce({ ...defaultEcommerce, ...snaps[3].val() });
      if (snaps[4].exists()) setNotification({ ...defaultNotification, ...snaps[4].val() });
      if (snaps[5].exists()) setSeo({ ...defaultSEO, ...snaps[5].val() });
      if (snaps[6].exists()) setFirebaseConfig({ ...defaultFirebase, ...snaps[6].val() });
      if (snaps[7].exists()) setCloudflare({ ...defaultCloudflare, ...snaps[7].val() });
      if (snaps[8].exists()) setRazorpay({ ...defaultRazorpay, ...snaps[8].val() });
      if (snaps[9].exists()) setDeployment({ ...defaultDeployment, ...snaps[9].val() });
      if (snaps[10].exists()) setFeatures({ ...defaultFeatures, ...snaps[10].val() });
      if (snaps[11].exists()) setAnalytics({ ...defaultAnalytics, ...snaps[11].val() });
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const saveSection = async (section: string, data: any) => {
    setSaving(true);
    try {
      await set(ref(db, `super_admin_config/${section}`), { ...data, updated_at: new Date().toISOString() });
      
      // Apply theme changes in real-time
      if (section === 'theme') {
        applyBrandColors({
          primary: data.primary_color,
          primaryLight: data.primary_color,
          primaryDark: data.primary_color,
          accent: data.accent_color,
        });
        console.log('[SUPERADMIN] Theme applied in real-time');
      }
      
      // Auto-publish if enabled
      if (deployment.auto_publish && section === 'theme') {
        console.log('[SUPERADMIN] Auto-publishing theme changes...');
        await publishConfigToR2();
      }
      
      showToastMsg(`${section.charAt(0).toUpperCase() + section.slice(1)} saved!`);
    } catch (error) {
      console.error(`Failed to save ${section}:`, error);
      showToastMsg(`Failed to save ${section}`);
    } finally {
      setSaving(false);
    }
  };

  const publishConfigToR2 = async () => {
    try {
      console.log('[SUPERADMIN] Publishing configuration to R2...');
      const publishData = {
        branding: {
          name: brand.name,
          colors: {
            primary: theme.primary_color,
            primaryLight: theme.primary_color,
            primaryDark: theme.primary_color,
            accent: theme.accent_color,
          },
        },
        navigation_settings: {
          background: theme.navbar_color,
          text: theme.text_primary,
          activeTab: theme.primary_color,
          inactiveButton: theme.surface_color,
          borderRadius: theme.button_style === 'pill' ? 'full' : theme.button_style === 'square' ? 'none' : 'md',
          buttonSize: 'md',
          themeMode: 'default',
          buttonLabels: { home: 'Home', shop: 'Shop All', search: 'Search', cart: 'Cart', myOrders: 'My Orders', login: 'Login', signOut: 'Sign Out', admin: 'Admin' }
        },
        published_at: new Date().toISOString(),
      };
      
      const res = await fetch('/api/publish-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: publishData }),
      });
      
      if (res.ok) {
        console.log('[SUPERADMIN] Configuration published successfully');
        showToastMsg('Configuration published to R2!');
      } else {
        console.error('[SUPERADMIN] Publish failed:', await res.text());
      }
    } catch (error) {
      console.error('[SUPERADMIN] Error publishing:', error);
    }
  };

  const showToastMsg = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generateEnvFile = () => {
    const lines = [
      `# ${brand.brand_name} - Environment Variables`,
      `# Generated: ${new Date().toISOString()}`,
      ``,
      `# Firebase`,
      `VITE_FIREBASE_API_KEY=${firebaseConfig.api_key}`,
      `VITE_FIREBASE_AUTH_DOMAIN=${firebaseConfig.auth_domain}`,
      `VITE_FIREBASE_DATABASE_URL=${firebaseConfig.database_url}`,
      `VITE_FIREBASE_PROJECT_ID=${firebaseConfig.project_id}`,
      `VITE_FIREBASE_STORAGE_BUCKET=${firebaseConfig.storage_bucket}`,
      `VITE_FIREBASE_MESSAGING_SENDER_ID=${firebaseConfig.messaging_sender_id}`,
      `VITE_FIREBASE_APP_ID=${firebaseConfig.app_id}`,
      `VITE_FIREBASE_MEASUREMENT_ID=${firebaseConfig.measurement_id}`,
      ``,
      `# Razorpay`,
      `RAZORPAY_KEY_ID=${razorpay.key_id}`,
      `RAZORPAY_KEY_SECRET=${razorpay.key_secret}`,
      `RAZORPAY_WEBHOOK_SECRET=${razorpay.webhook_secret}`,
      `VITE_RAZORPAY_KEY_ID=${razorpay.key_id}`,
      ``,
      `# Cloudflare R2`,
      `R2_ACCOUNT_ID=${cloudflare.account_id}`,
      `R2_ACCESS_KEY_ID=${cloudflare.r2_access_key_id}`,
      `R2_SECRET_ACCESS_KEY=${cloudflare.r2_secret_access_key}`,
      `R2_BUCKET_NAME=${cloudflare.r2_bucket}`,
      `R2_ENDPOINT=${cloudflare.r2_endpoint}`,
      ``,
      `# Notifications`,
      `TELEGRAM_BOT_TOKEN=${notification.telegram_bot_token}`,
      `TELEGRAM_CHAT_ID=${notification.telegram_chat_id}`,
      notification.email_api_key ? `EMAIL_API_KEY=${notification.email_api_key}` : '',
      ``,
      `# Admin`,
      `VITE_ADMIN_ID=${deployment.admin_id || 'admin'}`,
      `VITE_ADMIN_PASSWORD=${deployment.admin_password || 'admin123'}`,
      ``,
      `# Analytics`,
      seo.google_analytics_id ? `VITE_GA_ID=${seo.google_analytics_id}` : '',
      seo.facebook_pixel_id ? `VITE_FB_PIXEL=${seo.facebook_pixel_id}` : '',
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    showToastMsg('Environment variables copied!');
  };

  const generateWranglerConfig = () => {
    const config = [
      `name = "${cloudflare.pages_project || 'my-store'}"`,
      `compatibility_date = "2024-01-01"`,
      ``,
      `[vars]`,
      `RAZORPAY_KEY_ID = "${razorpay.key_id}"`,
      `RAZORPAY_KEY_SECRET = "${razorpay.key_secret}"`,
      notification.telegram_bot_token ? `TELEGRAM_BOT_TOKEN = "${notification.telegram_bot_token}"` : '',
      notification.telegram_chat_id ? `TELEGRAM_CHAT_ID = "${notification.telegram_chat_id}"` : '',
      notification.email_api_key ? `EMAIL_API_KEY = "${notification.email_api_key}"` : '',
      ``,
      `[[r2_buckets]]`,
      `binding = "R2_BUCKET"`,
      `bucket_name = "${cloudflare.r2_bucket}"`,
      cloudflare.kv_namespace_id ? `\n[[kv_namespaces]]\nbinding = "KV"\nid = "${cloudflare.kv_namespace_id}"` : '',
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(config);
    showToastMsg('Wrangler config copied!');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Super Admin</h1>
              <p className="text-slate-400 mt-2">White-label Configuration Center</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter passkey"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all">
                Access Panel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'rebrand', label: 'Rebrand', icon: Palette },
    { id: 'brand', label: 'Brand', icon: Type },
    { id: 'splash', label: 'Splash', icon: Smartphone },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'features', label: 'Features', icon: ToggleLeft },
    { id: 'ecommerce', label: 'Store', icon: ShoppingBag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'firebase', label: 'Firebase', icon: Database },
    { id: 'cloudflare', label: 'Cloudflare', icon: Cloud },
    { id: 'payments', label: 'Payments', icon: Zap },
    { id: 'deployment', label: 'Deploy', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">{brand.brand_name} - Super Admin</h1>
              <p className="text-xs text-slate-400">White-label Config</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={generateEnvFile} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 text-xs font-medium transition-colors">
              <Copy className="w-3.5 h-3.5" /> .env
            </button>
            <button onClick={generateWranglerConfig} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 text-xs font-medium transition-colors">
              <Copy className="w-3.5 h-3.5" /> wrangler
            </button>
            <button onClick={() => { sessionStorage.removeItem('superadmin_auth'); setIsAuthenticated(false); }} className="px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 text-xs font-medium transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex gap-5">
          <nav className="w-44 flex-shrink-0">
            <div className="space-y-0.5 sticky top-20">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          <main className="flex-1 min-w-0">
            {activeTab === 'rebrand' && <RebrandTool showToast={showToastMsg} />}
            {activeTab === 'brand' && (
              <ConfigSection title="Brand Identity" desc="Logo, name, contact info, social links" onSave={() => saveSection('brand', brand)} saving={saving}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Brand Name" value={brand.brand_name} onChange={(v) => setBrand({ ...brand, brand_name: v })} />
                  <InputField label="Tagline" value={brand.brand_tagline} onChange={(v) => setBrand({ ...brand, brand_tagline: v })} />
                  <InputField label="Logo URL" value={brand.brand_logo_url} onChange={(v) => setBrand({ ...brand, brand_logo_url: v })} placeholder="https://..." />
                  <InputField label="Favicon URL" value={brand.brand_favicon_url} onChange={(v) => setBrand({ ...brand, brand_favicon_url: v })} placeholder="https://..." />
                  <InputField label="Contact Email" value={brand.contact_email} onChange={(v) => setBrand({ ...brand, contact_email: v })} />
                  <InputField label="Support Email" value={brand.support_email} onChange={(v) => setBrand({ ...brand, support_email: v })} />
                  <InputField label="Contact Phone" value={brand.contact_phone} onChange={(v) => setBrand({ ...brand, contact_phone: v })} />
                  <InputField label="WhatsApp" value={brand.whatsapp_number} onChange={(v) => setBrand({ ...brand, whatsapp_number: v })} placeholder="919876543210" />
                  <InputField label="Instagram" value={brand.instagram_url} onChange={(v) => setBrand({ ...brand, instagram_url: v })} />
                  <InputField label="Facebook" value={brand.facebook_url} onChange={(v) => setBrand({ ...brand, facebook_url: v })} />
                  <InputField label="Twitter/X" value={brand.twitter_url} onChange={(v) => setBrand({ ...brand, twitter_url: v })} />
                  <InputField label="YouTube" value={brand.youtube_url} onChange={(v) => setBrand({ ...brand, youtube_url: v })} />
                  <InputField label="Website Domain" value={brand.website_domain} onChange={(v) => setBrand({ ...brand, website_domain: v })} placeholder="yourbrand.com" />
                  <InputField label="Business Address" value={brand.address} onChange={(v) => setBrand({ ...brand, address: v })} />
                </div>
                {brand.brand_logo_url && (
                  <div className="mt-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-400 mb-2">Logo Preview</p>
                    <img src={brand.brand_logo_url} alt="Logo" className="h-12 object-contain" />
                  </div>
                )}
              </ConfigSection>
            )}

            {activeTab === 'splash' && (
              <ConfigSection title="Splash Screen" desc="Loading animation, logo, duration, and style" onSave={() => saveSection('splash', splash)} saving={saving}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer bg-slate-800 px-4 py-3 rounded-lg border border-slate-700">
                      <input type="checkbox" checked={splash.show_splash} onChange={(e) => setSplash({ ...splash, show_splash: e.target.checked })} className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-400" />
                      <span className="text-sm text-slate-300 font-medium">Show Splash Screen on Load</span>
                    </label>
                  </div>
                  <InputField label="Splash Logo URL" value={splash.splash_logo_url} onChange={(v) => setSplash({ ...splash, splash_logo_url: v })} placeholder="https://... (image)" />
                  <InputField label="Splash Video URL" value={splash.splash_video_url} onChange={(v) => setSplash({ ...splash, splash_video_url: v })} placeholder="/logoanim.webm" />
                  <InputField label="Splash Tagline" value={splash.splash_tagline} onChange={(v) => setSplash({ ...splash, splash_tagline: v })} placeholder="Loading..." />
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Duration (ms)</label>
                    <input type="number" value={splash.splash_duration_ms} onChange={(e) => setSplash({ ...splash, splash_duration_ms: Number(e.target.value) })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                  </div>
                  <ColorField label="Background Color" value={splash.splash_background_color} onChange={(v) => setSplash({ ...splash, splash_background_color: v })} />
                  <ColorField label="Text Color" value={splash.splash_text_color} onChange={(v) => setSplash({ ...splash, splash_text_color: v })} />
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Animation Type</label>
                    <select value={splash.splash_animation_type} onChange={(e) => setSplash({ ...splash, splash_animation_type: e.target.value as any })} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400">
                      <option value="fade">Fade</option>
                      <option value="zoom">Zoom</option>
                      <option value="slide">Slide</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-lg border border-slate-700" style={{ backgroundColor: splash.splash_background_color }}>
                  <p className="text-xs text-center" style={{ color: splash.splash_text_color }}>Splash Preview</p>
                  {splash.splash_logo_url && <img src={splash.splash_logo_url} alt="Splash" className="h-16 mx-auto mt-2 object-contain" />}
                  {splash.splash_tagline && <p className="text-center mt-2 text-sm font-medium" style={{ color: splash.splash_text_color }}>{splash.splash_tagline}</p>}
                </div>
              </ConfigSection>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-4">
                <ConfigSection title="Theme & Design" desc="Colors, fonts, presets, component styles" onSave={() => saveSection('theme', theme)} saving={saving}>
                  <div className="mb-5">
                    <h3 className="text-xs font-semibold text-slate-300 mb-2">Quick Presets</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(themePresets).map(([name, preset]) => (
                        <button key={name} onClick={() => setTheme({ ...theme, ...preset })} className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700 hover:border-cyan-500/50 transition-all text-left">
                          <div className="flex gap-0.5">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary_color }} />
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.secondary_color }} />
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accent_color }} />
                          </div>
                          <span className="text-[10px] font-medium text-slate-300">{name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <ColorField label="Primary" value={theme.primary_color} onChange={(v) => setTheme({ ...theme, primary_color: v })} />
                  <ColorField label="Secondary" value={theme.secondary_color} onChange={(v) => setTheme({ ...theme, secondary_color: v })} />
                  <ColorField label="Accent" value={theme.accent_color} onChange={(v) => setTheme({ ...theme, accent_color: v })} />
                  <ColorField label="Success" value={theme.success_color} onChange={(v) => setTheme({ ...theme, success_color: v })} />
                  <ColorField label="Warning" value={theme.warning_color} onChange={(v) => setTheme({ ...theme, warning_color: v })} />
                  <ColorField label="Error" value={theme.error_color} onChange={(v) => setTheme({ ...theme, error_color: v })} />
                  <ColorField label="Background" value={theme.background_color} onChange={(v) => setTheme({ ...theme, background_color: v })} />
                  <ColorField label="Surface" value={theme.surface_color} onChange={(v) => setTheme({ ...theme, surface_color: v })} />
                  <ColorField label="Text" value={theme.text_primary} onChange={(v) => setTheme({ ...theme, text_primary: v })} />
                  <ColorField label="Text Muted" value={theme.text_secondary} onChange={(v) => setTheme({ ...theme, text_secondary: v })} />
                  <ColorField label="Navbar" value={theme.navbar_color} onChange={(v) => setTheme({ ...theme, navbar_color: v })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SelectField label="Body Font" value={theme.font_family} options={fontOptions.map(f => ({ value: f, label: f.split(',')[0] }))} onChange={(v) => setTheme({ ...theme, font_family: v })} />
                  <SelectField label="Heading Font" value={theme.heading_font} options={fontOptions.map(f => ({ value: f, label: f.split(',')[0] }))} onChange={(v) => setTheme({ ...theme, heading_font: v })} />
                  <InputField label="Border Radius" value={theme.border_radius} onChange={(v) => setTheme({ ...theme, border_radius: v })} />
                  <SelectField label="Navbar Style" value={theme.navbar_style} options={[{value:'solid',label:'Solid'},{value:'glass',label:'Glass'},{value:'transparent',label:'Transparent'}]} onChange={(v) => setTheme({ ...theme, navbar_style: v as any })} />
                  <SelectField label="Button Style" value={theme.button_style} options={[{value:'rounded',label:'Rounded'},{value:'pill',label:'Pill'},{value:'square',label:'Square'}]} onChange={(v) => setTheme({ ...theme, button_style: v as any })} />
                  <InputField label="Card Shadow" value={theme.card_shadow} onChange={(v) => setTheme({ ...theme, card_shadow: v })} />
                </div>
                <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">Button Preview</p>
                  <div className="flex gap-2 flex-wrap">
                    {[{c: theme.primary_color, l:'Primary'},{c: theme.secondary_color, l:'Secondary'},{c: theme.accent_color, l:'Accent'}].map(b => (
                      <button key={b.l} className="px-4 py-2 text-white text-xs font-medium" style={{ backgroundColor: b.c, borderRadius: theme.button_style === 'pill' ? '9999px' : theme.button_style === 'square' ? '4px' : theme.border_radius }}>{b.l}</button>
                    ))}
                  </div>
                </div>
                </ConfigSection>
                
                <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-700/50 rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-green-300 flex items-center gap-2 mb-1">
                        <Live className="w-4 h-4" />
                        Live Theme Publishing
                      </h3>
                      <p className="text-xs text-slate-400">Publish your theme changes immediately to all live sites</p>
                    </div>
                    <button onClick={() => publishConfigToR2()} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 text-sm">
                      <Zap className="w-4 h-4" />
                      {saving ? 'Publishing...' : 'Publish Now'}
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-slate-400 space-y-1">
                    <p>• Changes will be live in real-time on all active sites</p>
                    <p>• Auto-publish is {deployment.auto_publish ? 'enabled' : 'disabled'} in Deployment settings</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ecommerce' && (
              <ConfigSection title="E-Commerce Settings" desc="Currency, shipping, tax, order rules, features" onSave={() => saveSection('ecommerce', ecommerce)} saving={saving}>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Currency & Pricing</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <SelectField label="Currency" value={ecommerce.currency} options={[{value:'INR',label:'INR'},{value:'USD',label:'USD'},{value:'EUR',label:'EUR'},{value:'GBP',label:'GBP'}]} onChange={(v) => setEcommerce({...ecommerce, currency: v})} />
                      <InputField label="Symbol" value={ecommerce.currency_symbol} onChange={(v) => setEcommerce({...ecommerce, currency_symbol: v})} />
                      <InputField label="Order Prefix" value={ecommerce.order_prefix} onChange={(v) => setEcommerce({...ecommerce, order_prefix: v})} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Tax</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <ToggleField label="Tax Enabled" checked={ecommerce.tax_enabled} onChange={(v) => setEcommerce({...ecommerce, tax_enabled: v})} />
                      <NumberField label="Tax %" value={ecommerce.tax_percentage} onChange={(v) => setEcommerce({...ecommerce, tax_percentage: v})} />
                      <InputField label="Tax Label" value={ecommerce.tax_label} onChange={(v) => setEcommerce({...ecommerce, tax_label: v})} />
                      <InputField label="GST Number" value={ecommerce.gst_number} onChange={(v) => setEcommerce({...ecommerce, gst_number: v})} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Shipping</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <NumberField label="Default Charge" value={ecommerce.default_shipping_charge} onChange={(v) => setEcommerce({...ecommerce, default_shipping_charge: v})} />
                      <NumberField label="Free Shipping Above" value={ecommerce.free_shipping_threshold} onChange={(v) => setEcommerce({...ecommerce, free_shipping_threshold: v})} />
                      <ToggleField label="COD Enabled" checked={ecommerce.cod_enabled} onChange={(v) => setEcommerce({...ecommerce, cod_enabled: v})} />
                      <NumberField label="COD Extra Charge" value={ecommerce.cod_extra_charge} onChange={(v) => setEcommerce({...ecommerce, cod_extra_charge: v})} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Order Rules</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <NumberField label="Min Order Amount" value={ecommerce.min_order_amount} onChange={(v) => setEcommerce({...ecommerce, min_order_amount: v})} />
                      <NumberField label="Max Qty per Item" value={ecommerce.max_order_quantity} onChange={(v) => setEcommerce({...ecommerce, max_order_quantity: v})} />
                      <NumberField label="Return Days" value={ecommerce.return_policy_days} onChange={(v) => setEcommerce({...ecommerce, return_policy_days: v})} />
                      <ToggleField label="Auto Confirm Orders" checked={ecommerce.auto_confirm_orders} onChange={(v) => setEcommerce({...ecommerce, auto_confirm_orders: v})} />
                      <ToggleField label="Guest Checkout" checked={ecommerce.allow_guest_checkout} onChange={(v) => setEcommerce({...ecommerce, allow_guest_checkout: v})} />
                      <ToggleField label="Review Moderation" checked={ecommerce.review_moderation} onChange={(v) => setEcommerce({...ecommerce, review_moderation: v})} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <ToggleField label="Stock Management" checked={ecommerce.stock_management} onChange={(v) => setEcommerce({...ecommerce, stock_management: v})} />
                      <NumberField label="Low Stock Alert" value={ecommerce.low_stock_alert} onChange={(v) => setEcommerce({...ecommerce, low_stock_alert: v})} />
                      <ToggleField label="Wishlist" checked={ecommerce.wishlist_enabled} onChange={(v) => setEcommerce({...ecommerce, wishlist_enabled: v})} />
                      <ToggleField label="Compare Products" checked={ecommerce.compare_products} onChange={(v) => setEcommerce({...ecommerce, compare_products: v})} />
                      <ToggleField label="Size Chart" checked={ecommerce.size_chart_enabled} onChange={(v) => setEcommerce({...ecommerce, size_chart_enabled: v})} />
                    </div>
                  </div>
                </div>
              </ConfigSection>
            )}

            {activeTab === 'notifications' && (
              <ConfigSection title="Notifications & Alerts" desc="Telegram, Email, WhatsApp, SMS, Push" onSave={() => saveSection('notifications', notification)} saving={saving}>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Telegram</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ToggleField label="Telegram Orders" checked={notification.telegram_enabled} onChange={(v) => setNotification({...notification, telegram_enabled: v})} />
                      <div />
                      <SecretField label="Bot Token" value={notification.telegram_bot_token} onChange={(v) => setNotification({...notification, telegram_bot_token: v})} show={showSecrets['tg_token']} onToggle={() => toggleSecret('tg_token')} />
                      <InputField label="Chat ID" value={notification.telegram_chat_id} onChange={(v) => setNotification({...notification, telegram_chat_id: v})} placeholder="-1001234567890" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Email</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ToggleField label="Email Notifications" checked={notification.email_enabled} onChange={(v) => setNotification({...notification, email_enabled: v})} />
                      <SelectField label="Provider" value={notification.email_provider} options={[{value:'resend',label:'Resend'},{value:'sendgrid',label:'SendGrid'},{value:'smtp',label:'SMTP'}]} onChange={(v) => setNotification({...notification, email_provider: v as any})} />
                      <SecretField label="API Key" value={notification.email_api_key} onChange={(v) => setNotification({...notification, email_api_key: v})} show={showSecrets['email_key']} onToggle={() => toggleSecret('email_key')} />
                      <InputField label="From Email" value={notification.email_from} onChange={(v) => setNotification({...notification, email_from: v})} placeholder="orders@brand.com" />
                      <InputField label="From Name" value={notification.email_from_name} onChange={(v) => setNotification({...notification, email_from_name: v})} placeholder="Brand Name" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">WhatsApp & SMS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ToggleField label="WhatsApp Order Notify" checked={notification.whatsapp_order_notify} onChange={(v) => setNotification({...notification, whatsapp_order_notify: v})} />
                      <InputField label="Admin WhatsApp" value={notification.whatsapp_admin_number} onChange={(v) => setNotification({...notification, whatsapp_admin_number: v})} />
                      <ToggleField label="SMS Enabled" checked={notification.sms_enabled} onChange={(v) => setNotification({...notification, sms_enabled: v})} />
                      <InputField label="SMS Provider" value={notification.sms_provider} onChange={(v) => setNotification({...notification, sms_provider: v})} placeholder="twilio / msg91" />
                      <SecretField label="SMS API Key" value={notification.sms_api_key} onChange={(v) => setNotification({...notification, sms_api_key: v})} show={showSecrets['sms_key']} onToggle={() => toggleSecret('sms_key')} />
                      <ToggleField label="Push Notifications" checked={notification.push_notifications} onChange={(v) => setNotification({...notification, push_notifications: v})} />
                    </div>
                  </div>
                </div>
              </ConfigSection>
            )}

            {activeTab === 'seo' && (
              <ConfigSection title="SEO & Analytics" desc="Meta tags, Open Graph, tracking pixels, schema" onSave={() => saveSection('seo', seo)} saving={saving}>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Meta Tags</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <InputField label="Page Title" value={seo.meta_title} onChange={(v) => setSeo({...seo, meta_title: v})} placeholder="Brand - Best Products Online" />
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Meta Description</label>
                        <textarea value={seo.meta_description} onChange={(e) => setSeo({...seo, meta_description: e.target.value})} rows={3} placeholder="Describe your store in 160 characters..." className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none" />
                      </div>
                      <InputField label="Keywords" value={seo.meta_keywords} onChange={(v) => setSeo({...seo, meta_keywords: v})} placeholder="hair accessories, clips, bands" />
                      <InputField label="OG Image URL" value={seo.og_image} onChange={(v) => setSeo({...seo, og_image: v})} placeholder="https://..." />
                      <InputField label="Canonical URL" value={seo.canonical_url} onChange={(v) => setSeo({...seo, canonical_url: v})} placeholder="https://yourdomain.com" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Analytics & Tracking</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Google Analytics ID" value={seo.google_analytics_id} onChange={(v) => setSeo({...seo, google_analytics_id: v})} placeholder="G-XXXXXXXXX" />
                      <InputField label="Google Tag Manager" value={seo.google_tag_manager_id} onChange={(v) => setSeo({...seo, google_tag_manager_id: v})} placeholder="GTM-XXXXXXX" />
                      <InputField label="Facebook Pixel ID" value={seo.facebook_pixel_id} onChange={(v) => setSeo({...seo, facebook_pixel_id: v})} placeholder="123456789" />
                      <SelectField label="Structured Data" value={seo.structured_data_type} options={[{value:'Product',label:'Product'},{value:'Organization',label:'Organization'},{value:'LocalBusiness',label:'Local Business'}]} onChange={(v) => setSeo({...seo, structured_data_type: v})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Robots.txt</label>
                    <textarea value={seo.robots_txt} onChange={(e) => setSeo({...seo, robots_txt: e.target.value})} rows={4} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none" />
                  </div>
                </div>
              </ConfigSection>
            )}

            {activeTab === 'firebase' && (
              <ConfigSection title="Firebase Configuration" desc="Realtime Database, Auth, Storage" onSave={() => saveSection('firebase', firebaseConfig)} saving={saving}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SecretField label="API Key" value={firebaseConfig.api_key} onChange={(v) => setFirebaseConfig({...firebaseConfig, api_key: v})} show={showSecrets['fb_api']} onToggle={() => toggleSecret('fb_api')} />
                  <InputField label="Auth Domain" value={firebaseConfig.auth_domain} onChange={(v) => setFirebaseConfig({...firebaseConfig, auth_domain: v})} placeholder="project.firebaseapp.com" />
                  <InputField label="Database URL" value={firebaseConfig.database_url} onChange={(v) => setFirebaseConfig({...firebaseConfig, database_url: v})} placeholder="https://project-default-rtdb.firebaseio.com" />
                  <InputField label="Project ID" value={firebaseConfig.project_id} onChange={(v) => setFirebaseConfig({...firebaseConfig, project_id: v})} />
                  <InputField label="Storage Bucket" value={firebaseConfig.storage_bucket} onChange={(v) => setFirebaseConfig({...firebaseConfig, storage_bucket: v})} />
                  <InputField label="Messaging Sender ID" value={firebaseConfig.messaging_sender_id} onChange={(v) => setFirebaseConfig({...firebaseConfig, messaging_sender_id: v})} />
                  <InputField label="App ID" value={firebaseConfig.app_id} onChange={(v) => setFirebaseConfig({...firebaseConfig, app_id: v})} />
                  <InputField label="Measurement ID" value={firebaseConfig.measurement_id} onChange={(v) => setFirebaseConfig({...firebaseConfig, measurement_id: v})} placeholder="G-XXXXXXX" />
                </div>
              </ConfigSection>
            )}

            {activeTab === 'cloudflare' && (
              <ConfigSection title="Cloudflare Configuration" desc="Pages, R2 storage, KV, Workers" onSave={() => saveSection('cloudflare', cloudflare)} saving={saving}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SecretField label="Account ID" value={cloudflare.account_id} onChange={(v) => setCloudflare({...cloudflare, account_id: v})} show={showSecrets['cf_acct']} onToggle={() => toggleSecret('cf_acct')} />
                  <InputField label="Pages Project" value={cloudflare.pages_project} onChange={(v) => setCloudflare({...cloudflare, pages_project: v})} placeholder="my-store" />
                  <InputField label="Custom Domain" value={cloudflare.custom_domain} onChange={(v) => setCloudflare({...cloudflare, custom_domain: v})} placeholder="store.yourdomain.com" />
                  <InputField label="Workers Route" value={cloudflare.workers_route} onChange={(v) => setCloudflare({...cloudflare, workers_route: v})} placeholder="*.yourdomain.com/*" />
                  <InputField label="R2 Bucket" value={cloudflare.r2_bucket} onChange={(v) => setCloudflare({...cloudflare, r2_bucket: v})} />
                  <SecretField label="R2 Access Key" value={cloudflare.r2_access_key_id} onChange={(v) => setCloudflare({...cloudflare, r2_access_key_id: v})} show={showSecrets['r2_key']} onToggle={() => toggleSecret('r2_key')} />
                  <SecretField label="R2 Secret Key" value={cloudflare.r2_secret_access_key} onChange={(v) => setCloudflare({...cloudflare, r2_secret_access_key: v})} show={showSecrets['r2_sec']} onToggle={() => toggleSecret('r2_sec')} />
                  <InputField label="R2 Endpoint" value={cloudflare.r2_endpoint} onChange={(v) => setCloudflare({...cloudflare, r2_endpoint: v})} />
                  <InputField label="KV Namespace ID" value={cloudflare.kv_namespace_id} onChange={(v) => setCloudflare({...cloudflare, kv_namespace_id: v})} />
                </div>
              </ConfigSection>
            )}

            {activeTab === 'payments' && (
              <ConfigSection title="Payment Gateway" desc="Razorpay configuration" onSave={() => saveSection('razorpay', razorpay)} saving={saving}>
                <div className="grid grid-cols-1 gap-4">
                  <SecretField label="Key ID" value={razorpay.key_id} onChange={(v) => setRazorpay({...razorpay, key_id: v})} show={showSecrets['rp_key']} onToggle={() => toggleSecret('rp_key')} placeholder="rzp_live_..." />
                  <SecretField label="Key Secret" value={razorpay.key_secret} onChange={(v) => setRazorpay({...razorpay, key_secret: v})} show={showSecrets['rp_sec']} onToggle={() => toggleSecret('rp_sec')} />
                  <SecretField label="Webhook Secret" value={razorpay.webhook_secret} onChange={(v) => setRazorpay({...razorpay, webhook_secret: v})} show={showSecrets['rp_wh']} onToggle={() => toggleSecret('rp_wh')} />
                </div>
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-amber-300 text-xs">These must also be set in Cloudflare Pages environment variables. Use "Copy .env" above.</p>
                </div>
              </ConfigSection>
            )}

            {activeTab === 'features' && (
              <ConfigSection title="Feature Toggles" desc="Enable or disable features for the client-side storefront" onSave={() => saveSection('features', features)} saving={saving}>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Shopping Experience</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <ToggleField label="Product Filters" checked={features.product_filters} onChange={(v) => setFeatures({...features, product_filters: v})} />
                      <ToggleField label="Search Bar" checked={features.search_bar} onChange={(v) => setFeatures({...features, search_bar: v})} />
                      <ToggleField label="Wishlist" checked={features.wishlist} onChange={(v) => setFeatures({...features, wishlist: v})} />
                      <ToggleField label="Product Zoom" checked={features.product_zoom} onChange={(v) => setFeatures({...features, product_zoom: v})} />
                      <ToggleField label="Gallery View" checked={features.gallery_view} onChange={(v) => setFeatures({...features, gallery_view: v})} />
                      <ToggleField label="Size Chart" checked={features.size_chart} onChange={(v) => setFeatures({...features, size_chart: v})} />
                      <ToggleField label="Might You Like" checked={features.might_you_like} onChange={(v) => setFeatures({...features, might_you_like: v})} />
                      <ToggleField label="Featured Categories" checked={features.featured_categories} onChange={(v) => setFeatures({...features, featured_categories: v})} />
                      <ToggleField label="Social Share" checked={features.social_share} onChange={(v) => setFeatures({...features, social_share: v})} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Advanced Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <ToggleField label="Virtual Try-On" checked={features.virtual_try_on} onChange={(v) => setFeatures({...features, virtual_try_on: v})} />
                      <ToggleField label="Dress Color Matcher" checked={features.dress_color_matcher} onChange={(v) => setFeatures({...features, dress_color_matcher: v})} />
                      <ToggleField label="AI Assistant" checked={features.ai_assistant} onChange={(v) => setFeatures({...features, ai_assistant: v})} />
                      <ToggleField label="Multi Currency" checked={features.multi_currency} onChange={(v) => setFeatures({...features, multi_currency: v})} />
                      <ToggleField label="Intl WhatsApp Checkout" checked={features.international_whatsapp_checkout} onChange={(v) => setFeatures({...features, international_whatsapp_checkout: v})} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Communication</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <ToggleField label="WhatsApp Chat" checked={features.whatsapp_chat} onChange={(v) => setFeatures({...features, whatsapp_chat: v})} />
                      <ToggleField label="WhatsApp FAB" checked={features.whatsapp_fab} onChange={(v) => setFeatures({...features, whatsapp_fab: v})} />
                      <ToggleField label="Enquiry Form" checked={features.enquiry_form} onChange={(v) => setFeatures({...features, enquiry_form: v})} />
                      <ToggleField label="Feedback Panel" checked={features.feedback_panel} onChange={(v) => setFeatures({...features, feedback_panel: v})} />
                      <ToggleField label="Customer Reviews" checked={features.customer_reviews} onChange={(v) => setFeatures({...features, customer_reviews: v})} />
                      <ToggleField label="FAQ Section" checked={features.faq_section} onChange={(v) => setFeatures({...features, faq_section: v})} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">UI Elements</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <ToggleField label="Cart FAB" checked={features.cart_fab} onChange={(v) => setFeatures({...features, cart_fab: v})} />
                      <ToggleField label="Smart Feature FAB" checked={features.smart_feature_fab} onChange={(v) => setFeatures({...features, smart_feature_fab: v})} />
                      <ToggleField label="Scroll to Top" checked={features.scroll_to_top} onChange={(v) => setFeatures({...features, scroll_to_top: v})} />
                      <ToggleField label="Purchase Notifications" checked={features.purchase_notifications} onChange={(v) => setFeatures({...features, purchase_notifications: v})} />
                      <ToggleField label="Top Banner" checked={features.top_banner} onChange={(v) => setFeatures({...features, top_banner: v})} />
                      <ToggleField label="Welcome Banner" checked={features.welcome_banner} onChange={(v) => setFeatures({...features, welcome_banner: v})} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Promotions & Media</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <ToggleField label="Offer Popup" checked={features.offer_popup} onChange={(v) => setFeatures({...features, offer_popup: v})} />
                      <ToggleField label="Welcome Coupon" checked={features.welcome_coupon} onChange={(v) => setFeatures({...features, welcome_coupon: v})} />
                      <ToggleField label="Coupon System" checked={features.coupon_system} onChange={(v) => setFeatures({...features, coupon_system: v})} />
                      <ToggleField label="Video Sections" checked={features.video_sections} onChange={(v) => setFeatures({...features, video_sections: v})} />
                      <ToggleField label="Video Overlay" checked={features.video_overlay} onChange={(v) => setFeatures({...features, video_overlay: v})} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Order Management</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <ToggleField label="Order Tracking" checked={features.order_tracking} onChange={(v) => setFeatures({...features, order_tracking: v})} />
                      <ToggleField label="Invoice Download" checked={features.invoice_download} onChange={(v) => setFeatures({...features, invoice_download: v})} />
                    </div>
                  </div>
                </div>
              </ConfigSection>
            )}

            {activeTab === 'analytics' && (
              <ConfigSection title="Analytics & Tracking" desc="Google Tag Manager, pixels, conversion tracking, heatmaps" onSave={() => saveSection('analytics', analytics)} saving={saving}>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Google</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Google Analytics (GA4)" value={analytics.google_analytics_id} onChange={(v) => setAnalytics({...analytics, google_analytics_id: v})} placeholder="G-XXXXXXXXXX" />
                      <InputField label="Google Tag Manager" value={analytics.google_tag_manager_id} onChange={(v) => setAnalytics({...analytics, google_tag_manager_id: v})} placeholder="GTM-XXXXXXX" />
                      <InputField label="GTM Auth" value={analytics.gtm_auth} onChange={(v) => setAnalytics({...analytics, gtm_auth: v})} placeholder="Optional auth parameter" />
                      <InputField label="GTM Preview" value={analytics.gtm_preview} onChange={(v) => setAnalytics({...analytics, gtm_preview: v})} placeholder="Optional env preview" />
                      <InputField label="Google Ads ID" value={analytics.google_ads_id} onChange={(v) => setAnalytics({...analytics, google_ads_id: v})} placeholder="AW-XXXXXXXXX" />
                      <InputField label="Ads Conversion Label" value={analytics.google_ads_conversion_label} onChange={(v) => setAnalytics({...analytics, google_ads_conversion_label: v})} placeholder="Purchase conversion label" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Social Pixels</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Facebook Pixel" value={analytics.facebook_pixel_id} onChange={(v) => setAnalytics({...analytics, facebook_pixel_id: v})} placeholder="123456789012345" />
                      <SecretField label="FB Conversions API Token" value={analytics.facebook_conversions_api_token} onChange={(v) => setAnalytics({...analytics, facebook_conversions_api_token: v})} show={showSecrets['fb_capi']} onToggle={() => toggleSecret('fb_capi')} />
                      <InputField label="TikTok Pixel" value={analytics.tiktok_pixel_id} onChange={(v) => setAnalytics({...analytics, tiktok_pixel_id: v})} placeholder="XXXXXXX" />
                      <InputField label="Snapchat Pixel" value={analytics.snapchat_pixel_id} onChange={(v) => setAnalytics({...analytics, snapchat_pixel_id: v})} />
                      <InputField label="Pinterest Tag" value={analytics.pinterest_tag_id} onChange={(v) => setAnalytics({...analytics, pinterest_tag_id: v})} />
                      <InputField label="Twitter/X Pixel" value={analytics.twitter_pixel_id} onChange={(v) => setAnalytics({...analytics, twitter_pixel_id: v})} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Behavior & Heatmaps</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Microsoft Clarity" value={analytics.microsoft_clarity_id} onChange={(v) => setAnalytics({...analytics, microsoft_clarity_id: v})} placeholder="Project ID" />
                      <InputField label="Hotjar ID" value={analytics.hotjar_id} onChange={(v) => setAnalytics({...analytics, hotjar_id: v})} placeholder="Site ID" />
                      <InputField label="Mixpanel Token" value={analytics.mixpanel_token} onChange={(v) => setAnalytics({...analytics, mixpanel_token: v})} />
                      <InputField label="Amplitude API Key" value={analytics.amplitude_api_key} onChange={(v) => setAnalytics({...analytics, amplitude_api_key: v})} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">E-Commerce Events</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <ToggleField label="Enhanced E-commerce" checked={analytics.enhanced_ecommerce} onChange={(v) => setAnalytics({...analytics, enhanced_ecommerce: v})} />
                      <ToggleField label="Track Add to Cart" checked={analytics.track_add_to_cart} onChange={(v) => setAnalytics({...analytics, track_add_to_cart: v})} />
                      <ToggleField label="Track Checkout" checked={analytics.track_checkout} onChange={(v) => setAnalytics({...analytics, track_checkout: v})} />
                      <ToggleField label="Track Purchase" checked={analytics.track_purchase} onChange={(v) => setAnalytics({...analytics, track_purchase: v})} />
                      <ToggleField label="Track Search" checked={analytics.track_search} onChange={(v) => setAnalytics({...analytics, track_search: v})} />
                      <ToggleField label="Track View Item" checked={analytics.track_view_item} onChange={(v) => setAnalytics({...analytics, track_view_item: v})} />
                      <ToggleField label="Cookie Consent" checked={analytics.cookie_consent_enabled} onChange={(v) => setAnalytics({...analytics, cookie_consent_enabled: v})} />
                      <ToggleField label="Anonymize IP" checked={analytics.anonymize_ip} onChange={(v) => setAnalytics({...analytics, anonymize_ip: v})} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Custom Scripts</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Custom Head Scripts</label>
                        <textarea value={analytics.custom_head_scripts} onChange={(e) => setAnalytics({...analytics, custom_head_scripts: e.target.value})} rows={4} placeholder="<!-- Paste scripts to inject in <head> -->" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Custom Body Scripts</label>
                        <textarea value={analytics.custom_body_scripts} onChange={(e) => setAnalytics({...analytics, custom_body_scripts: e.target.value})} rows={4} placeholder="<!-- Paste scripts for end of <body> -->" className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </ConfigSection>
            )}

            {activeTab === 'deployment' && (
              <ConfigSection title="Deployment & Access" desc="Environment, credentials, deploy tools" onSave={() => saveSection('deployment', deployment)} saving={saving}>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField label="Environment" value={deployment.environment} options={[{value:'development',label:'Development'},{value:'staging',label:'Staging'},{value:'production',label:'Production'}]} onChange={(v) => setDeployment({...deployment, environment: v as any})} />
                    <ToggleField label="Maintenance Mode" checked={deployment.maintenance_mode} onChange={(v) => setDeployment({...deployment, maintenance_mode: v})} />
                    <ToggleField label="Auto Publish on Save" checked={deployment.auto_publish} onChange={(v) => setDeployment({...deployment, auto_publish: v})} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-cyan-300 mb-3 uppercase tracking-wider">Admin Credentials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Admin ID" value={deployment.admin_id} onChange={(v) => setDeployment({...deployment, admin_id: v})} placeholder="admin" />
                      <SecretField label="Admin Password" value={deployment.admin_password} onChange={(v) => setDeployment({...deployment, admin_password: v})} show={showSecrets['adm_pw']} onToggle={() => toggleSecret('adm_pw')} />
                      <SecretField label="Super Admin Passkey" value={deployment.super_admin_passkey} onChange={(v) => setDeployment({...deployment, super_admin_passkey: v})} show={showSecrets['sa_pk']} onToggle={() => toggleSecret('sa_pk')} placeholder="Change the super admin passkey" />
                    </div>
                  </div>
                  <div className="border-t border-slate-700 pt-5">
                    <h3 className="text-xs font-semibold text-slate-300 mb-3">Deploy New Brand Checklist</h3>
                    <div className="space-y-1.5">
                      {[
                        '1. Configure Brand tab (name, logo, contacts)',
                        '2. Set Splash screen logo/video',
                        '3. Pick theme colors & fonts',
                        '4. Set e-commerce rules (currency, shipping, tax)',
                        '5. Add notification channels (Telegram, Email)',
                        '6. Fill in SEO meta tags & analytics IDs',
                        '7. Create Firebase project & paste config',
                        '8. Create Cloudflare Pages project & R2 bucket',
                        '9. Add Razorpay keys',
                        '10. Copy .env -> add to Cloudflare env vars',
                        '11. Deploy to Cloudflare Pages',
                        '12. Connect custom domain',
                      ].map((step) => (
                        <div key={step} className="flex items-start gap-2 px-3 py-1.5 rounded bg-slate-800/50">
                          <span className="text-xs text-slate-400">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ConfigSection>
            )}
          </main>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 bg-cyan-500 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-pulse">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}

function ConfigSection({ title, desc, children, onSave, saving }: { title: string; desc: string; children: React.ReactNode; onSave: () => void; saving: boolean }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-700">
        <h2 className="text-base font-bold text-white">{title}</h2>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
      <div className="p-5">{children}</div>
      <div className="px-5 py-3 border-t border-slate-700 flex justify-end">
        <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all disabled:opacity-50 text-sm">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, className }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer bg-slate-800 px-3 py-2.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-all">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-400" />
      <span className="text-xs text-slate-300 font-medium">{label}</span>
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: {value: string; label: string}[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function SecretField({ label, value, onChange, show, onToggle, placeholder }: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 pr-9 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
        <button type="button" onClick={onToggle} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <div className="flex items-center gap-1.5">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400" />
      </div>
    </div>
  );
}
