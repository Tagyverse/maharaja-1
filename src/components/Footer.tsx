import { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, Youtube, Heart, MessageSquare, ArrowUpRight, ExternalLink } from 'lucide-react';
import { usePublishedData } from '../contexts/PublishedDataContext';
import { brand } from '../config/brand';
import FeedbackModal from './FeedbackModal';

interface FooterConfig {
  is_visible: boolean;
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  linkColor: string;
  linkHoverColor: string;
  accentColor: string;
  companyName: string;
  description: string;
  aboutUs?: string;
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
  quickLinks: Array<{ label: string; url: string }>;
  copyrightText: string;
  showQuickLinks: boolean;
  showSocial: boolean;
  showContact: boolean;
  showAboutUs?: boolean;
}

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const { data: publishedData } = usePublishedData();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const config = publishedData?.footer_config as FooterConfig | null;

  if (!config || !config.is_visible) {
    return null;
  }

  const handleLinkClick = (url: string) => {
    if (url.startsWith('/')) {
      const page = url.substring(1);
      if (onNavigate) {
        onNavigate(page);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const socialIcons = config.social ? [
    { name: 'facebook', icon: Facebook, url: config.social.facebook },
    { name: 'instagram', icon: Instagram, url: config.social.instagram },
    { name: 'twitter', icon: Twitter, url: config.social.twitter },
    { name: 'linkedin', icon: Linkedin, url: config.social.linkedin },
    { name: 'youtube', icon: Youtube, url: config.social.youtube },
  ].filter((social) => social.url) : [];

  return (
    <footer className="relative bg-gradient-to-b from-white to-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Main content */}
        <div className="py-10 sm:py-12 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="md:col-span-5 lg:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={brand.logo || '/favicon.png'}
                alt={config.companyName}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-xl"
              />
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">
                {config.companyName}
              </h3>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-gray-600 max-w-sm mb-5">{config.description}</p>

            {config.showAboutUs && config.aboutUs && (
              <p className="text-xs sm:text-sm leading-relaxed text-gray-500 max-w-sm mb-5 border-l-2 border-gray-300 pl-3">
                {config.aboutUs}
              </p>
            )}

            {/* Social row */}
            {config.showSocial && socialIcons.length > 0 && (
              <div className="flex gap-2">
                {socialIcons.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => setHoveredLink(social.name)}
                      onMouseLeave={() => setHoveredLink(null)}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 border border-gray-200 hover:border-gray-400 hover:bg-gray-900 hover:text-white text-gray-600"
                    >
                      <Icon size={15} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Links column */}
          {config.showQuickLinks && Array.isArray(config.quickLinks) && config.quickLinks.length > 0 && (
            <div className="md:col-span-3">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-[0.12em] mb-4 text-gray-900">
                Navigation
              </h4>
              <ul className="space-y-1">
                {config.quickLinks.map((link, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleLinkClick(link.url)}
                      onMouseEnter={() => setHoveredLink(`link-${index}`)}
                      onMouseLeave={() => setHoveredLink(null)}
                      className={`group flex items-center gap-2 py-1.5 text-sm sm:text-base font-medium transition-all duration-150 ${
                        hoveredLink === `link-${index}` ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      <span className={`w-1 h-1 rounded-full transition-all duration-200 ${
                        hoveredLink === `link-${index}` ? 'bg-gray-900' : 'bg-transparent'
                      }`} />
                      {link.label}
                      {!link.url.startsWith('/') && <ExternalLink size={11} className="opacity-40" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact column */}
          {config.showContact && (
            <div className="md:col-span-4 lg:col-span-3">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-[0.12em] mb-4 text-gray-900">
                Contact
              </h4>
              <div className="space-y-3">
                {config.email && (
                  <a
                    href={`mailto:${config.email}`}
                    onMouseEnter={() => setHoveredLink('email')}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`flex items-center gap-3 transition-colors ${
                      hoveredLink === 'email' ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 border border-gray-200">
                      <Mail size={14} className="text-gray-700" />
                    </div>
                    <span className="text-sm sm:text-base">{config.email}</span>
                  </a>
                )}
                {config.phone && (
                  <a
                    href={`tel:${config.phone}`}
                    onMouseEnter={() => setHoveredLink('phone')}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`flex items-center gap-3 transition-colors ${
                      hoveredLink === 'phone' ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 border border-gray-200">
                      <Phone size={14} className="text-gray-700" />
                    </div>
                    <span className="text-sm sm:text-base">{config.phone}</span>
                  </a>
                )}
                {config.address && (
                  <div className="flex items-start gap-3 text-gray-500">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-gray-100 border border-gray-200">
                      <MapPin size={14} className="text-gray-700" />
                    </div>
                    <span className="text-sm sm:text-base leading-relaxed">{config.address}</span>
                  </div>
                )}
              </div>

              {/* Feedback */}
              <button
                onClick={() => setShowFeedback(true)}
                onMouseEnter={() => setHoveredLink('feedback')}
                onMouseLeave={() => setHoveredLink(null)}
                className={`group mt-5 flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full transition-all duration-200 border ${
                  hoveredLink === 'feedback'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <MessageSquare size={12} />
                Feedback
                <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 py-5 sm:py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs sm:text-sm text-gray-500 font-medium">{config.copyrightText}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm text-gray-400">Crafted with</span>
            <Heart size={11} className="text-red-400" fill="currentColor" />
            <span className="text-xs sm:text-sm text-gray-400">by</span>
            <a href="https://tagyverse.com" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              Tagyverse
            </a>
          </div>
        </div>
      </div>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </footer>
  );
}
