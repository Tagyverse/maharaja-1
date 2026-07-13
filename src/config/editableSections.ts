import { EditableSection } from '../types/rebrandData';

export const defaultEditableSections: EditableSection[] = [
  {
    id: 'terms-conditions',
    title: 'Terms & Conditions',
    content: 'By using this website and placing an order, you agree to our terms and conditions.',
    order: 1,
    visible: true,
    category: 'policy',
  },
  {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    content: 'We are committed to protecting your personal information and your right to privacy.',
    order: 2,
    visible: true,
    category: 'policy',
  },
  {
    id: 'shipping-policy',
    title: 'Shipping Policy',
    content: 'We offer fast and reliable shipping to all locations.',
    order: 3,
    visible: true,
    category: 'policy',
  },
  {
    id: 'refund-policy',
    title: 'Refund Policy',
    content: 'We stand behind our products and offer a satisfaction guarantee.',
    order: 4,
    visible: true,
    category: 'policy',
  },
  {
    id: 'about-us',
    title: 'About Us',
    content: 'Welcome to our store. We are dedicated to providing the best products and services.',
    order: 5,
    visible: true,
    category: 'page',
  },
  {
    id: 'contact-info',
    title: 'Contact Information',
    content: 'Get in touch with us through our contact form or reach out directly via email or phone.',
    order: 6,
    visible: true,
    category: 'info',
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    content: 'Find answers to common questions about our products and services.',
    order: 7,
    visible: true,
    category: 'page',
  },
  {
    id: 'return-policy',
    title: 'Return Policy',
    content: 'We want you to be completely satisfied with your purchase.',
    order: 8,
    visible: true,
    category: 'policy',
  },
];

export const getSectionsByCategory = (category: string): EditableSection[] => {
  return defaultEditableSections.filter(section => section.category === category);
};

export const getSectionById = (id: string): EditableSection | undefined => {
  return defaultEditableSections.find(section => section.id === id);
};

export const getAllPolicies = (): EditableSection[] => {
  return getSectionsByCategory('policy');
};

export const getAllPages = (): EditableSection[] => {
  return getSectionsByCategory('page');
};
