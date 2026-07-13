import { ArrowRight, Sparkles, Heart, Package, Star, ShoppingCart, MessageCircle, Shield } from 'lucide-react';
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { db } from '../lib/firebase';
import { ref, get, onValue } from 'firebase/database';
import type { Product, Category } from '../types';
import { brand } from '../config/brand';
import FeaturedCategories from '../components/FeaturedCategories';
import CustomerReviews from '../components/CustomerReviews';

import SmartFeatureFAB from '../components/SmartFeatureFAB';
import TryOnProductList from '../components/TryOnProductList';
import ColorMatchProductList from '../components/ColorMatchProductList';
import EnquiryModal from '../components/EnquiryModal';
import BottomSheet from '../components/BottomSheet';
import MightYouLike from '../components/MightYouLike';
import LazyImage from '../components/LazyImage';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCardDesign, getCardStyles } from '../hooks/useCardDesign';
import DynamicSection from '../components/DynamicSection';
import InfoSection from '../components/InfoSection';
import VideoSection from '../components/VideoSection';
import VideoOverlaySection from '../components/VideoOverlaySection';
import { objectToArray } from '../utils/publishedData';
import { usePublishedData } from '../contexts/PublishedDataContext';
import type { HomepageSection } from '../types';
import VirtualTryOn from '../components/VirtualTryOn';

interface InfoSectionData {
  id: string;
  title: string;
  content: string;
  theme: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'gradient';
  is_visible: boolean;
  order_index: number;
}

interface HomeProps {
  onNavigate: (page: 'shop', categoryId?: string) => void;
  onCartClick: () => void;
  onProductClick?: (product: Product) => void;
}

interface Policy {
  key: string;
  title: string;
  content: string;
  isEnabled: boolean;
}

export default function Home({ onNavigate, onCartClick, onProductClick }: HomeProps) {
  const { data: contextData } = usePublishedData();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newArrivalCategories, setNewArrivalCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [activePolicyKey, setActivePolicyKey] = useState<string | null>(null);
  const [carouselImages, setCarouselImages] = useState<string[]>([
    'https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/3755710/pexels-photo-3755710.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=1200'
  ]);
  const [carouselSettings, setCarouselSettings] = useState({
    is_visible: false,
    autoplay: true,
    interval: 5000,
    show_indicators: true,
    show_navigation: true
  });
  const [dynamicSections, setDynamicSections] = useState<HomepageSection[]>([]);
  const [infoSections, setInfoSections] = useState<InfoSectionData[]>([]);
  const [marqueeSections, setMarqueeSections] = useState<any[]>([]);
  const [videoSections, setVideoSections] = useState<any[]>([]);
  const [videoSectionSettings, setVideoSectionSettings] = useState({
    is_visible: false,
    section_title: 'Watch Our Videos',
    section_subtitle: 'Explore our collection'
  });
  const [videoOverlaySections, setVideoOverlaySections] = useState<any[]>([]);
  const [defaultSectionsVisibility, setDefaultSectionsVisibility] = useState({
    banner_social: false,
    feature_boxes: false,
    all_categories: false,
    best_sellers: false,
    might_you_like: false,
    shop_by_category: false,
    customer_reviews: false,
    marquee: false
  });
  const [allSectionsOrder, setAllSectionsOrder] = useState<Array<{ id: string; type: 'default' | 'custom' | 'info' | 'video' | 'video_section' | 'marquee' | 'video_overlay'; order_index: number }>>([]);
  const [showSmartFeatureFAB, setShowSmartFeatureFAB] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);
  const [showColorMatchList, setShowColorMatchList] = useState(false);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  const { addToCart, isInCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { design: allCategoriesDesign } = useCardDesign('all_categories');
  const allCategoriesCardStyles = getCardStyles(allCategoriesDesign);

  useEffect(() => {
    const handleOpenProductDetails = (event: CustomEvent) => {
      const product = event.detail;
      if (onProductClick) onProductClick(product);
    };

    window.addEventListener('openProductDetails', handleOpenProductDetails as EventListener);

    return () => {
      window.removeEventListener('openProductDetails', handleOpenProductDetails as EventListener);
    };
  }, [onProductClick]);

  useEffect(() => {
    function processData() {
      try {
        const publishedData = contextData;

        if (publishedData) {
          const allProducts: Product[] = objectToArray<Product>(publishedData.products);

          const featuredProducts = allProducts
            .filter(p => p.featured)
            .sort((a, b) => {
              const dateA = new Date(a.created_at || 0).getTime();
              const dateB = new Date(b.created_at || 0).getTime();
              return dateB - dateA;
            })
            .slice(0, 3);

          const categoriesData: Category[] = objectToArray<Category>(publishedData.categories);
          const newArrivals = categoriesData.filter(c => c.new_arrival);
          categoriesData.sort((a, b) => a.name.localeCompare(b.name));
          newArrivals.sort((a, b) => a.name.localeCompare(b.name));

          if (publishedData.carousel_images) {
            const images = Object.keys(publishedData.carousel_images)
              .map(key => ({ ...publishedData.carousel_images![key], id: key }))
              .filter(img => img.isVisible)
              .sort((a, b) => a.order - b.order)
              .map(img => img.url);
            if (images.length > 0) {
              setCarouselImages(images);
            }
          }

          if (publishedData.carousel_settings) {
            setCarouselSettings(publishedData.carousel_settings);
          }

          const sectionsData: HomepageSection[] = [];
          if (publishedData.homepage_sections) {
            Object.entries(publishedData.homepage_sections).forEach(([id, sectionData]: [string, any]) => {
              if (sectionData.is_visible) {
                sectionsData.push({ id, ...sectionData });
              }
            });
          }
          setDynamicSections(sectionsData);

          const infoSectionsData: InfoSectionData[] = [];
          if (publishedData.info_sections) {
            Object.entries(publishedData.info_sections).forEach(([id, sectionData]: [string, any]) => {
              if (sectionData.is_visible) {
                infoSectionsData.push({ id, ...sectionData });
              }
            });
          }
          setInfoSections(infoSectionsData);

          const marqueeSectionsData: any[] = [];
          if (publishedData.marquee_sections) {
            Object.entries(publishedData.marquee_sections).forEach(([id, sectionData]: [string, any]) => {
              if (sectionData.is_visible) {
                marqueeSectionsData.push({ id, ...sectionData });
              }
            });
          }
          setMarqueeSections(marqueeSectionsData);

          const videoSectionsData: any[] = [];
          if (publishedData.video_sections) {
            Object.entries(publishedData.video_sections).forEach(([id, videoData]: [string, any]) => {
              if (videoData.is_visible || videoData.isVisible) {
                videoSectionsData.push({ id, ...videoData });
              }
            });
            videoSectionsData.sort((a, b) => (a.order || 0) - (b.order || 0));
          }
          setVideoSections(videoSectionsData);
          console.log('[v0] Video sections loaded:', videoSectionsData.length);

          let videoSettings = {
            is_visible: false,
            section_title: 'Watch Our Videos',
            section_subtitle: 'Explore our collection',
            order_index: 7
          };
          if (publishedData.video_section_settings) {
            videoSettings = { ...videoSettings, ...publishedData.video_section_settings };
            setVideoSectionSettings(videoSettings);
            console.log('[v0] Video section settings:', videoSettings);
          }

  const videoOverlaySectionsData: any[] = [];
  if (publishedData.video_overlay_sections) {
    for (const [sectionId, sectionData] of Object.entries<any>(publishedData.video_overlay_sections)) {
      if (sectionData.is_visible && sectionData.videos) {
        const sectionVideos: any[] = [];
        if (publishedData.video_overlay_items) {
          sectionData.videos.forEach((videoId: string) => {
            if (publishedData.video_overlay_items![videoId] && publishedData.video_overlay_items![videoId].isVisible) {
              const videoData = {
                id: videoId,
                ...publishedData.video_overlay_items![videoId]
              };
              sectionVideos.push(videoData);
            }
          });
        }
        if (sectionVideos.length > 0) {
          videoOverlaySectionsData.push({
            id: sectionId,
            ...sectionData,
            videoItems: sectionVideos
          });
        }
      }
    }
    videoOverlaySectionsData.sort((a, b) => a.order_index - b.order_index);
  }
  setVideoOverlaySections(videoOverlaySectionsData);

          setFeaturedProducts(featuredProducts);
          setCategories(categoriesData);
          setNewArrivalCategories(newArrivals);
          
          if (publishedData.default_sections_visibility) {
            setDefaultSectionsVisibility(publishedData.default_sections_visibility);
          }

          // Build allSectionsOrder by merging default and custom sections
          const allSectionsOrderData: Array<{ id: string; type: 'default' | 'custom' | 'info' | 'video' | 'marquee'; order_index: number }> = [];
          
          // Add default sections with their visibility settings
          if (publishedData.default_sections_visibility) {
            const defaultVisibility = publishedData.default_sections_visibility;
            const defaultSectionKeys = ['banner_social', 'feature_boxes', 'all_categories', 'best_sellers', 'might_you_like', 'shop_by_category', 'customer_reviews', 'marquee'];
            
            defaultSectionKeys.forEach((key, index) => {
              const orderKey = `order_${key}`;
              const order_index = defaultVisibility[orderKey] !== undefined ? defaultVisibility[orderKey] : index;
              allSectionsOrderData.push({
                id: key,
                type: 'default',
                order_index
              });
            });
          }
          
          // Add custom sections
          if (publishedData.homepage_sections) {
            Object.entries(publishedData.homepage_sections).forEach(([id, sectionData]: [string, any]) => {
              if (sectionData.is_visible) {
                allSectionsOrderData.push({
                  id,
                  type: 'custom',
                  order_index: sectionData.order_index || 100
                });
              }
            });
          }
          
          // Add info sections
          if (publishedData.info_sections) {
            Object.entries(publishedData.info_sections).forEach(([id, sectionData]: [string, any]) => {
              if (sectionData.is_visible) {
                allSectionsOrderData.push({
                  id,
                  type: 'info',
                  order_index: sectionData.order_index || 100
                });
              }
            });
          }
          
          // Add individual video sections from published data
          if (publishedData.video_sections) {
            Object.entries(publishedData.video_sections).forEach(([id, sectionData]: [string, any]) => {
              if (sectionData.is_visible) {
                allSectionsOrderData.push({
                  id,
                  type: 'video_section',
                  order_index: sectionData.order_index || 7
                });
              }
            });
          }
          
          // Add marquee sections
          if (publishedData.marquee_sections) {
            Object.entries(publishedData.marquee_sections).forEach(([id, sectionData]: [string, any]) => {
              if (sectionData.is_visible) {
                allSectionsOrderData.push({
                  id,
                  type: 'marquee',
                  order_index: sectionData.order_index || 100
                });
              }
            });
          }
          
          // Add video overlay sections
          if (publishedData.video_overlay_sections) {
            Object.entries(publishedData.video_overlay_sections).forEach(([id, sectionData]: [string, any]) => {
              if (sectionData.is_visible) {
                allSectionsOrderData.push({
                  id,
                  type: 'video_overlay',
                  order_index: sectionData.order_index || 100
                });
              }
            });
          }
          
          // Use explicit order if available, otherwise use constructed order
          if (publishedData.all_sections_order) {
            const orderArray = Object.entries(publishedData.all_sections_order).map(([id, data]: [string, any]) => ({
              id,
              ...data
            }));
            orderArray.sort((a, b) => a.order_index - b.order_index);
            setAllSectionsOrder(orderArray);
          } else {
            // Sort by order_index and set
            allSectionsOrderData.sort((a, b) => a.order_index - b.order_index);
            setAllSectionsOrder(allSectionsOrderData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    processData();
  }, [contextData]);

  useEffect(() => {
    const visibilityRef = ref(db, 'default_sections_visibility/smart_feature_fab');
    const unsubscribe = onValue(visibilityRef, (snapshot) => {
      if (snapshot.exists()) {
        setShowSmartFeatureFAB(snapshot.val());
      } else {
        setShowSmartFeatureFAB(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const policiesRef = ref(db, 'policies');
        const snapshot = await get(policiesRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const policiesList = Object.entries(data).map(([key, value]: [string, any]) => ({
            key,
            ...value
          }));
          setPolicies(policiesList);
        }
      } catch (error) {
        console.error('Error fetching policies:', error);
      }
    };
    fetchPolicies();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  useEffect(() => {
    if (carouselSettings.autoplay && carouselImages.length > 0) {
      autoSlideRef.current = setInterval(nextSlide, carouselSettings.interval);
    }
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [carouselSettings.autoplay, carouselSettings.interval, carouselImages.length]);

  const activePolicy = policies.find(p => p.key === activePolicyKey);

  const renderPolicyContent = (content: string) => {
    return (
      <div className="prose prose-sm max-w-none">
        {content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4 text-gray-600 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    );
  };

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white animate-home-reveal overflow-x-hidden">
      {carouselSettings.is_visible && carouselImages.length > 0 && (
        <section className="relative w-full overflow-hidden group bg-gray-100">
          {/* Responsive banner height: compact across all devices */}
          <div className="relative h-52 sm:h-64 md:h-72 lg:h-80 xl:h-96 w-full">
            {carouselImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                  index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'
                }`}
              >
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}

            {carouselSettings.show_navigation && carouselImages.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white/50 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transform -translate-x-4 sm:group-hover:translate-x-0"
                  aria-label="Previous slide"
                >
                  <ArrowRight className="w-4 sm:w-6 h-4 sm:h-6 rotate-180" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white/50 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transform translate-x-4 sm:group-hover:translate-x-0"
                  aria-label="Next slide"
                >
                  <ArrowRight className="w-4 sm:w-6 h-4 sm:h-6" />
                </button>
              </>
            )}

            {carouselSettings.show_indicators && carouselImages.length > 1 && (
              <div className="absolute bottom-3 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2 sm:gap-3">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1 sm:h-1.5 transition-all duration-300 rounded-full ${
                      index === currentSlide ? 'w-6 sm:w-8 bg-white' : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {allSectionsOrder.map((section) => (
        <section key={section.id} className="w-full">
          {section.id === 'all_categories' && (defaultSectionsVisibility.all_categories !== false) && categories.length > 0 && (
            <section className="py-4 sm:py-5 px-4 sm:px-6 lg:px-8 bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-4 sm:mb-5">
                  <span className="text-xs sm:text-sm font-semibold text-brand tracking-[0.2em] uppercase">Explore Our Collections</span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl text-gray-900 mt-2 mb-2 text-shimmer" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>
                    Shop by Category
                  </h2>
                </div>

                <div className="columns-2 md:columns-3 lg:columns-4 gap-2.5 sm:gap-3">
                  {categories.map((category, index) => (
                    <button
                      key={category.id}
                      onClick={() => onNavigate('shop', category.id)}
                      className={`chip-animate group relative bg-white overflow-hidden border-2 border-gray-100 mb-2.5 sm:mb-3 break-inside-avoid w-full ${allCategoriesCardStyles.container || 'rounded-xl'}`}
                      style={{
                        ...allCategoriesCardStyles.style,
                        backgroundColor: category.bg_color || '#ffffff',
                        animationDelay: `${index * 80}ms`
                      }}
                    >
                      <div
                        className="overflow-hidden bg-gray-50"
                        style={{
                          ...allCategoriesCardStyles.imageStyle,
                          aspectRatio: index % 3 === 0 ? '4/5' : index % 3 === 1 ? '1/1' : '4/5'
                        }}
                      >
                        <LazyImage
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2.5">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 flex items-center justify-between">
                          {category.name}
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </h3>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {section.id === 'best_sellers' && (defaultSectionsVisibility.best_sellers !== false) && (
            <section className="relative py-4 sm:py-5 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl text-gray-900 mb-2 text-shimmer" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>
                  Best Sellers
                </h2>
                <p className="text-sm text-gray-600 mb-4">Our most popular products loved by customers</p>
                <p className="text-sm text-gray-500 italic">Coming soon - Configure products with "best_seller" flag in admin</p>
              </div>
            </section>
          )}

          {section.id === 'might_you_like' && (defaultSectionsVisibility.might_you_like !== false) && (
            <MightYouLike
              onProductClick={(product) => {
                if (onProductClick) onProductClick(product);
              }}
              onCartClick={onCartClick}
            />
          )}

          {section.id === 'shop_by_category' && (defaultSectionsVisibility.shop_by_category !== false) && (
            <section className="relative py-4 sm:py-5 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-4 sm:mb-5">
                  <span className="text-xs sm:text-sm font-semibold text-brand tracking-[0.2em] uppercase">Featured</span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl text-gray-900 mt-2 mb-2 px-4 text-shimmer" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>
                    Shop by Category
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 font-medium max-w-2xl mx-auto px-4 mb-4" style={{ letterSpacing: '0.01em' }}>
                    Discover our curated collections
                  </p>
                </div>
              </div>

              <div className="w-full">
                <FeaturedCategories
                  onNavigate={onNavigate}
                  onAddToCart={addToCart}
                  onCartClick={onCartClick}
                  onProductClick={(product) => {
                    if (onProductClick) onProductClick(product);
                  }}
                />
              </div>
            </section>
          )}

          {section.id === 'customer_reviews' && (defaultSectionsVisibility.customer_reviews !== false) && <CustomerReviews />}

          {section.type === 'custom' && dynamicSections.find(s => s.id === section.id) && (
            <div className="bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <DynamicSection
                  section={dynamicSections.find(s => s.id === section.id)!}
                  onProductClick={(product) => {
                    if (onProductClick) onProductClick(product);
                  }}
                  onCategoryClick={(categoryId) => onNavigate('shop', categoryId)}
                />
              </div>
            </div>
          )}

          {section.type === 'info' && infoSections.find(s => s.id === section.id) && (
            <section className="py-3 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <InfoSection
                  title={infoSections.find(s => s.id === section.id)!.title}
                  content={infoSections.find(s => s.id === section.id)!.content}
                  theme={infoSections.find(s => s.id === section.id)!.theme}
                />
              </div>
            </section>
          )}

          {section.type === 'video' && videoSections.length > 0 && videoSectionSettings.is_visible && (
            <VideoSection
              videos={videoSections}
              title={videoSectionSettings.section_title}
              subtitle={videoSectionSettings.section_subtitle}
            />
          )}

          {section.type === 'video_section' && videoSections.length > 0 && (
            <VideoSection
              videos={videoSections}
              title={videoSectionSettings.section_title}
              subtitle={videoSectionSettings.section_subtitle}
            />
          )}

          {section.type === 'marquee' && marqueeSections.find(s => s.id === section.id) && (
            <div
              className="w-full overflow-hidden py-3"
              style={{ backgroundColor: marqueeSections.find(s => s.id === section.id)!.bg_color }}
            >
              <div className={`whitespace-nowrap ${marqueeSections.find(s => s.id === section.id)!.speed === 'slow' ? 'animate-marquee-slow' : marqueeSections.find(s => s.id === section.id)!.speed === 'fast' ? 'animate-marquee-fast' : 'animate-marquee'}`} style={{ color: marqueeSections.find(s => s.id === section.id)!.text_color }}>
                <span className="inline-block px-4 text-lg font-semibold">{marqueeSections.find(s => s.id === section.id)!.text}</span>
                <span className="inline-block px-4 text-lg font-semibold">{marqueeSections.find(s => s.id === section.id)!.text}</span>
                <span className="inline-block px-4 text-lg font-semibold">{marqueeSections.find(s => s.id === section.id)!.text}</span>
                <span className="inline-block px-4 text-lg font-semibold">{marqueeSections.find(s => s.id === section.id)!.text}</span>
              </div>
            </div>
          )}

          {section.type === 'video_overlay' && videoOverlaySections.find(s => s.id === section.id) && (
            <VideoOverlaySection videos={videoOverlaySections.find(s => s.id === section.id)?.videoItems || []} />
          )}
        </section>
      ))}

      <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-5 sm:mb-6">
            <span className="text-xs sm:text-sm font-semibold text-gray-600 tracking-[0.2em] uppercase">{brand.promise.sectionTitle}</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl text-gray-900 mt-2 text-shimmer" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, letterSpacing: '-0.03em' }}>
              {brand.promise.heading}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-gray-200 relative overflow-hidden shadow-sm">
              <div className={`absolute top-0 right-0 w-24 h-24 ${brand.promise.cards[0].blobColor} rounded-full -translate-x-4 -translate-y-4 opacity-50`} />
              <div className="relative">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${brand.promise.cards[0].bgColor} flex items-center justify-center mb-3 ${brand.promise.cards[0].borderColor} border`}>
                  <Shield className={`w-6 h-6 sm:w-7 sm:h-7 ${brand.promise.cards[0].iconColor}`} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">
                  {brand.promise.cards[0].title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {brand.promise.cards[0].description}
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-gray-200 relative overflow-hidden shadow-sm">
              <div className={`absolute top-0 right-0 w-24 h-24 ${brand.promise.cards[1].blobColor} rounded-full -translate-x-4 -translate-y-4 opacity-50`} />
              <div className="relative">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${brand.promise.cards[1].bgColor} flex items-center justify-center mb-3 ${brand.promise.cards[1].borderColor} border`}>
                  <Sparkles className={`w-6 h-6 sm:w-7 sm:h-7 ${brand.promise.cards[1].iconColor}`} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">
                  {brand.promise.cards[1].title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {brand.promise.cards[1].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showSmartFeatureFAB && (
        <SmartFeatureFAB
          onTryOnClick={() => setShowTryOn(true)}
          onColorMatchClick={() => setShowColorMatchList(true)}
        />
      )}

      <VirtualTryOn
        isOpen={showTryOn}
        onClose={() => setShowTryOn(false)}
      />

      <ColorMatchProductList
        isOpen={showColorMatchList}
        onClose={() => setShowColorMatchList(false)}
      />

      <EnquiryModal isOpen={showEnquiryModal} onClose={() => setShowEnquiryModal(false)} />

      {activePolicy && (
        <BottomSheet
          isOpen={!!activePolicy}
          onClose={() => setActivePolicyKey(null)}
          title={activePolicy.title}
        >
          {renderPolicyContent(activePolicy.content)}
        </BottomSheet>
      )}

      <BottomSheet isOpen={activePolicyKey === 'about'} onClose={() => setActivePolicyKey(null)} title="About Us">
        <div className="space-y-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {brand.aboutUs}
          </p>
        </div>
      </BottomSheet>
    </div>
  );
}
