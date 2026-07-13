import { useState, useEffect, useRef } from 'react';
import { X, ShoppingCart, ChevronLeft, ChevronRight, Heart, ZoomIn, Sparkles, ShoppingBag, TrendingUp, Eye, Tag, CheckCircle2, Zap, Scan, Box, Share2, Copy, Check, Upload, Palette, Minus, Plus } from 'lucide-react';
import Confetti from './Confetti';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { usePublishedData } from '../contexts/PublishedDataContext';
import { objectToArray } from '../utils/publishedData';
import { getProxiedImageUrl } from '../utils/imageUrlHandler';
import LazyImage from './LazyImage';
import VirtualTryOn from './VirtualTryOn';
import DressColorMatcher from './DressColorMatcher';
import { brand } from '../config/brand';

interface ProductDetailsSheetProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onCartClick?: () => void;
}

const colorMap: { [key: string]: string } = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#6B7280',
  grey: '#6B7280',
  pink: '#EC4899',
  purple: '#A855F7',
  orange: '#F97316',
  brown: '#92400E',
  navy: '#1E3A8A',
  beige: '#D4C5B9',
  cream: '#FFFDD0',
  maroon: '#800000',
  gold: '#FFD700',
  silver: '#C0C0C0',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  lime: '#84CC16',
  indigo: '#6366F1',
};

const getColorCode = (colorName: string): string => {
  const normalized = colorName.toLowerCase().trim();
  return colorMap[normalized] || '#9CA3AF';
};

export default function ProductDetailsSheet({ product, isOpen, onClose, onCartClick }: ProductDetailsSheetProps) {
  const { data: publishedData } = usePublishedData();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [justAdded, setJustAdded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0, distance: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showColorMatcher, setShowColorMatcher] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart, updateQuantity, items } = useCart();
  const { toggleFavorite, isFavorite, favorites } = useFavorites();

  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0);
      setQuantity(1);
      setSelectedSize(product.default_size || (product.sizes && product.sizes[0]) || '');
      setSelectedColor(product.default_color || (product.colors && product.colors[0]) || '');
      setFullScreenImage(null);
      setJustAdded(false);
      setShowConfetti(false);
      setImageScale(1);
      setImagePosition({ x: 0, y: 0 });
      setIsDragging(false);
      setShowShareDialog(false);
      setCopySuccess(false);
      setShowColorMatcher(false);
      setSheetExpanded(false);
      loadSuggestedProducts();
    }
  }, [product?.id]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isOpen) return;
    const handleScroll = () => {
      if (el.scrollTop > 40 && !sheetExpanded) {
        setSheetExpanded(true);
      } else if (el.scrollTop <= 10 && sheetExpanded) {
        setSheetExpanded(false);
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [isOpen, sheetExpanded]);

  const loadSuggestedProducts = async () => {
    if (!product || !publishedData?.products) return;
    try {
      const allProducts = objectToArray<Product>(publishedData.products)
        .filter((p: Product) => p.id !== product.id && p.in_stock && (p.isVisible !== false));
      const sameCategoryProducts = allProducts.filter(
        (p: Product) => p.category === product.category
      );
      const nameMatchedProducts = allProducts.filter((p: Product) => {
        const productWords = product.name.toLowerCase().split(' ');
        const pWords = p.name.toLowerCase().split(' ');
        return productWords.some((word) => pWords.includes(word));
      });
      const shuffled = [...new Set([...sameCategoryProducts, ...nameMatchedProducts, ...allProducts])]
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
      setSuggestedProducts(shuffled);
    } catch (error) {
      console.error('Error loading suggested products:', error);
    }
  };

  const loadWishlistProducts = async () => {
    if (favorites.length === 0 || !publishedData?.products) {
      setWishlistProducts([]);
      return;
    }
    try {
      const allProducts = objectToArray<Product>(publishedData.products)
        .filter((p: Product) => favorites.includes(p.id) && (p.isVisible !== false));
      setWishlistProducts(allProducts);
    } catch (error) {
      console.error('Error loading wishlist products:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadWishlistProducts();
    }
  }, [favorites, isOpen]);

  if (!product || !isOpen) return null;

  const allImages = [product.image_url, ...(product.gallery_images || [])].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleAddToCart = () => {
    if (!product) return;
    const needsColor = product.colors && product.colors.length > 0 && !selectedColor;
    const needsSize = product.sizes && product.sizes.length > 0 && !selectedSize;
    if (needsColor || needsSize) return;

    const sizeToUse = selectedSize || (product.sizes && product.sizes[0]) || '';
    if (sizeToUse && product.size_pricing?.[sizeToUse]) {
      addToCart({ ...product, price: product.size_pricing[sizeToUse].price }, quantity, sizeToUse, selectedColor);
    } else {
      addToCart(product, quantity, sizeToUse, selectedColor);
    }
    setJustAdded(true);
    setShowConfetti(true);
  };

  const canAddToCart = (): boolean => {
    if (!product || !product.in_stock) return false;
    if (product.colors && product.colors.length > 0 && !selectedColor) return false;
    if (product.sizes && product.sizes.length > 0 && !selectedSize) return false;
    return true;
  };

  const currentCartItemId = product ? `${product.id}-${selectedSize || 'no-size'}-${selectedColor || 'no-color'}` : '';
  const isCurrentVariantInCart = items.some(item => item.cart_item_id === currentCartItemId);
  const currentVariantQuantity = items.find(item => item.cart_item_id === currentCartItemId)?.quantity || 0;

  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      setTouchStart({ x: 0, y: 0, distance });
    } else if (e.touches.length === 1 && imageScale > 1) {
      setIsDragging(true);
      setTouchStart({
        x: e.touches[0].clientX - imagePosition.x,
        y: e.touches[0].clientY - imagePosition.y,
        distance: 0
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      if (touchStart.distance > 0) {
        const scale = (distance / touchStart.distance) * imageScale;
        setImageScale(Math.min(Math.max(1, scale), 4));
      }
    } else if (e.touches.length === 1 && isDragging && imageScale > 1) {
      e.preventDefault();
      setImagePosition({
        x: e.touches[0].clientX - touchStart.x,
        y: e.touches[0].clientY - touchStart.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setTouchStart({ x: 0, y: 0, distance: 0 });
    setIsDragging(false);
    if (imageScale <= 1) {
      setImageScale(1);
      setImagePosition({ x: 0, y: 0 });
    }
  };

  const handleGoToCart = () => {
    onClose();
    if (onCartClick) {
      setTimeout(() => onCartClick(), 300);
    }
  };

  const getCurrentPrice = () => {
    if (selectedSize && product.size_pricing && product.size_pricing[selectedSize]) {
      return product.size_pricing[selectedSize].price;
    }
    return product.price;
  };

  const getCurrentComparePrice = () => {
    if (selectedSize && product.size_pricing && product.size_pricing[selectedSize]) {
      return product.size_pricing[selectedSize].compare_at_price;
    }
    return product.compare_at_price;
  };

  const currentPrice = getCurrentPrice();
  const currentComparePrice = getCurrentComparePrice();
  const discount = currentComparePrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0;

  const getProductShareUrl = () => {
    return `${window.location.origin}${window.location.pathname}?product=${product.id}`;
  };

  const handleShare = async () => {
    const shareUrl = getProductShareUrl();
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} - \u20B9${currentPrice}`,
      url: shareUrl,
    };
    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setShowShareDialog(true);
        }
      }
    } else {
      setShowShareDialog(true);
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = getProductShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareDialog(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <>
      <div className="relative z-[100]">
        <VirtualTryOn
          isOpen={showTryOn}
          onClose={() => setShowTryOn(false)}
          product={product}
        />
        <DressColorMatcher
          isOpen={showColorMatcher}
          onClose={() => setShowColorMatcher(false)}
          currentProduct={product || undefined}
        />
      </div>
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div
        className={`fixed inset-0 z-50 transition-[visibility] duration-300 ${
          isOpen ? 'visible' : 'invisible delay-300'
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />

        <div
          className={`absolute left-0 right-0 bg-white overflow-hidden rounded-t-3xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          } ${sheetExpanded ? 'top-0 !rounded-t-none' : 'top-[8%]'}`}
          style={{ bottom: 0 }}
        >
          {/* Drag handle */}
          {!sheetExpanded && (
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div ref={scrollRef} className="overflow-y-auto h-full">
            {/* Image Section */}
            <div className="relative bg-gray-50">
              <div
                ref={imageRef}
                className="aspect-[3/4] sm:aspect-square relative overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <LazyImage
                  src={getProxiedImageUrl(allImages[currentImageIndex])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onClick={() => setFullScreenImage(allImages[currentImageIndex])}
                  style={{
                    transform: `scale(${imageScale}) translate(${imagePosition.x / imageScale}px, ${imagePosition.y / imageScale}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                  }}
                />

                {/* Left side action buttons */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center border border-gray-200"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare();
                    }}
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center border border-gray-200"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Zoom button bottom right */}
                <button
                  onClick={() => setFullScreenImage(allImages[currentImageIndex])}
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center border border-gray-200 z-10"
                >
                  <ZoomIn className="w-5 h-5 text-gray-600" />
                </button>

                {/* Try on button bottom left */}
                {product.try_on_enabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTryOn(true);
                    }}
                    className="absolute bottom-4 left-4 flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm text-white px-4 py-2.5 rounded-full z-10"
                  >
                    <Scan className="w-4 h-4" />
                    <span className="text-sm font-medium">Try it on</span>
                    <span className="bg-green-500 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Live</span>
                  </button>
                )}

                {/* Image dots indicator */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      disabled={currentImageIndex === 0}
                      className="flex items-center gap-1 bg-green-800 disabled:bg-gray-500/70 text-white text-[10px] font-semibold pl-2 pr-2.5 py-1 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      <span>prev</span>
                    </button>
                    <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {currentImageIndex + 1}/{allImages.length}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      disabled={currentImageIndex === allImages.length - 1}
                      className="flex items-center gap-1 bg-green-800 disabled:bg-gray-500/70 text-white text-[10px] font-semibold pl-2.5 pr-2 py-1 rounded-full transition-colors"
                    >
                      <span>next</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Navigation arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center z-10"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center z-10"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-700" />
                    </button>
                  </>
                )}

                {/* Out of stock overlay */}
                {!product.in_stock && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
                    <span className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="px-4 sm:px-6 pt-5 pb-6">
              {/* Category + Name + Price row */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  {product.category && (
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1.5 block">
                      {product.category}
                    </span>
                  )}
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug">
                    {product.name}
                  </h1>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-2xl font-semibold text-gray-900">
                    {'\u20B9'}{currentPrice}
                  </span>
                  {publishedData?.tax_settings?.is_enabled && (
                    <p className="text-[11px] text-gray-500 mt-0.5">incl. of all taxes</p>
                  )}
                </div>
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {product.in_stock && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    In stock
                  </span>
                )}
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200">
                  ID: {product.id.slice(0, 8)}
                </span>
                {discount > 0 && (
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                    {discount}% OFF
                  </span>
                )}
                {currentComparePrice && (
                  <span className="text-xs text-gray-400 line-through">
                    {'\u20B9'}{currentComparePrice}
                  </span>
                )}
              </div>

              {/* Thumbnail strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex
                          ? 'border-gray-900'
                          : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={getProxiedImageUrl(image)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = image;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Color: <span className="text-gray-500">{selectedColor || 'Select'}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((color, index) => {
                      const colorCode = getColorCode(color);
                      const isWhiteOrLight = ['#FFFFFF', '#FFFDD0', '#D4C5B9'].includes(colorCode);
                      const isSelected = selectedColor === color;
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full border-2 transition-colors ${
                            isSelected ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2' : isWhiteOrLight ? 'border-gray-300' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: colorCode }}
                          title={color}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Size: <span className="text-gray-500">{selectedSize || product.sizes[0]}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                          selectedSize === size
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-5">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
                <div className="inline-flex items-center border border-gray-200 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-600"
                    disabled={!product.in_stock}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 h-10 flex items-center justify-center text-sm font-semibold text-gray-900 border-l border-r border-gray-200">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-600"
                    disabled={!product.in_stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dress Color Matching */}
              {product.availableColors && product.availableColors.length > 0 && (
                <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-gray-500" />
                    Dress Color Matching
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Available in {product.availableColors.length} colors. Upload your dress photo to find a match.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {product.availableColors.map((color, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded border border-gray-200 capitalize"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowColorMatcher(true)}
                    className="w-full py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Dress & Match
                  </button>
                </div>
              )}

              {/* Description / Highlights */}
              {product.description && (
                <div className="mb-5">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Highlights</h3>
                  <div className="space-y-3">
                    {product.description.split('\n').filter(Boolean).map((line, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-7 h-7 relative flex items-center justify-center mt-0.5">
                          <span className="absolute inset-0 rounded-full border-[1.5px] border-dashed border-green-400 animate-[spin_6s_linear_infinite]"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{line.replace(/^[•\-\*]\s*/, '')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {product.try_on_enabled && (
                  <button
                    onClick={() => setShowTryOn(true)}
                    className="w-full py-3 rounded-md font-medium text-sm flex items-center justify-center gap-2 bg-gray-100 text-gray-900 border border-gray-200 active:scale-[0.98] transition-transform"
                  >
                    <Scan className="w-4 h-4" />
                    Try On Your Hair
                  </button>
                )}

                {isCurrentVariantInCart ? (
                  <div className="flex items-center justify-between bg-green-100 rounded-md h-12 border border-green-300">
                    <button
                      onClick={() => {
                        updateQuantity(currentCartItemId, currentVariantQuantity - 1);
                      }}
                      className="w-12 h-12 flex items-center justify-center text-gray-900"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-gray-900">{currentVariantQuantity}</span>
                    <button
                      onClick={() => handleAddToCart()}
                      className="w-12 h-12 flex items-center justify-center text-gray-900"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={!canAddToCart()}
                    className="w-full py-3.5 rounded-md font-bold text-sm flex items-center justify-center gap-2 bg-green-100 text-gray-900 border border-green-300 active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    {!product.in_stock ? 'Out of Stock' : !canAddToCart() ? 'Select Options' : 'Add to Cart'}
                  </button>
                )}
              </div>
            </div>

            {/* Wishlist Section */}
            {wishlistProducts.length > 0 && (
              <div className="px-4 sm:px-6 py-6 border-t border-gray-100">
                <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  Your Wishlist
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {wishlistProducts.map((wishlistProduct) => (
                    <button
                      key={wishlistProduct.id}
                      onClick={() => {
                        onClose();
                        setTimeout(() => {
                          const event = new CustomEvent('openProductDetails', { detail: wishlistProduct });
                          window.dispatchEvent(event);
                        }, 300);
                      }}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden text-left"
                    >
                      <div className="aspect-square overflow-hidden bg-gray-50">
                        <img
                          src={wishlistProduct.image_url}
                          alt={wishlistProduct.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-medium text-gray-900 truncate mb-1">
                          {wishlistProduct.name}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {'\u20B9'}{wishlistProduct.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Products */}
            {suggestedProducts.length > 0 && (
              <div className="px-4 sm:px-6 py-6 border-t border-gray-100 bg-gray-50/50">
                <h3 className="text-base font-medium text-gray-900 mb-4">You Might Also Like</h3>
                <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                  {suggestedProducts.map((suggestedProduct, idx) => {
                    const suggestedDiscount = suggestedProduct.compare_at_price
                      ? Math.round(((suggestedProduct.compare_at_price - suggestedProduct.price) / suggestedProduct.compare_at_price) * 100)
                      : 0;
                    const aspectVariants = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-[2/3]', 'aspect-[3/4]', 'aspect-[5/6]', 'aspect-[2/3]'];
                    const aspect = aspectVariants[idx % aspectVariants.length];
                    return (
                      <button
                        key={suggestedProduct.id}
                        onClick={() => {
                          onClose();
                          setTimeout(() => {
                            const event = new CustomEvent('openProductDetails', { detail: suggestedProduct });
                            window.dispatchEvent(event);
                          }, 300);
                        }}
                        className="break-inside-avoid bg-white rounded-xl overflow-hidden text-left shadow-sm border border-gray-100 hover:shadow-md transition-shadow w-full"
                      >
                        <div className={`${aspect} overflow-hidden bg-gray-100 relative`}>
                          <img
                            src={suggestedProduct.image_url}
                            alt={suggestedProduct.name}
                            className="w-full h-full object-cover"
                          />
                          {suggestedDiscount > 0 && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                              -{suggestedDiscount}%
                            </span>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight mb-1.5">
                            {suggestedProduct.name}
                          </p>
                          <div className="flex items-baseline gap-1.5">
                            <p className="text-sm font-bold text-gray-900">
                              {'\u20B9'}{suggestedProduct.price}
                            </p>
                            {suggestedProduct.compare_at_price && (
                              <p className="text-[10px] text-gray-400 line-through">
                                {'\u20B9'}{suggestedProduct.compare_at_price}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Copyright Footer */}
            <div className="px-4 sm:px-6 py-6 border-t border-gray-100 text-center">
              <p className="text-xs font-medium text-gray-900">&copy; {brand.name}</p>
              <p className="text-[10px] text-gray-400 mt-1">
                powered by <a href="https://tagyverse.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 underline">tagyverse</a> - tagyverse.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <VirtualTryOn
        isOpen={showTryOn}
        onClose={() => setShowTryOn(false)}
        product={product}
      />

      <DressColorMatcher
        isOpen={showColorMatcher}
        onClose={() => setShowColorMatcher(false)}
        currentProduct={product || undefined}
      />

      {/* Full screen image viewer */}
      {fullScreenImage && (
        <div
          className="fixed inset-0 z-[60] bg-black flex items-center justify-center"
          onClick={() => setFullScreenImage(null)}
        >
          <button
            onClick={() => setFullScreenImage(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center z-10"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <img
            src={getProxiedImageUrl(fullScreenImage)}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = fullScreenImage;
            }}
          />

          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
                  setCurrentImageIndex(newIndex);
                  setFullScreenImage(allImages[newIndex]);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = (currentImageIndex + 1) % allImages.length;
                  setCurrentImageIndex(newIndex);
                  setFullScreenImage(allImages[newIndex]);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <div
          className="fixed inset-0 z-[70] bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowShareDialog(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md sm:rounded-lg rounded-t-xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-gray-900">Share Product</h3>
              <button
                onClick={() => setShowShareDialog(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-xs text-gray-500 break-all font-mono">
                  {getProductShareUrl()}
                </p>
              </div>

              <button
                onClick={handleCopyLink}
                disabled={copySuccess}
                className="w-full py-3 rounded-md font-medium text-sm flex items-center justify-center gap-2 bg-gray-900 text-white active:scale-[0.98] transition-transform disabled:opacity-70"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>

              <div className="flex gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out ${product.name} - \u20B9${currentPrice}\n${getProductShareUrl()}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-md font-medium text-sm flex items-center justify-center gap-2 text-white active:scale-[0.98] transition-transform"
                  style={{ backgroundColor: '#25D366' }}
                >
                  WhatsApp
                </a>
                <a
                  href={`https://telegram.me/share/url?url=${encodeURIComponent(getProductShareUrl())}&text=${encodeURIComponent(`Check out ${product.name} - \u20B9${currentPrice}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-md font-medium text-sm flex items-center justify-center gap-2 text-white active:scale-[0.98] transition-transform"
                  style={{ backgroundColor: '#0088cc' }}
                >
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
