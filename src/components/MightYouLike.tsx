import { Heart, Plus, Minus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { usePublishedData } from '../contexts/PublishedDataContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import type { Product } from '../types';
import LazyImage from './LazyImage';
import Confetti from './Confetti';
import { playAddToCartSound } from '../utils/sounds';
import { objectToArray } from '../utils/publishedData';

interface MightYouLikeProps {
  onProductClick: (product: Product) => void;
  onCartClick: () => void;
}

export default function MightYouLike({ onProductClick, onCartClick }: MightYouLikeProps) {
  const { data: publishedData } = usePublishedData();
  const [products, setProducts] = useState<Product[]>([]);
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiOrigin, setConfettiOrigin] = useState({ x: 50, y: 50 });
  const { addToCart, isInCart, getItemQuantity, getCartItemId, updateQuantity } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleAddToCart = useCallback((product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    setConfettiOrigin({ x, y });
    setConfettiActive(true);
    playAddToCartSound();
    addToCart(product);
  }, [addToCart]);

  useEffect(() => {
    if (!publishedData?.products) return;
    const productsArray: Product[] = objectToArray<Product>(publishedData.products);
    const mightYouLikeProducts = productsArray.filter(p => p.might_you_like).slice(0, 8);
    setProducts(mightYouLikeProducts);
  }, [publishedData]);

  if (products.length === 0) return null;

  const hasOptions = (product: Product) =>
    !!(product.sizes && product.sizes.length > 0) || !!(product.colors && product.colors.length > 0);

  return (
    <div className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="mb-5">
          <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Might You Like</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-4 xl:gap-4">
          {products.map((product, index) => {
            const inCart = isInCart(product.id);
            const qty = getItemQuantity(product.id);
            const cartItemId = getCartItemId(product.id);
            const discount = product.compare_at_price && product.compare_at_price > product.price
              ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
              : 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden cursor-pointer opacity-0 animate-[fadeSlideUp_0.4s_ease-out_forwards] shadow-sm"
                style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
                onClick={() => onProductClick(product)}
              >
                {/* Image */}
                <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                  <LazyImage
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {discount > 0 && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded">
                      -{discount}%
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }}
                    className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 flex items-center justify-center"
                  >
                    <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </button>

                  {/* Out of stock */}
                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <span className="bg-gray-900 text-white px-3 py-1 rounded text-[10px] sm:text-xs font-medium">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5 sm:p-3">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2 mb-1">
                    {product.name}
                  </h3>

                  <div className="flex items-baseline gap-1.5 mb-2.5">
                    <span className="text-sm sm:text-base font-semibold text-gray-900">{'\u20B9'}{product.price}</span>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <span className="text-[10px] sm:text-xs text-gray-400 line-through">{'\u20B9'}{product.compare_at_price}</span>
                    )}
                  </div>

                  {/* Cart controls */}
                  {hasOptions(product) ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onProductClick(product); }}
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
                        onClick={(e) => handleAddToCart(product, e)}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-900 font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="w-full flex items-center justify-center gap-1.5 bg-green-100 text-gray-900 rounded-md h-8 sm:h-9 text-xs sm:text-sm font-bold active:scale-[0.98] transition-transform border border-green-300"
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
      </div>

      <Confetti
        isActive={confettiActive}
        originX={confettiOrigin.x}
        originY={confettiOrigin.y}
        onComplete={() => setConfettiActive(false)}
      />
    </div>
  );
}
