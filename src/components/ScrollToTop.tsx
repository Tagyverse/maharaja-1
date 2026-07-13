import { useState, useEffect } from 'react';
import { ArrowUp, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface ScrollToTopProps {
  onCartClick?: () => void;
}

export default function ScrollToTop({ onCartClick }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);
  const { itemCount } = useCart();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[49] flex items-center gap-2">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Go to top"
        className="flex items-center justify-center bg-white border border-gray-200 rounded-xl w-9 h-9 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-95"
      >
        <ArrowUp className="w-4 h-4" />
      </button>

      {onCartClick && (
        <button
          onClick={onCartClick}
          aria-label="Open cart"
          className="relative flex items-center gap-1.5 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white hover:bg-gray-800 transition-all duration-200 active:scale-95"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span className="text-[10px] font-semibold">Cart</span>
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {itemCount > 99 ? '99' : itemCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
