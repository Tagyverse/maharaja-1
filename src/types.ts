export interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  featured: boolean;
  new_arrival?: boolean;
  bg_color?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  category_id?: string;
  category_ids: string[];
  image_url: string;
  gallery_images: string[];
  video_url?: string;
  in_stock: boolean;
  featured: boolean;
  best_selling?: boolean;
  might_you_like?: boolean;
  sizes?: string[];
  colors?: string[];
  default_size?: string;
  default_color?: string;
  size_pricing?: { [size: string]: { price: number; compare_at_price?: number } };
  try_on_enabled?: boolean;
  try_on_image_url?: string;
  hairclip_type?: 'side' | 'top' | 'back' | 'headband' | 'full';
  availableColors?: string[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  customer_name: string;
  review_text: string;
  is_active: boolean;
  created_at: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomepageSection {
  id: string;
  title: string;
  subtitle: string | null;
  content_type: 'category' | 'product';
  display_type: 'horizontal' | 'vertical' | 'carousel' | 'swipable' | 'grid' | 'horizontal_normal' | 'vertical_normal';
  selected_items: string[];
  is_visible: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase?: number;
  max_discount?: number;
  usage_limit?: number;
  usage_count?: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TryOnModel {
  id: string;
  name: string;
  image_url: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessConfig {
  id?: string;
  company_name: string;
  logo_url: string;
  tagline: string;
  legal_business_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  business_address: string;
  business_city: string;
  business_state: string;
  business_country: string;
  business_zip: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  terms_of_service: string;
  return_policy: string;
  warranty_information: string;
  custom_policies: Record<string, string>;
  seo_meta_title: string;
  seo_meta_description: string;
  seo_og_image: string;
  seo_keywords: string[];
  theme_font_family: string;
  theme_dark_mode_enabled: boolean;
  theme_color_scheme: 'light' | 'dark' | 'auto';
  theme_button_style: 'rounded' | 'square';
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface OrderChannel {
  id?: string;
  type: 'whatsapp' | 'telegram' | 'web';
  enabled: boolean;
  phone_number?: string;
  bot_token?: string;
  chat_id?: string;
  api_key?: string;
  message_templates: Record<string, string>;
  test_status?: 'pending' | 'success' | 'failed';
  test_message?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  channel: 'whatsapp' | 'telegram' | 'web';
  items: Array<{ product_id: string; quantity: number; price: number }>;
  shipping_address: string;
  notes: string;
  created_at: string;
  updated_at: string;
}
