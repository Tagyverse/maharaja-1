'use client';

import { useState, useEffect, Component, ReactNode, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { PublishedDataProvider, usePublishedData } from './contexts/PublishedDataContext';
import { ClientConfigProvider } from './contexts/ClientConfigContext';
import { FeaturesProvider } from './contexts/FeaturesContext';
import TopBanner from './components/TopBanner';
import Navigation from './components/Navigation';
import LoginModal from './components/LoginModal';
import CartModal from './components/CartModal';
import MyOrdersSheet from './components/MyOrdersSheet';
import PurchaseNotification from './components/PurchaseNotification';
import OfferDialog from './components/OfferDialog';
import WelcomeCouponDialog from './components/WelcomeCouponDialog';
import ProductDetailsSheet from './components/ProductDetailsSheet';
import PolicySheet from './components/PolicySheet';
import SplashScreen from './components/SplashScreen';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import AddressManager from './components/AddressManager';
import WishlistPopup from './components/WishlistPopup';
import { brand } from './config/brand';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ComingSoon from './pages/ComingSoon';
import { useFeatureFlags } from './hooks/useFeatureFlags';
// Lazy load heavy pages for better initial load performance
const Checkout = lazy(() => import('./pages/Checkout'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));
import type { Product } from './types';
import { db } from './lib/firebase';
import { ref, get } from 'firebase/database';
import { initAnalytics, trackPageView } from './utils/analytics';
import { initPerformanceMonitoring } from './utils/performanceMonitoring';
import { initFetchInterceptor } from './utils/fetchInterceptor';
import { enableSmoothScrollCSS } from './utils/smoothScroll';
import { AppInitializer } from './components/AppInitializer';

type Page = 'home' | 'shop' | 'checkout' | 'privacy-policy' | 'shipping-policy' | 'refund-policy' | 'contact' | 'admin' | 'change-business';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 border-2 border-red-200 text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-100 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-green-200 transition-colors border border-green-300"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function getInitialPage(): Page {
  const path = window.location.pathname;
  if (path === '/shop') return 'shop';
  if (path === '/checkout') return 'checkout';
  if (path === '/privacy-policy') return 'privacy-policy';
  if (path === '/shipping-policy') return 'shipping-policy';
  if (path === '/refund-policy') return 'refund-policy';
  if (path === '/contact') return 'contact';
  if (path === '/admin' || path === '/admin/') return 'admin';
  if (path === '/changebusiness' || path === '/changebusiness/') return 'change-business';
  return 'home';
}

function AppContent() {
  // Initialize client config and theme from R2 on app startup
  return (
    <>
      <AppInitializer />
      <AppContentInner />
    </>
  );
}

function AppContentInner() {
  const { data: publishedData, loading: publishedDataLoading, error: publishedDataError } = usePublishedData();
  const flags = useFeatureFlags();
  const [currentPage, setCurrentPage] = useState<Page>(getInitialPage());
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [ordersSheetOpen, setOrdersSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [policySheet, setPolicySheet] = useState<'privacy-policy' | 'shipping-policy' | 'refund-policy' | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [splashMinDone, setSplashMinDone] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [temporarilyClosed, setTemporarilyClosed] = useState(false);
  const [addressManagerOpen, setAddressManagerOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const { user } = useAuth();
  const [prevUser, setPrevUser] = useState<any>(null);

  // Splash stays until BOTH min time passed AND data finished loading
  useEffect(() => {
    if (splashMinDone && !publishedDataLoading) {
      setShowSplash(false);
      setAppReady(true);
    }
  }, [splashMinDone, publishedDataLoading]);

  useEffect(() => {
    setPrevUser(user);
  }, [user]);

  const hideNavigation = currentPage === 'checkout' || currentPage === 'contact' || currentPage === 'admin' || currentPage === 'change-business';
  const isAdminPage = currentPage === 'admin' || currentPage === 'change-business';

  useEffect(() => {
    // Enable smooth scrolling
    enableSmoothScrollCSS();
    // Initialize fetch interceptor to suppress validation warnings
    initFetchInterceptor();
    // Initialize analytics tracking
    initAnalytics();
    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Load bill settings from Firebase and cache in localStorage
    const loadBillSettings = async () => {
      try {
        const billSettingsRef = ref(db, 'bill_settings');
        const snapshot = await get(billSettingsRef);
        if (snapshot.exists()) {
          localStorage.setItem('billSettings', JSON.stringify(snapshot.val()));
        }
      } catch (error) {
        console.error('Error loading bill settings:', error);
      }
    };

    const checkStoreStatus = async () => {
      try {
        const settingsRef = ref(db, 'site_settings');
        const snapshot = await get(settingsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const settingsId = Object.keys(data)[0];
          const settings = data[settingsId];
          setTemporarilyClosed(settings.temporarily_closed || false);
        }
      } catch (error) {
        console.error('Error checking store status:', error);
      }
    };

    checkStoreStatus();
    loadBillSettings();
    const interval = setInterval(checkStoreStatus, 30000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleNavigate = (page: Page, categoryId?: string) => {
    if (page === 'privacy-policy' || page === 'shipping-policy' || page === 'refund-policy') {
      setPolicySheet(page);
      return;
    }
    setCurrentPage(page);
    setCartModalOpen(false);
    let path = page === 'home' ? '/' : `/${page}`;
    if (categoryId && page === 'shop') {
      path += `?category=${categoryId}`;
    }
    window.history.pushState({}, "", path);
    trackPageView(path);

    if (categoryId && page === "shop") {
      setTimeout(() => {
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
    const currentPath = window.location.pathname;
    window.history.pushState({}, '', `${currentPath}?product=${product.id}`);
  };

  useEffect(() => {
    const loadProductFromUrl = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('product');

      if (productId) {
        try {
          const productsRef = ref(db, 'products');
          const snapshot = await get(productsRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            const product = data[productId];
            if (product) {
              setSelectedProduct({ id: productId, ...product });
              setShowProductDetails(true);
            } else {
              const currentPath = window.location.pathname;
              window.history.replaceState({}, '', currentPath);
            }
          }
        } catch (error) {
          console.error('Error loading product:', error);
          const currentPath = window.location.pathname;
          window.history.replaceState({}, '', currentPath);
        }
      } else {
        setShowProductDetails(false);
        setSelectedProduct(null);
      }
    };

    loadProductFromUrl();

    const handlePopState = () => {
      loadProductFromUrl();
      setCurrentPage(getInitialPage());
      window.scrollTo(0, 0);
    };

    window.addEventListener("popstate", handlePopState);

    // Track initial page view
    trackPageView(window.location.pathname + window.location.search);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const renderPage = () => {
    const LoadingFallback = () => (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-gray-200 border-t-brand rounded-full animate-spin"></div>
      </div>
    );

    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} onCartClick={() => setCartModalOpen(true)} onProductClick={handleProductClick} />;
      case 'shop':
        return <Shop onCartClick={() => setCartModalOpen(true)} onProductClick={handleProductClick} />;
      case 'checkout':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Checkout onBack={() => handleNavigate('shop')} onLoginClick={() => setLoginModalOpen(true)} />
          </Suspense>
        );
      case 'contact':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Contact onBack={() => handleNavigate('home')} />
          </Suspense>
        );
      case 'admin':
      case 'change-business':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Admin activeTab={currentPage === 'change-business' ? 'change-business' : undefined} />
          </Suspense>
        );
      default:
        return <Home onNavigate={handleNavigate} onCartClick={() => setCartModalOpen(true)} navigationSlot={navigationElement} />;
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => {
        setSplashMinDone(true);
      }} />}

      {/* Show Coming Soon if no published data and not on admin pages */}
      {appReady && publishedDataError && !isAdminPage && (
        <ComingSoon />
      )}

      {/* Show normal app if data exists or on admin pages */}
      {((!publishedDataError && appReady) || isAdminPage) && (
        <div className={`min-h-screen bg-white transition-opacity duration-500 ${appReady ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`${temporarilyClosed && !hideNavigation ? 'grayscale pointer-events-none' : ''}`}>
          {!hideNavigation && (
            <>
              {flags.top_banner && <TopBanner />}
              <Navigation
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onLoginClick={() => setLoginModalOpen(true)}
                onCartClick={() => setCartModalOpen(true)}
                onOrdersClick={() => setOrdersSheetOpen(true)}
                onAddressClick={() => setAddressManagerOpen(true)}
                onWishlistClick={() => setWishlistOpen(true)}
                onProductClick={handleProductClick}
                hideFloatingBar={cartModalOpen || ordersSheetOpen || showProductDetails || loginModalOpen}
              />
            </>
          )}

          {renderPage()}

          {flags.purchase_notifications && <PurchaseNotification />}
          {flags.offer_popup && <OfferDialog />}
          {flags.welcome_coupon && <WelcomeCouponDialog />}

          <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
          <CartModal
            isOpen={cartModalOpen}
            onClose={() => setCartModalOpen(false)}
            onCheckout={() => handleNavigate('checkout')}
          />
          <MyOrdersSheet
            isOpen={ordersSheetOpen}
            onClose={() => setOrdersSheetOpen(false)}
            onLoginClick={() => {
              setOrdersSheetOpen(false);
              setLoginModalOpen(true);
            }}
          />
          <ProductDetailsSheet
            product={selectedProduct}
            isOpen={showProductDetails}
            onClose={() => {
              setShowProductDetails(false);
              setSelectedProduct(null);
              const urlParams = new URLSearchParams(window.location.search);
              if (urlParams.has('product')) {
                const currentPath = window.location.pathname;
                window.history.pushState({}, '', currentPath);
              }
            }}
          />
          <AddressManager
            isOpen={addressManagerOpen}
            onClose={() => setAddressManagerOpen(false)}
          />
          {flags.wishlist && (
            <WishlistPopup
              isOpen={wishlistOpen}
              onClose={() => setWishlistOpen(false)}
              onProductClick={handleProductClick}
            />
          )}

          <PolicySheet
            isOpen={policySheet === 'privacy-policy'}
            onClose={() => setPolicySheet(null)}
            title="Privacy Policy"
          >
            <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
              <p className="leading-relaxed whitespace-pre-line">
                {brand.policies.privacy}
              </p>
              <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">Last Updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </PolicySheet>

          <PolicySheet
            isOpen={policySheet === 'shipping-policy'}
            onClose={() => setPolicySheet(null)}
            title="Shipping Policy"
          >
            <div className="prose prose-sm max-w-none text-gray-700 space-y-5">
              <p className="leading-relaxed">{brand.policies.shipping.intro}</p>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Processing Time</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm"><li>All products are handmade and require time to prepare.</li><li>Orders are processed within 7 to 10 business days.</li><li>During peak seasons or sale days, processing may take a little longer.</li></ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Shipping Time</h3>
                <p className="text-sm">Once shipped, orders usually take <strong>3-7 business days</strong> within India.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Shipping Charges</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm"><li>Shipping charges are calculated at checkout based on your location and order weight.</li><li>Free shipping offers (if any) will be clearly mentioned on the website or product page.</li></ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Order Tracking</h3>
                <p className="text-sm">After dispatch, we will provide a tracking number via email/WhatsApp/SMS so you can follow your package.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Incorrect Address</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm"><li>Please ensure your address, phone number, and pin code are correct.</li><li>We are not responsible for delays or lost packages due to incorrect address details.</li></ul>
              </div>
              <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">Last Updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </PolicySheet>

          <PolicySheet
            isOpen={policySheet === 'refund-policy'}
            onClose={() => setPolicySheet(null)}
            title="Refund & Cancellation Policy"
          >
            <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
              <p className="leading-relaxed whitespace-pre-line">
                {brand.policies.refund}
              </p>
              <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">Last Updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </PolicySheet>

          {!hideNavigation && <Footer onNavigate={handleNavigate} />}
          {!hideNavigation && flags.scroll_to_top && <ScrollToTop onCartClick={() => setCartModalOpen(true)} />}
        </div>

        {temporarilyClosed && !hideNavigation && (
          <div className="fixed top-32 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-2xl p-6 border-4 border-white max-w-2xl w-full pointer-events-auto animate-pulse">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-3xl">🔒</span>
                  <h2 className="text-2xl font-bold text-white">Temporarily Closed</h2>
                </div>
                <p className="text-white text-base font-medium">
                  We're currently closed. Please check back later. Thank you for your patience.
                </p>
              </div>
            </div>
          </div>
        )}
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ClientConfigProvider>
        <AuthProvider>
          <PublishedDataProvider>
            <CartProvider>
              <FavoritesProvider>
                <FeaturesProvider>
                  <AppContent />
                </FeaturesProvider>
              </FavoritesProvider>
            </CartProvider>
          </PublishedDataProvider>
        </AuthProvider>
      </ClientConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
