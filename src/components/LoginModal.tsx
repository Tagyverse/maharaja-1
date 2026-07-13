import { useState, useRef, useEffect } from 'react';
import { X, ChevronRight, Play, ChevronLeft, Shield, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import { brand } from '../config/brand';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const touchStartX = useRef(0);

  const [ytVideoUrl, setYtVideoUrl] = useState('');

  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        const settingsRef = ref(db, 'site_settings');
        const snapshot = await get(settingsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const firstKey = Object.keys(data)[0];
          if (data[firstKey]?.how_to_order_video_url) {
            setYtVideoUrl(data[firstKey].how_to_order_video_url);
          }
        }
      } catch (e) {
        console.warn('Could not fetch video URL');
      }
    };
    fetchVideoUrl();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAnimateOut(false);
      requestAnimationFrame(() => setAnimateIn(true));
      document.body.style.overflow = 'hidden';
    } else {
      setAnimateIn(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleClose = () => {
    setAnimateOut(true);
    setAnimateIn(false);
    setTimeout(() => {
      setAnimateOut(false);
      onClose();
    }, 280);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      handleClose();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff < -60 && currentPage === 0) setCurrentPage(1);
    if (diff > 60 && currentPage === 1) setCurrentPage(0);
  };

  const getEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : '';
  };

  if (!isOpen && !animateOut) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-[3px] transition-opacity duration-300 ${
          animateIn && !animateOut ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Dialog */}
      <div
        className={`relative w-full max-w-[360px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          animateIn && !animateOut
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        <div
          className="relative bg-white rounded-2xl overflow-hidden border border-gray-200"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors z-10"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {/* Pages container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentPage * 100}%)` }}
            >
              {/* Page 1: Login */}
              <div className="w-full flex-shrink-0 p-6 pt-8">
                <div className="flex flex-col items-center mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden mb-3">
                    <img
                      src={brand.logo || '/favicon.png'}
                      alt={brand.name}
                      className="w-12 h-12 object-contain"
                    />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 tracking-tight">{brand.name}</h2>
                  <p className="text-xs text-gray-500">Sign in to continue</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 mb-4">
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                {/* Google sign in button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                {/* How to order link */}
                <button
                  onClick={() => setCurrentPage(1)}
                  className="w-full mt-3 py-2.5 rounded-lg font-medium text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 border border-gray-100"
                >
                  <Play className="w-3 h-3" />
                  <span>How to order</span>
                  <ChevronRight className="w-3 h-3" />
                </button>

                <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed">
                  By continuing, you agree to our{' '}
                  <button onClick={() => setShowTerms(true)} className="text-gray-500 font-medium hover:text-gray-700 underline underline-offset-2">Terms</button>
                  {' '}&{' '}
                  <button onClick={() => setShowPrivacy(true)} className="text-gray-500 font-medium hover:text-gray-700 underline underline-offset-2">Privacy</button>
                </p>
                <p className="text-center text-[9px] text-gray-300 mt-3">
                  powered by <a href="https://tagyverse.com" target="_blank" rel="noopener noreferrer" className="font-medium text-gray-400 hover:text-gray-600 transition-colors">tagyverse</a>
                </p>
              </div>

              {/* Page 2: How to Order Video */}
              <div className="w-full flex-shrink-0 p-6 pt-8">
                <button
                  onClick={() => setCurrentPage(0)}
                  className="inline-flex items-center gap-1 text-gray-500 text-xs font-medium mb-4 hover:text-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>

                <h2 className="text-base font-bold text-gray-900 mb-1">How to Order</h2>
                <p className="text-xs text-gray-500 mb-4">Watch this quick guide</p>

                {ytVideoUrl ? (
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-200">
                    <iframe
                      src={getEmbedUrl(ytVideoUrl)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-lg border border-gray-200 flex flex-col items-center justify-center bg-gray-50">
                    <Play className="w-6 h-6 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-xs font-medium">Video coming soon</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page dots */}
          <div className="flex items-center justify-center gap-1.5 pb-4">
            <button
              onClick={() => setCurrentPage(0)}
              className={`rounded-full transition-all duration-300 ${currentPage === 0 ? 'w-4 h-1.5 bg-gray-900' : 'w-1.5 h-1.5 bg-gray-300'}`}
            />
            <button
              onClick={() => setCurrentPage(1)}
              className={`rounded-full transition-all duration-300 ${currentPage === 1 ? 'w-4 h-1.5 bg-gray-900' : 'w-1.5 h-1.5 bg-gray-300'}`}
            />
          </div>
        </div>
      </div>

      {/* GDPR-style Terms Dialog */}
      {showTerms && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" onClick={() => setShowTerms(false)} />
          <div className="relative w-full max-w-md animate-[fadeScaleIn_0.25s_ease-out]">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm">Terms & Conditions</h3>
                  <p className="text-gray-400 text-[11px]">Last updated June 2025</p>
                </div>
                <button onClick={() => setShowTerms(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="px-6 py-5 max-h-[50vh] overflow-y-auto">
                <p className="text-gray-600 text-[13px] leading-relaxed whitespace-pre-line">
                  {brand.policies.terms}
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setShowTerms(false)}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  I understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GDPR-style Privacy Dialog */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px]" onClick={() => setShowPrivacy(false)} />
          <div className="relative w-full max-w-md animate-[fadeScaleIn_0.25s_ease-out]">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
              <div className="bg-brand-dark px-6 py-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm">Privacy Policy</h3>
                  <p className="text-white/70 text-[11px]">Your data, your control</p>
                </div>
                <button onClick={() => setShowPrivacy(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="px-6 py-5 max-h-[50vh] overflow-y-auto">
                <p className="text-gray-600 text-[13px] leading-relaxed whitespace-pre-line">
                  {brand.policies.privacy}
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-[11px] text-gray-400">We never sell your data</p>
                </div>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
