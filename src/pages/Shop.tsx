import { useEffect, useState, useCallback } from 'react';
import { Filter, SlidersHorizontal, ShoppingCart, Heart, Star, X, MessageCircle, Shield, Plus, Minus } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCardDesign, getCardStyles } from '../hooks/useCardDesign';
import EnquiryModal from '../components/EnquiryModal';
import WhatsAppCustomization from '../components/WhatsAppCustomization';
import BottomSheet from '../components/BottomSheet';
import ShimmerLoader from '../components/ShimmerLoader';
import FilterBottomSheet from '../components/FilterBottomSheet';
import LazyImage from '../components/LazyImage';
import SmartFeatureFAB from '../components/SmartFeatureFAB';
import Confetti from '../components/Confetti';
import { playAddToCartSound } from '../utils/sounds';
import ColorMatchProductList from '../components/ColorMatchProductList';

import { onValue } from 'firebase/database';
import { getPublishedData, objectToArray } from '../utils/publishedData';
import type { Product, Category } from '../types';
import VirtualTryOn from '../components/VirtualTryOn';

interface ShopProps {
  onCartClick: () => void;
  onProductClick?: (product: Product) => void;
}

export default function Shop({ onCartClick, onProductClick }: ShopProps) {
  const { addToCart, isInCart, taxSettings, getItemQuantity, getCartItemId, updateQuantity } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { design } = useCardDesign('shop_page');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [activePolicyKey, setActivePolicyKey] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [showInStock, setShowInStock] = useState(false);
  const [showOnSale, setShowOnSale] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiOrigin, setConfettiOrigin] = useState({ x: 50, y: 50 });
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [showSmartFeatureFAB, setShowSmartFeatureFAB] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);
  const [showColorMatchList, setShowColorMatchList] = useState(false);

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
    async function fetchCategories() {
      try {
        const publishedData = await getPublishedData();
        let categoriesData: Category[] = [];
        if (publishedData && publishedData.categories) {
          categoriesData = objectToArray<Category>(publishedData.categories);
          categoriesData.sort((a, b) => a.name.localeCompare(b.name));
        }
        setCategories(categoriesData);

        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
          setSelectedCategory(categoryParam);
          setTimeout(() => {
            const productsSection = document.getElementById('products-section');
            if (productsSection) {
              productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleOpenProductDetails = (event: CustomEvent) => {
      const product = event.detail;
      if (onProductClick) onProductClick(product);
    };

    window.addEventListener('openProductDetails', handleOpenProductDetails as EventListener);

    return () => {
      window.removeEventListener('openProductDetails', handleOpenProductDetails as EventListener);
    };
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setProducts([]);
      try {
        const publishedData = await getPublishedData();
        let productsData: Product[] = [];
        if (publishedData && publishedData.products) {
          productsData = objectToArray<Product>(publishedData.products);
        }

        if (selectedCategory) {
          productsData = productsData.filter(p => {
            if (p.category_ids && p.category_ids.length > 0) {
              return p.category_ids.includes(selectedCategory);
            }
            return p.category_id === selectedCategory;
          });
        }

        if (showInStock) {
          productsData = productsData.filter(p => p.in_stock);
        }

        if (showOnSale) {
          productsData = productsData.filter(p => p.compare_at_price && p.compare_at_price > p.price);
        }

        switch (sortBy) {
          case 'newest':
            productsData.sort((a, b) => {
              const dateA = new Date(a.created_at || 0).getTime();
              const dateB = new Date(b.created_at || 0).getTime();
              return dateB - dateA;
            });
            break;
          case 'price-low':
            productsData.sort((a, b) => a.price - b.price);
            break;
          case 'price-high':
            productsData.sort((a, b) => b.price - a.price);
            break;
          case 'name-az':
            productsData.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'name-za':
            productsData.sort((a, b) => b.name.localeCompare(a.name));
            break;
          case 'featured':
          default:
            productsData.sort((a, b) => {
              if (a.featured && !b.featured) return -1;
              if (!a.featured && b.featured) return 1;
              const dateA = new Date(a.created_at || 0).getTime();
              const dateB = new Date(b.created_at || 0).getTime();
              return dateB - dateA;
            });
            break;
        }

        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [selectedCategory, sortBy, showInStock, showOnSale]);

  const handleAddToCart = useCallback((product: Product, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    setConfettiOrigin({ x, y });
    setConfettiActive(true);
    playAddToCartSound();
    const activeSize = selectedSizes[product.id] || (product.sizes && product.sizes[0]) || '';
    const activeColor = selectedColors[product.id] || (product.colors && product.colors[0]) || '';
    if (activeSize && product.size_pricing?.[activeSize]) {
      addToCart({ ...product, price: product.size_pricing[activeSize].price, default_size: activeSize }, 1, activeSize, activeColor);
    } else {
      addToCart(product, 1, activeSize, activeColor);
    }
  }, [addToCart, selectedSizes, selectedColors]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">
                Categories
              </h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full transition-all text-sm font-medium ${
                    selectedCategory === null
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">
                    A
                  </span>
                  <span>All</span>
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )}
                    className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full transition-all text-sm font-medium ${
                      selectedCategory === category.id
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <span className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {category.name.charAt(0)}
                      </span>
                    )}
                    <span className="truncate max-w-[120px]">{category.name}</span>
                    {selectedCategory === category.id && (
                      <X className="w-3.5 h-3.5 ml-0.5 flex-shrink-0 opacity-70" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6" id="products-section">
              <p className="text-sm text-gray-500">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 bg-white border border-gray-200 rounded-md px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">New Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-az">Name: A-Z</option>
                  <option value="name-za">Name: Z-A</option>
                </select>

                <button
                  onClick={() => setFilterOpen(true)}
                  className="lg:hidden h-9 w-9 flex items-center justify-center bg-white border border-gray-200 rounded-md"
                >
                  <Filter className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                    <div className="aspect-[4/5] bg-gray-100 animate-pulse"></div>
                    <div className="p-2.5 sm:p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
                      <div className="h-8 bg-gray-100 rounded animate-pulse mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                <p className="text-sm text-gray-500">Try adjusting your filters or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-3 xl:grid-cols-4 xl:gap-4">
                {products.map((product, index) => {
                  const inCart = isInCart(product.id);
                  const qty = getItemQuantity(product.id);
                  const cartItemId = getCartItemId(product.id);
                  const discount = product.compare_at_price
                    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
                    : 0;
                  const hasOptions = (product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0);

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden opacity-0 animate-[fadeSlideUp_0.4s_ease-out_forwards] shadow-sm"
                      style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
                    >
                      {/* Image */}
                      <div
                        className="aspect-[4/5] overflow-hidden relative cursor-pointer bg-gray-100"
                        onClick={() => {
                          if (onProductClick) onProductClick(product);
                        }}
                      >
                        <LazyImage
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.featured && (
                            <span className="bg-gray-900 text-white text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                          {discount > 0 && (
                            <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded">
                              -{discount}%
                            </span>
                          )}
                        </div>

                        {/* Favorite */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product.id);
                          }}
                          className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 flex items-center justify-center"
                        >
                          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        </button>

                        {/* Size selector overlay */}
                        {product.sizes && product.sizes.length > 0 && (
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-2 py-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex gap-1 overflow-x-auto no-scrollbar">
                              {product.sizes.map((size) => (
                                <button
                                  key={size}
                                  onClick={() => setSelectedSizes(prev => ({ ...prev, [product.id]: size }))}
                                  className={`flex-shrink-0 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium ${
                                    (selectedSizes[product.id] || product.sizes![0]) === size
                                      ? 'bg-white text-gray-900'
                                      : 'bg-white/20 text-white'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Color dots overlay (when no sizes) */}
                        {product.colors && product.colors.length > 0 && !(product.sizes && product.sizes.length > 0) && (
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-2 py-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                              {product.colors.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setSelectedColors(prev => ({ ...prev, [product.id]: color }))}
                                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all ${
                                    (selectedColors[product.id] || product.colors![0]) === color
                                      ? 'border-white scale-110'
                                      : 'border-white/30'
                                  }`}
                                  style={{ backgroundColor: color.toLowerCase() }}
                                  title={color}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Out of stock */}
                        {!product.in_stock && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                            <span className="bg-gray-900 text-white px-3 py-1 rounded text-[10px] sm:text-xs font-medium">Out of Stock</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-2.5 sm:p-3">
                        <h3
                          className="text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2 mb-1 cursor-pointer"
                          onClick={() => {
                            if (onProductClick) onProductClick(product);
                          }}
                        >
                          {product.name}
                        </h3>

                        {/* Color swatches in card */}
                        {product.colors && product.colors.length > 0 && product.sizes && product.sizes.length > 0 && (
                          <div className="flex gap-1 mb-2">
                            {product.colors.slice(0, 5).map((color) => (
                              <button
                                key={color}
                                onClick={() => setSelectedColors(prev => ({ ...prev, [product.id]: color }))}
                                className={`w-4 h-4 rounded-full border transition-all ${
                                  (selectedColors[product.id] || product.colors![0]) === color
                                    ? 'border-gray-900 scale-110'
                                    : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color.toLowerCase() }}
                                title={color}
                              />
                            ))}
                            {product.colors.length > 5 && (
                              <span className="text-[9px] text-gray-400 self-center">+{product.colors.length - 5}</span>
                            )}
                          </div>
                        )}

                        <div className="flex items-baseline gap-1.5 mb-2.5">
                          {(() => {
                            const activeSize = selectedSizes[product.id] || (product.sizes && product.sizes[0]) || '';
                            const sizePrice = activeSize && product.size_pricing?.[activeSize];
                            return (
                              <>
                                <span className="text-sm sm:text-base font-semibold text-gray-900">
                                  {'\u20B9'}{sizePrice ? sizePrice.price : product.price}
                                </span>
                                {(sizePrice?.compare_at_price || product.compare_at_price) && (
                                  <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                                    {'\u20B9'}{sizePrice?.compare_at_price || product.compare_at_price}
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        {/* Add to Cart / Choose Options / Quantity */}
                        {hasOptions ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); if (onProductClick) onProductClick(product); }}
                            disabled={!product.in_stock}
                            className="w-full flex items-center justify-center gap-1.5 bg-gray-900 text-white rounded-md h-8 sm:h-9 text-xs sm:text-sm font-bold active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-transform"
                          >
                            <span>Choose Options</span>
                          </button>
                        ) : inCart && qty > 0 ? (
                          <div className="flex items-center justify-between bg-green-100 rounded-md h-8 sm:h-9 border border-green-300">
                            <button
                              onClick={() => {
                                if (cartItemId) {
                                  if (qty <= 1) {
                                    updateQuantity(cartItemId, 0);
                                  } else {
                                    updateQuantity(cartItemId, qty - 1);
                                  }
                                }
                              }}
                              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-900 font-bold"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs sm:text-sm font-bold text-gray-900">{qty}</span>
                            <button
                              onClick={(e) => handleAddToCart(product, e)}
                              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-900 font-bold"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={!product.in_stock}
                            className="w-full flex items-center justify-center gap-1.5 bg-green-100 text-gray-900 rounded-md h-8 sm:h-9 text-xs sm:text-sm font-bold active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-transform border border-green-300"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      <EnquiryModal isOpen={showEnquiryModal} onClose={() => setShowEnquiryModal(false)} />
      <FilterBottomSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        showInStock={showInStock}
        showOnSale={showOnSale}
        onInStockChange={setShowInStock}
        onOnSaleChange={setShowOnSale}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

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

      <Confetti
        isActive={confettiActive}
        originX={confettiOrigin.x}
        originY={confettiOrigin.y}
        onComplete={() => setConfettiActive(false)}
      />
    </div>
  );
}
