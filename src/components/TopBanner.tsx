import { useState, useCallback } from 'react';
import { Globe, Phone, Instagram, MessageCircle, Facebook, Twitter, Linkedin, Youtube, Mail, AtSign, Link as LinkIcon } from 'lucide-react';
import { usePublishedData } from '../contexts/PublishedDataContext';
import WhatsAppChatModal from './WhatsAppChatModal';
import { brand } from '../config/brand';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  order: number;
}

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  email: Mail,
  whatsapp: MessageCircle,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: AtSign,
  threads: AtSign,
  phone: Phone,
  website: Globe,
  custom: LinkIcon,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  email: '#6B5E3F',
  whatsapp: '#25D366',
  linkedin: '#0A66C2',
  youtube: '#FF0000',
  tiktok: '#000000',
  threads: '#000000',
  phone: '#6B5E3F',
  website: '#6B5E3F',
  custom: '#6B5E3F',
};

export default function TopBanner() {
  const { data: publishedData } = usePublishedData();
  const [showChat, setShowChat] = useState(false);

  const handleChatIconTap = useCallback(() => {
    setShowChat(true);
  }, []);

  const defaultContent = {
    text: brand.marquee.text,
    isVisible: true,
    backgroundColor: brand.marquee.backgroundColor,
    textColor: brand.marquee.textColor
  };

  let bannerContent = defaultContent;

  if (publishedData?.site_content?.top_banner?.value) {
    bannerContent = publishedData.site_content.top_banner.value;
  }

  if (publishedData?.default_sections_visibility?.marquee !== undefined) {
    bannerContent = { ...bannerContent, isVisible: publishedData.default_sections_visibility.marquee && bannerContent.isVisible };
  }

  // Get social links from published data
  let socialLinks: SocialLink[] = [];
  if (publishedData?.social_links) {
    socialLinks = Object.entries(publishedData.social_links)
      .map(([id, link]: [string, any]) => ({
        id,
        platform: link.platform || 'custom',
        url: link.url || '#',
        icon: link.icon || link.platform || 'custom',
        order: link.order || 0,
      }))
      .sort((a, b) => a.order - b.order);
  }

  // Check if social icons should be visible
  const socialLinksVisible = publishedData?.site_content?.social_links_visible?.value !== false;

  if (!bannerContent.isVisible) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Marquee Bar */}
      <div
        className="py-2 overflow-hidden relative"
        style={{
          backgroundColor: bannerContent.backgroundColor || '#2D4A3A',
          color: bannerContent.textColor || '#ffffff'
        }}
      >
        <div className="animate-marquee whitespace-nowrap inline-block">
          <span className="text-xs font-semibold tracking-wider uppercase mx-6" style={{ color: 'inherit' }}>
            {bannerContent.text}
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase mx-6" style={{ color: 'inherit' }}>
            {bannerContent.text}
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase mx-6" style={{ color: 'inherit' }}>
            {bannerContent.text}
          </span>
        </div>
      </div>

      {/* Social Icons Row - Hanging from marquee bar */}
      {socialLinksVisible && socialLinks.length > 0 && (
        <div
          className="flex flex-col items-center -mt-px pb-0"
          style={{ backgroundColor: '#FFFFFF' }}
        >
          <div className="flex items-center justify-center gap-4 sm:gap-5">
            {socialLinks.map((social, idx) => {
              const IconComponent = PLATFORM_ICONS[social.platform] || LinkIcon;
              const iconColor = PLATFORM_COLORS[social.platform] || '#6B5E3F';
              const isLong = idx % 2 === 1;
              return (
                <div
                  key={social.id}
                  className="flex flex-col items-center social-icon-pendulum"
                  style={{
                    transformOrigin: 'top center',
                    animationDelay: `${idx * 0.3}s`,
                  }}
                >
                  {/* Thread line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-[2.5px] ${isLong ? 'h-8 sm:h-10' : 'h-5 sm:h-6'} rounded-full`}
                      style={{
                        background: 'linear-gradient(to bottom, #7BAF7B, #a3c9a3)',
                      }}
                    />
                    <div className="w-[6px] h-[6px] rounded-full bg-[#7BAF7B] -mt-[1px]" />
                  </div>
                  {/* Icon circle */}
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.platform}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 hover:shadow-md"
                    style={{
                      borderColor: '#7BAF7B',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    {social.platform === 'threads' ? (
                      <ThreadsIcon color={iconColor} />
                    ) : (
                      <IconComponent
                        className="w-4 h-4 sm:w-4.5 sm:h-4.5"
                        style={{ color: iconColor }}
                      />
                    )}
                  </a>
                </div>
              );
            })}
          </div>
          {/* Header logo + chat icon */}
          <div className="relative flex items-center justify-center mt-1 -mb-8 sm:-mb-10">
            <video
              src="/logoanim.webm"
              autoPlay
              muted
              loop
              playsInline
              className="relative z-10 w-40 sm:w-52 md:w-60 object-contain pointer-events-none"
            />
            <div className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20">
              <button
                onClick={handleChatIconTap}
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all active:scale-90 hover:bg-gray-100"
                aria-label="Chat with us"
              >
                <MessageCircle className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#2D4A3A]" />
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 rounded-full border-[1.5px] border-white flex items-center justify-center text-[9px] font-bold text-white leading-none px-0.5">
                  1
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      {showChat && (
        <WhatsAppChatModal onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}

function ThreadsIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="none" stroke="none" />
      <path d="M16.5 8.5c-1.2-1.2-3-1.8-4.5-1.5-2.5.5-4 2.5-4 5s1.5 4.5 4 5c1.5.3 3-.3 4.2-1.5" />
      <path d="M12 7v0c2.5 0 4.5 2 4.5 4.5v1c0 1.1-.9 2-2 2s-2-.9-2-2v-1c0-1.4-1.1-2.5-2.5-2.5S7.5 10.1 7.5 11.5v1c0 3 2.5 5.5 5.5 5.5" />
    </svg>
  );
}
