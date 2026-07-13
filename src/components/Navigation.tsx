'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingBag, Search, Home as HomeIcon, Store, User, LogOut, Settings, X, ShoppingCart, Package, ChevronUp, Minus, Plus, MapPin, Heart, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { usePublishedData } from '../contexts/PublishedDataContext';
import { objectToArray } from '../utils/publishedData';
import { brand } from '../config/brand';
import type { Product } from '../types';

interface NavigationProps {
  currentPage: 'home' | 'shop' | 'admin' | 'checkout';
  onNavigate: (page: 'home' | 'shop' | 'admin' | 'checkout') => void;
  onLoginClick: () => void;
  onCartClick: () => void;
  onOrdersClick: () => void;
  onAddressClick?: () => void;
  onWishlistClick?: () => void;
  onProductClick?: (product: Product) => void;
  hideFloatingBar?: boolean;
}

export default function Navigation({ currentPage, onNavigate, onLoginClick, onCartClick, onOrdersClick, onAddressClick, onWishlistClick, onProductClick, hideFloatingBar }: NavigationProps) {
  const { user, signOut } = useAuth();
  const { itemCount, addToCart, getItemQuantity, getCartItemId, updateQuantity } = useCart();
  const { data: publishedData } = usePublishedData();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFullscreen, setSearchFullscreen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [floatingSearchFocused, setFloatingSearchFocused] = useState(false);
  const [floatingSearchQuery, setFloatingSearchQuery] = useState('');
  const [floatingResults, setFloatingResults] = useState<Product[]>([]);
  const navRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const floatingInputRef = useRef<HTMLInputElement>(null);
  const searchSheetRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const touchStartY = useRef(0);
  const touchCurrentY = useRef(0);
  const isDevelopment = import.meta.env.DEV;

  const [navStyle, setNavStyle] = useState({
    background: brand.navigation.style.background,
    text: brand.navigation.style.text,
    activeTab: brand.navigation.style.activeTab,
    inactiveButton: brand.navigation.style.inactiveButton,
    borderRadius: brand.navigation.style.borderRadius,
    buttonSize: brand.navigation.style.buttonSize,
    themeMode: 'default'
  });

  const [buttonLabels, setButtonLabels] = useState({
    home: brand.navigation.labels.home,
    shop: brand.navigation.labels.shop,
    search: brand.navigation.labels.search,
    cart: brand.navigation.labels.cart,
    myOrders: brand.navigation.labels.myOrders,
    login: brand.navigation.labels.login,
    signOut: brand.navigation.labels.signOut,
    admin: brand.navigation.labels.admin
  });

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const navEl = navRef.current;
      if (!navEl) return;
      const navBottom = navEl.offsetTop + navEl.offsetHeight;
      const scrolledPastNav = currentY > navBottom;
      const scrollingDown = currentY > lastScrollY.current;

      if (scrolledPastNav && scrollingDown) {
        setShowFloatingBar(true);
      } else if (!scrolledPastNav || !scrollingDown) {
        setShowFloatingBar(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!publishedData) return;
    if (!publishedData.navigation_settings) return;

    try {
      const style = publishedData.navigation_settings;
      setNavStyle({
        background: style.background || '#F0F5F0',
        text: style.text || '#3D4A3D',
        activeTab: style.activeTab || '#2D4A3A',
        inactiveButton: style.inactiveButton || '#F0F5F0',
        borderRadius: style.borderRadius || 'full',
        buttonSize: style.buttonSize || 'md',
        themeMode: style.themeMode || 'default'
      });

      if (style.buttonLabels) {
        setButtonLabels({
          home: style.buttonLabels.home || 'Home',
          shop: style.buttonLabels.shop || 'Shop All',
          search: style.buttonLabels.search || 'Search',
          cart: style.buttonLabels.cart || 'Cart',
          myOrders: style.buttonLabels.myOrders || 'Orders',
          login: style.buttonLabels.login || 'Login',
          signOut: style.buttonLabels.signOut || 'Sign Out',
          admin: style.buttonLabels.admin || 'Admin'
        });
      }
    } catch (error) {
      console.error('[NAVIGATION] Error loading navigation style:', error);
    }
  }, [publishedData]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const isAdminUser = publishedData?.admins?.[user.uid] || publishedData?.super_admins?.[user.uid];
      setIsAdmin(!!isAdminUser);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  }, [user, publishedData]);

  useEffect(() => {
    if (publishedData?.products) {
      try {
        const productsData: Product[] = objectToArray<Product>(publishedData.products);
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    }
  }, [publishedData]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  useEffect(() => {
    if (floatingSearchQuery.trim() === '') {
      setFloatingResults([]);
      return;
    }
    const query = floatingSearchQuery.toLowerCase();
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
    setFloatingResults(filtered);
  }, [floatingSearchQuery, products]);

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => searchInputRef.current?.focus(), 300);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  useEffect(() => {
    if (hideFloatingBar) {
      setFloatingSearchFocused(false);
      setFloatingSearchQuery('');
      setFloatingResults([]);
    }
  }, [hideFloatingBar]);

  const handleSearchClose = useCallback(() => {
    setSearchOpen(false);
    setSearchFullscreen(false);
    setSearchQuery('');
    setFilteredProducts([]);
  }, []);

  const handleSheetTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleSheetTouchMove = useCallback((e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
  }, []);

  const handleSheetTouchEnd = useCallback(() => {
    const diff = touchStartY.current - touchCurrentY.current;
    if (diff > 60 && !searchFullscreen) {
      setSearchFullscreen(true);
    } else if (diff < -60 && searchFullscreen) {
      setSearchFullscreen(false);
    }
  }, [searchFullscreen]);

  return (
    <nav ref={navRef} className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-2.5 sm:py-3 gap-1.5">
          {/* Top row - 3 chips */}
          <div className="flex items-center gap-1.5 sm:gap-2 justify-center">
            <NavPill
              active={currentPage === 'home'}
              onClick={() => onNavigate('home')}
              icon={<HomeIcon className="w-3.5 h-3.5" />}
              label={buttonLabels.home}
              navStyle={navStyle}
            />
            <NavPill
              active={currentPage === 'shop'}
              onClick={() => onNavigate('shop')}
              icon={<Store className="w-3.5 h-3.5" />}
              label={buttonLabels.shop}
              navStyle={navStyle}
            />
            <NavPill
              active={false}
              onClick={() => setSearchOpen(true)}
              icon={<Search className="w-3.5 h-3.5" />}
              label={buttonLabels.search}
              navStyle={navStyle}
            />
          </div>

          {/* Bottom row - 2 chips */}
          <div className="flex items-center gap-1.5 sm:gap-2 justify-center">
            <NavPill
              active={false}
              onClick={onCartClick}
              icon={<ShoppingBag className="w-3.5 h-3.5" />}
              label={buttonLabels.cart}
              navStyle={navStyle}
              badge={itemCount > 0 ? itemCount : undefined}
            />

            {user ? (
              <div className="relative">
                <NavPill
                  active={false}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  icon={
                    user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )
                  }
                  label={user.displayName?.split(' ')[0] || 'Account'}
                  navStyle={navStyle}
                />
                {userMenuOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setUserMenuOpen(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-[280px] overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                      {/* User info header */}
                      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-brand" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.displayName || 'User'}</p>
                            <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-2">
                        <button
                          onClick={() => { onCartClick(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-gray-500" />
                          <span>My Cart</span>
                          {itemCount > 0 && (
                            <span className="ml-auto bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{itemCount}</span>
                          )}
                        </button>
                        <button
                          onClick={() => { onOrdersClick(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-500" />
                          <span>My Orders</span>
                        </button>
                        <button
                          onClick={() => { onWishlistClick?.(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-gray-500" />
                          <span>Wishlist</span>
                        </button>
                        <button
                          onClick={() => { onAddressClick?.(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>Addresses</span>
                        </button>
                        {(isAdmin || isDevelopment) && (
                          <button
                            onClick={() => { onNavigate('admin'); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-gray-500" />
                            <span>Admin Panel</span>
                          </button>
                        )}
                      </div>

                      {/* Sign out */}
                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={() => { setUserMenuOpen(false); setShowSignOutConfirm(true); }}
                          className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sign Out Confirmation */}
                {showSignOutConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSignOutConfirm(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-[300px] overflow-hidden shadow-2xl p-6 text-center animate-[scaleIn_0.2s_ease-out]">
                      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">Sign Out?</h3>
                      <p className="text-sm text-gray-500 mb-5">Are you sure you want to sign out of your account?</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowSignOutConfirm(false)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => { signOut(); setShowSignOutConfirm(false); }}
                          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
                        >
                          Yes, Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <NavPill
                active={false}
                onClick={onLoginClick}
                icon={<User className="w-3.5 h-3.5" />}
                label={buttonLabels.login}
                navStyle={navStyle}
              />
            )}
          </div>
        </div>
      </div>

      {/* Full screen blur overlay - only when there's search text */}
      {showFloatingBar && !hideFloatingBar && floatingSearchFocused && floatingSearchQuery.trim() !== '' && (
        <div
          className="fixed inset-0 z-[39] opacity-100 pointer-events-auto"
          onClick={() => {
            setFloatingSearchFocused(false);
            setFloatingSearchQuery('');
            setFloatingResults([]);
            floatingInputRef.current?.blur();
          }}
          style={{
            background: 'radial-gradient(circle at top center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.4) 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        />
      )}

      {/* Floating Search + Cart bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          showFloatingBar && !hideFloatingBar
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-3 pt-3 pb-2.5">
          <div className="max-w-md mx-auto flex items-center gap-2.5">
            <div className="relative flex-1">
              <div className={`flex items-center gap-2.5 px-4 py-3 rounded-full bg-white border-2 transition-all duration-200 ${
                floatingSearchFocused
                  ? 'border-[#2D4A3A] shadow-lg shadow-[#2D4A3A]/15'
                  : 'border-[#3D4A3D]/20 shadow-md shadow-black/5'
              }`}>
                <Search className="w-4.5 h-4.5 text-[#2D4A3A] flex-shrink-0" />
                <input
                  ref={floatingInputRef}
                  type="text"
                  value={floatingSearchQuery}
                  onChange={(e) => setFloatingSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                  onFocus={() => setFloatingSearchFocused(true)}
                  onBlur={() => setTimeout(() => setFloatingSearchFocused(false), 150)}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-sm font-medium text-[#3D4A3D] placeholder-[#7A8F7A] outline-none"
                />
                {floatingSearchQuery && (
                  <button
                    onMouseDown={(e) => { e.preventDefault(); setFloatingSearchQuery(''); setFloatingResults([]); }}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-[#E4EDE4] hover:bg-[#C8D4C8] transition-colors"
                  >
                    <X className="w-3 h-3 text-[#3D4A3D]" />
                  </button>
                )}
              </div>
              {/* Floating search results */}
              <div className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-[#E4EDE4] shadow-2xl max-h-80 overflow-y-auto z-50 transition-all duration-250 ease-out origin-top ${
                floatingSearchFocused && floatingSearchQuery.trim() !== ''
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}>
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-4 py-2.5 border-b border-[#E4EDE4] rounded-t-2xl">
                  <p className="text-xs font-medium text-[#5C6B5C]">
                    Found <span className="text-[#2D4A3A] font-semibold">{floatingResults.length}</span> of {products.length} products
                  </p>
                </div>
                {floatingResults.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Search className="w-8 h-8 text-[#C8D4C8] mx-auto mb-2" />
                    <p className="text-sm text-[#7A8F7A]">No matching products</p>
                  </div>
                ) : (
                  <div className="py-1">
                    {floatingResults.slice(0, 6).map((product) => (
                      <button
                        key={product.id}
                        onMouseDown={() => {
                          if (onProductClick) {
                            onProductClick(product);
                            setFloatingSearchQuery('');
                            setFloatingResults([]);
                            setFloatingSearchFocused(false);
                          }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F9F5] transition-colors text-left active:scale-[0.98]"
                      >
                        <img
                          src={product.image_url || '/placeholder.svg'}
                          alt={product.name}
                          className="w-11 h-11 object-cover rounded-xl border border-[#E4EDE4]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#2D2D2D] truncate">{product.name}</p>
                          <p className="text-xs text-[#6B7B6B] mt-0.5">{'\u20B9'}{product.price.toFixed(2)}</p>
                        </div>
                        {product.in_stock && (
                          <button
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#2D4A3A] text-white hover:bg-[#1e3428] transition-colors"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Cart button */}
            <button
              onClick={onCartClick}
              className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#2D4A3A] text-white hover:bg-[#1e3428] transition-colors shadow-md border-2 border-[#3D4A3D]/30 flex-shrink-0"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C4532A] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bottom Sheet (opens on chip click) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md animate-[fadeIn_250ms_ease-out]"
            onClick={handleSearchClose}
          />

          {/* Sheet */}
          <div
            ref={searchSheetRef}
            onTouchStart={handleSheetTouchStart}
            onTouchMove={handleSheetTouchMove}
            onTouchEnd={handleSheetTouchEnd}
            className={`absolute left-0 right-0 bg-white flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              searchFullscreen
                ? 'top-0 bottom-0 rounded-none'
                : 'bottom-0 top-[15%] rounded-t-[28px]'
            }`}
            style={{ animation: 'sheetSlideUp 300ms cubic-bezier(0.32, 0.72, 0, 1)' }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#C8D4C8]" />
            </div>

            {/* Header */}
            <div className="px-4 pb-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#2D4A3A]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                    placeholder="Search products..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F0F5F0] border border-[#C8D4C8] text-[#2D2D2D] text-sm placeholder-[#7A8F7A] outline-none focus:border-[#2D4A3A] focus:ring-2 focus:ring-[#2D4A3A]/10 transition-all"
                  />
                </div>
                <button
                  onClick={handleSearchClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F0F5F0] border border-[#C8D4C8] hover:bg-[#E4EDE4] transition-colors"
                >
                  <X className="w-4.5 h-4.5 text-[#3D4A3D]" />
                </button>
              </div>

              {/* Results count + expand hint */}
              <div className="flex items-center justify-between mt-3">
                {searchQuery ? (
                  <p className="text-xs font-medium text-[#5C6B5C]">
                    Found <span className="text-[#2D4A3A] font-semibold">{filteredProducts.length}</span> of {products.length} products
                  </p>
                ) : (
                  <p className="text-xs text-[#7A8F7A]">Search through our collection</p>
                )}
                {!searchFullscreen && (
                  <button
                    onClick={() => setSearchFullscreen(true)}
                    className="flex items-center gap-1 text-[10px] font-medium text-[#2D4A3A] bg-[#E8F5E8] px-2 py-1 rounded-full"
                  >
                    <ChevronUp className="w-3 h-3" />
                    <span>Expand</span>
                  </button>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#E4EDE4]" />

            {/* Results - scroll expands to fullscreen */}
            <div
              className="flex-1 overflow-y-auto px-4 py-3"
              onScroll={(e) => {
                if (!searchFullscreen && (e.target as HTMLElement).scrollTop > 30) {
                  setSearchFullscreen(true);
                }
              }}
            >
              {searchQuery === '' ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-[#E8F5E8] flex items-center justify-center mx-auto mb-4">
                    <Search className="w-7 h-7 text-[#2D4A3A]" />
                  </div>
                  <p className="text-[#2D2D2D] text-base font-semibold mb-1">Start typing to search</p>
                  <p className="text-[#7A8F7A] text-sm">Find products from our collection</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto mb-4">
                    <Search className="w-7 h-7 text-[#9B4D4D]" />
                  </div>
                  <p className="text-[#2D2D2D] text-base font-semibold mb-1">No products found</p>
                  <p className="text-[#7A8F7A] text-sm">Try different keywords</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product) => {
                    const qty = getItemQuantity(product.id);
                    const cartItemId = getCartItemId(product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => {
                          if (onProductClick) {
                            onProductClick(product);
                            handleSearchClose();
                          }
                        }}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAFCFA] border border-[#E4EDE4] hover:border-[#7BAF7B] hover:bg-[#F0F5F0] transition-all cursor-pointer group active:scale-[0.98]"
                      >
                        <img
                          src={product.image_url || '/placeholder.svg'}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-xl border border-[#E4EDE4] group-hover:border-[#7BAF7B] transition-colors"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-[#2D2D2D] truncate group-hover:text-[#2D4A3A] transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-xs text-[#7A8F7A] line-clamp-1 mt-0.5">{product.description}</p>
                          <p className="text-sm font-bold text-[#2D4A3A] mt-1">{'\u20B9'}{product.price.toFixed(2)}</p>
                        </div>
                        {product.in_stock ? (
                          qty > 0 ? (
                            <div
                              className="flex items-center gap-1 bg-[#2D4A3A] rounded-full px-1 py-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (cartItemId) updateQuantity(cartItemId, qty - 1);
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-white min-w-[18px] text-center">{qty}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(product);
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product);
                              }}
                              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-[#2D4A3A] text-white hover:bg-[#1e3428] transition-colors shadow-sm"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )
                        ) : (
                          <span className="text-[10px] font-medium text-[#9B4D4D] bg-[#FEF2F2] px-2 py-1 rounded-full">Sold</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

interface NavPillProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  navStyle: {
    activeTab: string;
    inactiveButton: string;
    text: string;
  };
  badge?: number;
}

function NavPill({ active, onClick, icon, label, navStyle, badge }: NavPillProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-2.5 rounded-full
        text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300
        ${active
          ? 'shadow-sm'
          : 'hover:shadow-sm'
        }
      `}
      style={{
        backgroundColor: active ? '#2D4A3A' : '#FFFFFF',
        color: active ? '#FFFFFF' : '#3D4A3D',
        border: active ? '1.5px solid #7BAF7B' : '1.5px solid #7BAF7B',
      }}
    >
      <span
        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: active ? 'rgba(123, 175, 123, 0.25)' : '#F0F5F0',
          border: active ? '1px solid #7BAF7B' : '1px solid #C8D4C8',
          color: active ? '#FFFFFF' : '#2D4A3A',
        }}
      >
        {icon}
      </span>
      <span className="whitespace-nowrap">{label}</span>

      {badge !== undefined && (
        <span
          className="absolute -top-1.5 -right-1.5 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white shadow-sm"
          style={{ backgroundColor: '#C4532A' }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
