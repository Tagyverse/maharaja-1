import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Heart, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Product, Category, HomepageSection } from '../types';
import { usePublishedData } from '../contexts/PublishedDataContext';
import LazyImage from './LazyImage';
import Confetti from './Confetti';
import { playAddToCartSound } from '../utils/sounds';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCardDesign, getCardStyles } from '../hooks/useCardDesign';
import { objectToArray } from '../utils/publishedData';

interface DynamicSectionProps {
  section: HomepageSection;
  onProductClick?: (product: Product) => void;
  onCategoryClick?: (categoryId: string) => void;
}

export default function DynamicSection({ section, onProductClick, onCategoryClick }: DynamicSectionProps) {
  const { data: publishedData } = usePublishedData();
  const [items, setItems] = useState<(Product | Category)[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiOrigin, setConfettiOrigin] = useState({ x: 50, y: 50 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const { addToCart, isInCart, getItemQuantity, getCartItemId, updateQuantity } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const { design } = useCardDesign(`custom_${section.id}`);
  const cardStyles = getCardStyles(design);

  useEffect(() => {
    fetchItems();
  }, [section, publishedData]);

  const fetchItems = async () => {
    if (!publishedData) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const itemsData: (Product | Category)[] = [];

      const selectedItems = section.selected_items || [];
      const dataSource = section.content_type === 'product' ? publishedData.products : publishedData.categories;

      if (dataSource) {
        for (const itemId of selectedItems) {
          if (dataSource[itemId]) {
            itemsData.push({ id: itemId, ...dataSource[itemId] });
          }
        }
      }

      setItems(itemsData);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (section.display_type === 'carousel' || isAllCategories) {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (section.display_type === 'carousel' || isAllCategories) {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleItemClick = (item: Product | Category) => {
    if (section.content_type === 'category' && onCategoryClick) {
      onCategoryClick(item.id);
    } else if (section.content_type === 'product' && onProductClick) {
      onProductClick(item as Product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    setConfettiOrigin({ x, y });
    setConfettiActive(true);
    playAddToCartSound();
    const activeSize = selectedSizes[product.id] || (product.sizes && product.sizes[0]) || '';
    if (activeSize && product.size_pricing?.[activeSize]) {
      addToCart({ ...product, price: product.size_pricing[activeSize].price, default_size: activeSize });
    } else {
      addToCart(product);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    toggleFavorite(productId);
  };

  const isAllCategories = section.title?.toLowerCase().includes('all categories') ||
    (section.content_type === 'category' && section.title?.toLowerCase().includes('categor'));

  // Swipe handlers for stacked cards
  const touchStartY = useRef<number | null>(null);
  const isHorizontalScroll = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientX);
    touchStartY.current = e.touches[0].clientY;
    isHorizontalScroll.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStart === null) return;
    const dx = e.touches[0].clientX - dragStart;
    const dy = e.touches[0].clientY - (touchStartY.current ?? 0);
    // If vertical movement is dominant, ignore horizontal drag
    if (!isHorizontalScroll.current && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
      setDragStart(null);
      setDragDelta(0);
      return;
    }
    if (Math.abs(dx) > 10) isHorizontalScroll.current = true;
    setDragDelta(dx);
  }, [dragStart]);

  const handleTouchEnd = useCallback(() => {
    if (dragStart === null) return;
    if (dragDelta > 60) {
      setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (dragDelta < -60) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
    setDragStart(null);
    setDragDelta(0);
  }, [dragStart, dragDelta, items.length]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragStart(e.clientX);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragStart === null) return;
    setDragDelta(e.clientX - dragStart);
  }, [dragStart]);

  const handleMouseUp = useCallback(() => {
    if (dragStart === null) return;
    if (dragDelta > 60) {
      setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (dragDelta < -60) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
    setDragStart(null);
    setDragDelta(0);
  }, [dragStart, dragDelta, items.length]);

  const handleCarouselTouchEnd = useCallback(() => {
    if (dragStart === null) return;
    if (dragDelta < -60) {
      setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (dragDelta > 60) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
    setDragStart(null);
    setDragDelta(0);
  }, [dragStart, dragDelta, items.length]);

  const handleCarouselMouseUp = useCallback(() => {
    if (dragStart === null) return;
    if (dragDelta < -60) {
      setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (dragDelta > 60) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
    setDragStart(null);
    setDragDelta(0);
  }, [dragStart, dragDelta, items.length]);

  // Get products for a category
  const getCategoryProducts = (categoryId: string): Product[] => {
    if (!publishedData?.products) return [];
    const allProducts = objectToArray<Product>(publishedData.products);
    return allProducts.filter(p => {
      if (p.category_ids && p.category_ids.length > 0) return p.category_ids.includes(categoryId);
      return p.category_id === categoryId;
    });
  };

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="h-3 w-20 rounded-full bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 animate-shimmer bg-[length:200%_100%]" />
            <div className="h-7 w-44 rounded-lg bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 animate-shimmer bg-[length:200%_100%]" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-emerald-50">
                <div className="aspect-square bg-brand-soft animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${i * 0.12}s` }} />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${i * 0.12 + 0.05}s` }} />
                  <div className="h-3 w-1/2 rounded bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${i * 0.12 + 0.1}s` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  // Render a compact product thumbnail for the category card stack
  const renderMiniProductCard = (product: Product) => {
    return (
      <div
        key={product.id}
        onClick={(e) => { e.stopPropagation(); onProductClick?.(product); }}
        className="cursor-pointer"
      >
        <div className="aspect-square rounded-lg overflow-hidden shadow-md">
          <LazyImage
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="mt-1 px-0.5">
          <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow-md">
            {'\u20B9'}{product.price}
          </span>
        </div>
      </div>
    );
  };

  // Render stacked category cards (swipe-right layout) with products inside below title
  const renderCategoryCardStack = () => {
    return (
      <div className="relative px-6 sm:px-8">
        {/* Card stack container */}
        <div
          className="relative h-[400px] sm:h-[440px] select-none w-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {items.map((item, index) => {
            const offset = index - currentIndex;
            if (offset > 2 || offset < -1) return null;

            const category = item as Category;
            const isActive = offset === 0;
            const isGone = offset < 0;
            const categoryProducts = getCategoryProducts(category.id);

            // 2 cards peek behind on the left, active card on top
            const translateX = isGone
              ? 300 + dragDelta * 0.3
              : isActive
              ? dragDelta
              : -(offset * 24);
            const translateY = isActive ? 0 : offset * 6;
            const scale = isActive ? 1 : 1 - offset * 0.06;
            const rotate = isActive ? dragDelta * 0.01 : -(offset * 3);
            const opacity = isGone ? 0 : isActive ? 1 : Math.max(0, 1 - offset * 0.2);

            return (
              <div
                key={item.id}
                className="absolute inset-0 transition-all duration-300 ease-out"
                style={{
                  transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                  opacity,
                  zIndex: items.length - index,
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                <div
                  className="h-full rounded-2xl overflow-hidden relative"
                  onClick={() => onCategoryClick?.(category.id)}
                >
                  <div className="absolute inset-0">
                    <LazyImage
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/5" />
                  </div>

                  {/* Category title */}
                  <div className="absolute top-4 left-4 right-4 z-10">
                    <h3 className="text-white text-xl sm:text-2xl font-bold drop-shadow-lg">{category.name}</h3>
                  </div>

                  {/* Horizontal product scroll inside card */}
                  {categoryProducts.length > 0 && (
                    <div className="absolute bottom-3 left-0 right-0 z-10" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/60 to-transparent z-[5] pointer-events-none" />
                        <div
                          className="flex gap-2 overflow-x-auto pb-1 pl-4 pr-3 justify-start"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                          onTouchStart={(e) => e.stopPropagation()}
                          onTouchMove={(e) => e.stopPropagation()}
                          onTouchEnd={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          {categoryProducts.map((product) => (
                            <div key={product.id} className="flex-shrink-0 w-20 sm:w-24">
                              {renderMiniProductCard(product)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation indicator */}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-3">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 bg-green-800 disabled:bg-gray-300 text-white text-[10px] font-semibold pl-2 pr-2.5 py-1 rounded-full transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>prev</span>
            </button>
            <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {currentIndex + 1}/{items.length}
            </span>
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1))}
              disabled={currentIndex === items.length - 1}
              className="flex items-center gap-1 bg-green-800 disabled:bg-gray-300 text-white text-[10px] font-semibold pl-2.5 pr-2 py-1 rounded-full transition-colors"
            >
              <span>next</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderItem = (item: Product | Category, index: number) => {
    const isProduct = section.content_type === 'product';
    const product = isProduct ? (item as Product) : null;
    const category = !isProduct ? (item as Category) : null;

    return (
      <div
        key={item.id}
        onClick={() => handleItemClick(item)}
        className={`group cursor-pointer ${
          section.display_type === 'horizontal' || section.display_type === 'swipable'
            ? 'flex-shrink-0 w-36 sm:w-40'
            : section.display_type === 'grid'
            ? 'break-inside-avoid mb-2'
            : 'w-full'
        }`}
      >
        <div
          className={`relative bg-white overflow-hidden ${cardStyles.container || 'rounded-xl border border-gray-100 shadow-sm'}`}
          style={cardStyles.style}
        >
          <div className={`relative overflow-hidden ${section.display_type === 'grid' ? '' : 'aspect-[3/4]'}`} style={cardStyles.imageStyle}>
            <LazyImage
              src={item.image_url}
              alt={item.name}
              className={`w-full h-full object-cover ${section.display_type === 'grid' ? 'aspect-auto' : ''}`}
            />
            {isProduct && product && (
              <>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <div className="absolute top-1.5 left-1.5 bg-red-500 text-white px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold">
                    {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                  </div>
                )}
                <button
                  onClick={(e) => handleToggleFavorite(e, product.id)}
                  className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center ${
                    favorites.includes(product.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 text-gray-600'
                  }`}
                >
                  <Heart className={`w-3 h-3 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                </button>
              </>
            )}
          </div>
          <div className="p-2 sm:p-2.5">
            <h3 className="font-semibold text-gray-900 mb-0.5 text-[11px] sm:text-xs line-clamp-1 leading-tight">{item.name}</h3>
            {isProduct && product && (
              <>
                <div className="flex items-center gap-1 mb-1.5">
                  {(() => {
                    const activeSize = selectedSizes[product.id] || (product.sizes && product.sizes[0]) || '';
                    const sizePrice = activeSize && product.size_pricing?.[activeSize];
                    return (
                      <>
                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                          {'\u20B9'}{sizePrice ? sizePrice.price : product.price}
                        </span>
                        {(sizePrice?.compare_at_price || (product.compare_at_price && product.compare_at_price > product.price)) && (
                          <span className="text-[9px] sm:text-[10px] text-gray-400 line-through">
                            {'\u20B9'}{sizePrice?.compare_at_price || product.compare_at_price}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
                {isInCart(product.id) && getItemQuantity(product.id) > 0 ? (
                  <div
                    className="flex items-center justify-between bg-green-100 rounded-full border border-green-300 h-7"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const cid = getCartItemId(product.id);
                        if (cid) {
                          const q = getItemQuantity(product.id);
                          if (q <= 1) updateQuantity(cid, 0);
                          else updateQuantity(cid, q - 1);
                        }
                      }}
                      className="w-7 h-7 flex items-center justify-center text-gray-900 hover:text-red-500 transition-colors rounded-full"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-[10px] sm:text-xs font-bold text-gray-900 min-w-[14px] text-center">{getItemQuantity(product.id)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(e, product);
                      }}
                      className="w-7 h-7 flex items-center justify-center text-gray-900 hover:text-gray-700 transition-colors rounded-full"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-full flex items-center justify-center gap-0.5 bg-green-100 text-gray-900 rounded-full h-7 text-[10px] sm:text-[11px] font-bold hover:bg-green-200 transition-colors active:scale-[0.97] border border-green-300"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                )}
              </>
            )}
            {!isProduct && category && (
              <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">{category.description}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCarousel = () => (
    <div className="relative px-4 sm:px-6">
      <div
        className="relative h-[360px] sm:h-[420px] select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleCarouselTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleCarouselMouseUp}
        onMouseLeave={handleCarouselMouseUp}
      >
        {items.map((item, index) => {
          const offset = index - currentIndex;
          if (offset < -1 || offset > 2) return null;

          const isActive = offset === 0;
          const isGone = offset < 0;

          const translateX = isGone
            ? -300 + dragDelta * 0.3
            : isActive
            ? dragDelta
            : offset * 20;
          const translateY = isActive ? 0 : offset * 6;
          const scale = isActive ? 1 : 1 - offset * 0.04;
          const opacity = isGone ? 0 : 1;
          const zIndex = items.length - Math.abs(offset);

          const isProduct = section.content_type === 'product';
          const product = isProduct ? (item as Product) : null;
          const inCart = product ? isInCart(product.id) : false;
          const qty = product ? getItemQuantity(product.id) : 0;
          const cartItemId = product ? getCartItemId(product.id) : null;

          return (
            <div
              key={item.id}
              className="absolute inset-0 flex items-start justify-start transition-all duration-300 ease-out"
              style={{
                transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
                opacity,
                zIndex,
                pointerEvents: isActive ? 'auto' : 'none',
              }}
            >
              <div
                className="w-[88%] h-full rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <div className="relative w-full h-full">
                  <LazyImage
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-base sm:text-lg drop-shadow-lg">{item.name}</h3>
                    {isProduct && product && (
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-white/90 text-sm font-semibold drop-shadow-md">
                          {'\u20B9'}{product.price}
                        </span>
                        {inCart ? (
                          <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => { e.stopPropagation(); if (cartItemId) updateQuantity(cartItemId, qty - 1); }}
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-black"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-black text-xs font-bold min-w-[16px] text-center">{qty}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); if (cartItemId) updateQuantity(cartItemId, qty + 1); }}
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-black"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                            className="flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-3 py-1.5 rounded-full"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Add
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 bg-green-800 disabled:bg-gray-300 text-white text-[10px] font-semibold pl-2 pr-2.5 py-1 rounded-full transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            <span>prev</span>
          </button>
          <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {currentIndex + 1}/{items.length}
          </span>
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1))}
            disabled={currentIndex === items.length - 1}
            className="flex items-center gap-1 bg-green-800 disabled:bg-gray-300 text-white text-[10px] font-semibold pl-2.5 pr-2 py-1 rounded-full transition-colors"
          >
            <span>next</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );

  const renderHorizontalScroll = () => (
    <div className="relative">
      {/* Edge fade shadows */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-20 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-20 bg-gradient-to-l from-white to-transparent" />

      <div
        className="relative h-[340px] sm:h-[390px] select-none overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleCarouselTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleCarouselMouseUp}
        onMouseLeave={handleCarouselMouseUp}
      >
        {items.map((item, index) => {
          const offset = index - currentIndex;
          if (offset < -2 || offset > 2) return null;

          const isActive = offset === 0;
          const absOffset = Math.abs(offset);

          const translateX = isActive
            ? dragDelta
            : offset * 60;
          const scale = isActive ? 0.86 : 0.76 - absOffset * 0.04;
          const zIndex = isActive ? 10 : 5 - absOffset;

          const isProduct = section.content_type === 'product';
          const product = isProduct ? (item as Product) : null;
          const inCart = product ? isInCart(product.id) : false;
          const qty = product ? getItemQuantity(product.id) : 0;
          const cartItemId = product ? getCartItemId(product.id) : null;

          return (
            <div
              key={item.id}
              className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out"
              style={{
                transform: `translateX(${translateX}px) scale(${scale})`,
                opacity: 1,
                zIndex,
                pointerEvents: isActive ? 'auto' : 'none',
                filter: isActive ? 'none' : `brightness(${0.55 - absOffset * 0.1})`,
              }}
            >
              <div
                className="w-[75%] rounded-xl overflow-hidden cursor-pointer border-2 border-gray-200"
                onClick={() => handleItemClick(item)}
              >
                <div className="relative w-full aspect-[3/4]">
                  <LazyImage
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Favorite button */}
                  {isProduct && product && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(e, product.id); }}
                      className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center ${
                        favorites.includes(product.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-600'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                    </button>
                  )}

                  {/* Overlay: name, price, add to cart */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6">
                    <h3 className="text-white font-semibold text-sm drop-shadow-lg line-clamp-1 mb-0.5">{item.name}</h3>
                    {isProduct && product && (
                      <>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-white text-sm font-bold drop-shadow-md">{'\u20B9'}{product.price}</span>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <span className="text-white/60 text-xs line-through">{'\u20B9'}{product.compare_at_price}</span>
                          )}
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          {inCart && qty > 0 ? (
                            <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-full border border-white/40 h-8">
                              <button
                                onClick={(e) => { e.stopPropagation(); if (cartItemId) { if (qty <= 1) updateQuantity(cartItemId, 0); else updateQuantity(cartItemId, qty - 1); } }}
                                className="w-8 h-8 flex items-center justify-center text-white hover:text-red-300 transition-colors rounded-full"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-white min-w-[16px] text-center">{qty}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAddToCart(e, product); }}
                                className="w-8 h-8 flex items-center justify-center text-white hover:text-green-300 transition-colors rounded-full"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAddToCart(e, product); }}
                              className="w-full flex items-center justify-center gap-1 bg-white text-gray-900 rounded-full h-8 text-xs font-bold hover:bg-gray-100 transition-colors active:scale-[0.97]"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add to Cart</span>
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-2">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 bg-green-800 disabled:bg-gray-300 text-white text-[10px] font-semibold pl-2 pr-2.5 py-1 rounded-full transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
            <span>prev</span>
          </button>
          <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {currentIndex + 1}/{items.length}
          </span>
          <button
            onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1))}
            disabled={currentIndex === items.length - 1}
            className="flex items-center gap-1 bg-green-800 disabled:bg-gray-300 text-white text-[10px] font-semibold pl-2.5 pr-2 py-1 rounded-full transition-colors"
          >
            <span>next</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );

  const renderVertical = () => (
    <div className="px-4 sm:px-6">
      <div className="columns-2 gap-3">
        {items.map((item, index) => {
          const isProduct = section.content_type === 'product';
          const product = isProduct ? (item as Product) : null;
          const staggerTop = index % 2 === 1;
          return (
            <div
              key={item.id}
              className={`break-inside-avoid mb-3 cursor-pointer group ${staggerTop ? 'mt-6' : ''}`}
              onClick={() => handleItemClick(item)}
            >
              <div className="relative rounded-xl overflow-hidden shadow-sm">
                <LazyImage
                  src={item.image_url}
                  alt={item.name}
                  className="w-full object-cover"
                />
                {isProduct && product && (
                  <button
                    onClick={(e) => handleToggleFavorite(e, product.id)}
                    className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center ${
                      favorites.includes(product.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-gray-600'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>
              <div className="pt-2 pb-1 px-1">
                <h3 className="font-medium text-gray-900 text-xs sm:text-sm line-clamp-2">{item.name}</h3>
                {isProduct && product && (
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-900">{'\u20B9'}{product.price}</span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-[10px] text-gray-400 line-through">{'\u20B9'}{product.compare_at_price}</span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-black text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-lg transition-colors"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderGrid = () => (
    <div className="px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((item, index) => {
          const isProduct = section.content_type === 'product';
          const product = isProduct ? (item as Product) : null;
          const hasOptions = product && ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0));
          const inCart = product ? isInCart(product.id) : false;
          const qty = product ? getItemQuantity(product.id) : 0;
          const cartItemId = product ? getCartItemId(product.id) : null;
          const discount = product?.compare_at_price && product.compare_at_price > product.price
            ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
            : 0;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer opacity-0 animate-[fadeSlideUp_0.4s_ease-out_forwards]"
              style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
              onClick={() => handleItemClick(item)}
            >
              <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                <LazyImage
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {isProduct && product && discount > 0 && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded">
                    -{discount}%
                  </span>
                )}
                {isProduct && product && (
                  <button
                    onClick={(e) => handleToggleFavorite(e, product.id)}
                    className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 flex items-center justify-center"
                  >
                    <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                )}
                {isProduct && product && !product.in_stock && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <span className="bg-gray-900 text-white px-3 py-1 rounded text-[10px] sm:text-xs font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              <div className="p-2.5 sm:p-3">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2 mb-1">{item.name}</h3>
                {isProduct && product && (
                  <>
                    <div className="flex items-baseline gap-1.5 mb-2.5">
                      <span className="text-sm sm:text-base font-semibold text-gray-900">{'\u20B9'}{product.price}</span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-[10px] sm:text-xs text-gray-400 line-through">{'\u20B9'}{product.compare_at_price}</span>
                      )}
                    </div>

                    {hasOptions ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                        className="w-full flex items-center justify-center gap-1.5 bg-gray-900 text-white rounded-md h-8 sm:h-9 text-xs sm:text-sm font-bold active:scale-[0.98] transition-transform"
                      >
                        <span>Choose Options</span>
                      </button>
                    ) : inCart && qty > 0 ? (
                      <div
                        className="flex items-center justify-between bg-green-100 rounded-md h-8 sm:h-9 border border-green-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); if (cartItemId) { if (qty <= 1) updateQuantity(cartItemId, 0); else updateQuantity(cartItemId, qty - 1); } }}
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-900 font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs sm:text-sm font-bold text-gray-900">{qty}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(e, product); }}
                          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-900 font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(e, product); }}
                        className="w-full flex items-center justify-center gap-1.5 bg-green-100 text-gray-900 rounded-md h-8 sm:h-9 text-xs sm:text-sm font-bold active:scale-[0.98] transition-transform border border-green-300"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    )}
                  </>
                )}
                {!isProduct && (
                  <p className="text-xs text-gray-500 font-medium">View collection</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderHorizontalNormal = () => (
    <div className="relative px-4 sm:px-6">
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-white to-transparent" />
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 snap-x snap-mandatory">
        {items.map((item, index) => {
          const isProduct = section.content_type === 'product';
          const product = isProduct ? (item as Product) : null;
          const hasOptions = product && ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0));
          const inCart = product ? isInCart(product.id) : false;
          const qty = product ? getItemQuantity(product.id) : 0;
          const cartItemId = product ? getCartItemId(product.id) : null;
          const discount = product?.compare_at_price && product.compare_at_price > product.price
            ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
            : 0;

          return (
            <div
              key={item.id}
              className="flex-shrink-0 w-[160px] sm:w-[180px] bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer snap-start"
              style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
              onClick={() => handleItemClick(item)}
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
                <LazyImage
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {isProduct && product && discount > 0 && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-medium px-1.5 py-0.5 rounded">
                    -{discount}%
                  </span>
                )}
                {isProduct && product && (
                  <button
                    onClick={(e) => handleToggleFavorite(e, product.id)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
                  >
                    <Heart className={`w-3.5 h-3.5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>
                )}
                {isProduct && product && !product.in_stock && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <span className="bg-gray-900 text-white px-2 py-0.5 rounded text-[10px] font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{item.name}</h3>
                {isProduct && product && (
                  <>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="text-sm font-bold text-gray-900">{'\u20B9'}{product.price}</span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-[10px] text-gray-400 line-through">{'\u20B9'}{product.compare_at_price}</span>
                      )}
                    </div>
                    {hasOptions ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                        className="w-full flex items-center justify-center gap-1 bg-gray-900 text-white rounded-md h-7 text-[11px] font-bold active:scale-[0.98] transition-transform"
                      >
                        <span>Options</span>
                      </button>
                    ) : inCart && qty > 0 ? (
                      <div
                        className="flex items-center justify-between bg-green-100 rounded-md h-7 border border-green-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); if (cartItemId) { if (qty <= 1) updateQuantity(cartItemId, 0); else updateQuantity(cartItemId, qty - 1); } }}
                          className="w-7 h-7 flex items-center justify-center text-gray-900 font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-gray-900">{qty}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(e, product); }}
                          className="w-7 h-7 flex items-center justify-center text-gray-900 font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(e, product); }}
                        className="w-full flex items-center justify-center gap-1 bg-green-100 text-gray-900 rounded-md h-7 text-[11px] font-bold active:scale-[0.98] transition-transform border border-green-300"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    )}
                  </>
                )}
                {!isProduct && (
                  <p className="text-[10px] text-gray-500 font-medium">View collection</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderVerticalNormal = () => (
    <div className="px-4 sm:px-6 space-y-3">
      {items.map((item, index) => {
        const isProduct = section.content_type === 'product';
        const product = isProduct ? (item as Product) : null;
        const hasOptions = product && ((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0));
        const inCart = product ? isInCart(product.id) : false;
        const qty = product ? getItemQuantity(product.id) : 0;
        const cartItemId = product ? getCartItemId(product.id) : null;
        const discount = product?.compare_at_price && product.compare_at_price > product.price
          ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
          : 0;

        return (
          <div
            key={item.id}
            className="flex gap-3 bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer p-3"
            onClick={() => handleItemClick(item)}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
              <LazyImage
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {isProduct && product && discount > 0 && (
                <span className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-medium px-1 py-0.5 rounded">
                  -{discount}%
                </span>
              )}
              {isProduct && product && !product.in_stock && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <span className="bg-gray-900 text-white px-1.5 py-0.5 rounded text-[8px] font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">{item.name}</h3>
                {isProduct && product && (
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-sm font-bold text-gray-900">{'\u20B9'}{product.price}</span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="text-[10px] text-gray-400 line-through">{'\u20B9'}{product.compare_at_price}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-2">
                {isProduct && product && (
                  hasOptions ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                      className="flex items-center justify-center gap-1 bg-gray-900 text-white rounded-md h-7 px-3 text-[11px] font-bold active:scale-[0.98] transition-transform"
                    >
                      <span>Choose Options</span>
                    </button>
                  ) : inCart && qty > 0 ? (
                    <div
                      className="inline-flex items-center bg-green-100 rounded-md h-7 border border-green-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); if (cartItemId) { if (qty <= 1) updateQuantity(cartItemId, 0); else updateQuantity(cartItemId, qty - 1); } }}
                        className="w-7 h-7 flex items-center justify-center text-gray-900 font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-gray-900 w-5 text-center">{qty}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(e, product); }}
                        className="w-7 h-7 flex items-center justify-center text-gray-900 font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(e, product); }}
                      className="flex items-center justify-center gap-1 bg-green-100 text-gray-900 rounded-md h-7 px-3 text-[11px] font-bold active:scale-[0.98] transition-transform border border-green-300"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add to Cart</span>
                    </button>
                  )
                )}
                {!isProduct && (
                  <p className="text-[10px] text-gray-500 font-medium">View collection</p>
                )}
              </div>
            </div>

            {isProduct && product && (
              <button
                onClick={(e) => handleToggleFavorite(e, product.id)}
                className="self-start w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0"
              >
                <Heart className={`w-3.5 h-3.5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  // For category sections, use the card stack layout
  if (isAllCategories) {
    return (
      <section className="py-5 px-4">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">{section.title}</h2>
          {section.subtitle && (
            <p className="text-sm text-gray-500">{section.subtitle}</p>
          )}
        </div>

        {renderCategoryCardStack()}

        <Confetti
          isActive={confettiActive}
          originX={confettiOrigin.x}
          originY={confettiOrigin.y}
          onComplete={() => setConfettiActive(false)}
        />
      </section>
    );
  }

  return (
    <section className="py-5">
      <div className={`mb-4 ${(section.display_type === 'horizontal' || section.display_type === 'swipable') ? 'px-0' : ''}`}>
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">{section.title}</h2>
        {section.subtitle && (
          <p className="text-sm text-gray-500">{section.subtitle}</p>
        )}
      </div>

      {section.display_type === 'carousel' && renderCarousel()}
      {section.display_type === 'horizontal' && renderHorizontalScroll()}
      {section.display_type === 'swipable' && renderHorizontalScroll()}
      {section.display_type === 'horizontal_normal' && renderHorizontalNormal()}
      {section.display_type === 'vertical' && renderVertical()}
      {section.display_type === 'vertical_normal' && renderVerticalNormal()}
      {section.display_type === 'grid' && renderGrid()}

      <Confetti
        isActive={confettiActive}
        originX={confettiOrigin.x}
        originY={confettiOrigin.y}
        onComplete={() => setConfettiActive(false)}
      />
    </section>
  );
}
