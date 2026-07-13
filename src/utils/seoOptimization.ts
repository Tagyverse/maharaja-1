/**
 * SEO Optimization Utilities
 * Includes schema generation, meta tags, and AI-powered site descriptions
 */

import { brand } from '../config/brand';

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  url: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
}

// Generate page meta tags
export const generateMetaTags = (seoData: SEOData) => {
  const meta = {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords.join(', '),
    canonical: seoData.url,
    ogTitle: seoData.title,
    ogDescription: seoData.description,
    ogImage: seoData.image || 'https://res.cloudinary.com/dn5ya8xu5/image/upload/v1765988589/logo_lkxcbk.png',
    ogUrl: seoData.url,
    ogType: seoData.type || 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: seoData.title,
    twitterDescription: seoData.description,
    twitterImage: seoData.image || 'https://res.cloudinary.com/dn5ya8xu5/image/upload/v1765988589/logo_lkxcbk.png'
  };

  return meta;
};

// Generate Product Schema for SEO
export const generateProductSchema = (product: any) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  'name': product.name,
  'description': product.description,
  'image': product.image,
  'brand': {
    '@type': 'Brand',
    'name': brand.name
  },
  'offers': {
    '@type': 'Offer',
    'url': `https://www.${brand.domain}/shop?product=${product.id}`,
    'priceCurrency': 'INR',
    'price': product.price,
    'availability': 'https://schema.org/InStock'
  },
  'aggregateRating': product.rating ? {
    '@type': 'AggregateRating',
    'ratingValue': product.rating,
    'reviewCount': product.reviewCount || 0
  } : undefined
});

// Generate Organization Schema
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': brand.name,
  'url': `https://www.${brand.domain}`,
  'logo': brand.logo || '/favicon.png',
  'description': brand.description,
  'email': brand.email,
  'sameAs': [],
  'address': {
    '@type': 'PostalAddress',
    'addressCountry': 'IN'
  }
});

// Generate Local Business Schema
export const generateLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  'name': brand.name,
  'image': brand.logo || '/favicon.png',
  'description': brand.description,
  'url': `https://www.${brand.domain}`,
  'telephone': brand.phone,
  'email': brand.email,
  'address': {
    '@type': 'PostalAddress',
    'addressCountry': 'IN'
  },
  'priceRange': '$$'
});

// Generate FAQ Schema
export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': faqs.map(faq => ({
    '@type': 'Question',
    'name': faq.question,
    'acceptedAnswer': {
      '@type': 'Answer',
      'text': faq.answer
    }
  }))
});

// AI-Powered Site Description Generator
export const generateAISiteDescription = () => {
  const descriptions = [
    `Discover premium quality crackers at ${brand.name}. Shop a wide variety of crackers for Diwali and all festivals at best prices.`,
    `${brand.name} offers the finest crackers from Sivakasi. Safe, certified, and affordable crackers for every celebration.`,
    `Browse our exclusive collection of premium crackers including sparklers, rockets, flower pots, and ground chakras at ${brand.name}.`,
    `Shop festival crackers at ${brand.name}. Find the perfect assortment for Diwali, New Year, and all celebrations.`,
    `${brand.name} specializes in premium quality crackers. Our collection includes family packs, gift boxes, and individual items for all budgets.`
  ];

  const index = Math.floor(Math.random() * descriptions.length);
  return descriptions[index];
};

// Generate AI Keywords for better SEO
export const generateAIKeywords = () => [
  'crackers online',
  'diwali crackers',
  'sivakasi crackers',
  'buy crackers online',
  'festival crackers',
  'sparklers',
  'flower pots',
  'rockets',
  'ground chakras',
  'crackers shop',
  'premium crackers',
  'safe crackers',
  'wholesale crackers',
  brand.name.toLowerCase(),
  'crackers delivery',
  'bulk crackers order',
  'family pack crackers',
  'gift box crackers',
  'new year crackers',
  'celebration crackers'
];

// Update page title dynamically
export const updatePageTitle = (title: string) => {
  document.title = `${title} | ${brand.name} - ${brand.tagline}`;
  
  // Update OG tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', document.title);
};

// Update meta description
export const updateMetaDescription = (description: string) => {
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', description);
  }
};

// Add breadcrumb schema
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': items.map((item, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': item.name,
    'item': item.url
  }))
});

// Get SEO-friendly URL slug
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Generate canonical URL
export const getCanonicalUrl = (path: string = '') => {
  const baseUrl = `https://www.${brand.domain}`;
  return `${baseUrl}${path}`;
};

// Inject schema script into page
export const injectSchema = (schema: any) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};

// Generate rich snippets for products
export const generateRichSnippet = (product: any) => {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': product.name,
    'image': product.image,
    'description': product.description,
    'brand': {
      '@type': 'Brand',
      'name': brand.name
    },
    'offers': {
      '@type': 'Offer',
      'url': `https://www.${brand.domain}/shop?product=${product.id}`,
      'priceCurrency': 'INR',
      'price': product.price.toString(),
      'availability': 'https://schema.org/InStock'
    }
  };
  
  injectSchema(schema);
  return schema;
};

export default {
  generateMetaTags,
  generateProductSchema,
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateFAQSchema,
  generateAISiteDescription,
  generateAIKeywords,
  updatePageTitle,
  updateMetaDescription,
  generateBreadcrumbSchema,
  slugify,
  getCanonicalUrl,
  injectSchema,
  generateRichSnippet
};
