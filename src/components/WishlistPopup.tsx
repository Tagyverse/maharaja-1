import { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { usePublishedData } from '../contexts/PublishedDataContext';
import LazyImage from './LazyImage';
import type { Product } from '../types';

interface WishlistPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onProductClick?: (product: Product) => void;
}

export default function WishlistPopup({ isOpen, onClose, onProductClick }: WishlistPopupProps) {
  const { favorites, removeFromFavorites } = useFavorites();
  const { data: publishedData } = usePublishedData();
  const [animateIn, setAnimateIn] = useState(false);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => setAnimateIn(true));
    } else {
      setAnimateIn(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!publishedData?.products || !favorites.length) {
      setWishlistProducts([]);
      return;
    }
    const products = publishedData.products as Record<string, any>;
    const matched = favorites
      .map(id => {
        const p = products[id];
        return p ? { id, ...p } as Product : null;
      })
      .filter(Boolean) as Product[];
    setWishlistProducts(matched);
  }, [favorites, publishedData]);

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(onClose, 250);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-250 ${animateIn ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] flex flex-col transition-transform duration-300 ease-out ${
          animateIn ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
              <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">My Wishlist</h2>
              <p className="text-[11px] text-gray-400">
                {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 min-h-0">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-7 h-7 text-gray-200" />
              </div>
              <p className="text-sm text-gray-500 font-medium mb-1">Your wishlist is empty</p>
              <p className="text-xs text-gray-400">Browse products and tap the heart to save</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group"
                >
                  <button
                    onClick={() => removeFromFavorites(product.id)}
                    className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                  <div
                    className="cursor-pointer"
                    onClick={() => { onProductClick?.(product); handleClose(); }}
                  >
                    <div className="aspect-square overflow-hidden">
                      <LazyImage
                        src={product.image_url || product.images?.[0] || ''}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-gray-800 truncate">{product.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-sm font-bold text-gray-900">
                          {'\u20B9'}{product.selling_price || product.price}
                        </span>
                        {product.selling_price && product.price && product.selling_price < product.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {'\u20B9'}{product.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {wishlistProducts.length > 0 && (
          <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100">
            <button
              onClick={handleClose}
              className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" /> Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
