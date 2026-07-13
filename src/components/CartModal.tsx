import { useState, useRef, useEffect } from 'react';
import { X, Plus, Minus, Trash2, CreditCard, ShoppingBag, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import LazyImage from './LazyImage';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartModal({ isOpen, onClose, onCheckout }: CartModalProps) {
  const { items, updateQuantity, removeFromCart, subtotal, shippingCharge, taxAmount, total, getItemPrice, taxSettings } = useCart();
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [minPurchaseCount, setMinPurchaseCount] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const freeDeliveryThreshold = (() => {
    try {
      const saved = localStorage.getItem('billSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        return settings.free_delivery_minimum_amount || 2000;
      }
    } catch (error) {
      console.warn('Could not load bill settings:', error);
    }
    return 2000;
  })();

  useEffect(() => {
    const fetchMinPurchase = async () => {
      try {
        const settingsRef = ref(db, 'site_settings');
        const snapshot = await get(settingsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const firstKey = Object.keys(data)[0];
          if (data[firstKey]?.min_purchase_count) {
            setMinPurchaseCount(Number(data[firstKey].min_purchase_count) || 1);
          }
        }
      } catch (e) {
        console.warn('Could not fetch min purchase count');
      }
    };
    fetchMinPurchase();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSheetExpanded(false);
    }
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

  if (!isOpen) return null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const canCheckout = totalItems >= minPurchaseCount;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-300"
        onClick={onClose}
      />

      <div
        className={`absolute left-0 right-0 bg-white flex flex-col overflow-hidden rounded-t-3xl transition-[top,border-radius] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } ${sheetExpanded ? 'top-0 !rounded-t-none' : 'top-[8%]'}`}
        style={{ bottom: 0 }}
      >
        {/* Drag handle */}
        {!sheetExpanded && (
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
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

        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-2 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
              <p className="text-xs text-gray-500">
                {items.length === 0 ? 'No items yet' : `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-4 min-h-0"
        >
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-xs mt-1">Add products to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const unitPrice = getItemPrice(item);
                return (
                  <div key={item.cart_item_id} className="flex gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <LazyImage
                      src={item.image_url}
                      alt={item.name}
                      className="w-[72px] h-[72px] object-cover rounded-xl flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col">
                      <h3 className="font-semibold text-gray-900 text-sm truncate leading-tight">{item.name}</h3>

                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {item.selectedSize && (
                          <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-semibold">
                            {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded font-semibold">
                            {item.selectedColor}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-1.5">
                        <div>
                          <span className="text-sm font-bold text-gray-900">
                            {'\u20B9'}{(unitPrice * item.quantity).toFixed(0)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-gray-400 ml-1">
                              ({'\u20B9'}{unitPrice} x {item.quantity})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.cart_item_id!, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-900 border-x border-gray-200">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.cart_item_id!, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.cart_item_id!)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="flex-shrink-0 bg-white px-5 py-4 border-t border-gray-100">
            {subtotal < freeDeliveryThreshold && (
              <div className="mb-3 p-2.5 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs font-medium text-green-700 mb-1.5">
                  Add {'\u20B9'}{(freeDeliveryThreshold - subtotal).toFixed(0)} more for FREE shipping
                </p>
                <div className="w-full bg-green-100 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((subtotal / freeDeliveryThreshold) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
            {subtotal >= freeDeliveryThreshold && (
              <div className="mb-3 p-2.5 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs font-medium text-green-700 text-center">
                  You've unlocked FREE shipping!
                </p>
              </div>
            )}

            <div className="space-y-1.5 mb-3">
              <div className="flex items-center justify-between text-gray-600">
                <span className="text-sm">Subtotal</span>
                <span className="text-sm font-medium">{'\u20B9'}{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span className="text-sm">Shipping</span>
                <span className="text-sm font-medium">
                  {shippingCharge === 0 && subtotal >= freeDeliveryThreshold ? (
                    <span className="text-green-600">FREE</span>
                  ) : `\u20B9${shippingCharge.toFixed(0)}`}
                </span>
              </div>
              {taxSettings?.is_enabled && !taxSettings?.include_in_price && taxAmount > 0 && (
                <div className="flex items-center justify-between text-gray-600">
                  <span className="text-sm">{taxSettings.tax_label} ({taxSettings.tax_percentage}%)</span>
                  <span className="text-sm font-medium">{'\u20B9'}{taxAmount.toFixed(0)}</span>
                </div>
              )}
              {taxSettings?.is_enabled && taxSettings?.include_in_price && items.length > 0 && (
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-xs">Incl. {taxSettings.tax_label} ({taxSettings.tax_percentage}%)</span>
                  <span className="text-xs">{'\u20B9'}{(subtotal - (subtotal / (1 + taxSettings.tax_percentage / 100))).toFixed(0)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">{'\u20B9'}{total.toFixed(0)}</span>
              </div>
            </div>

            {!canCheckout && (
              <div className="mb-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs font-medium text-amber-700 text-center">
                  Minimum {minPurchaseCount} {minPurchaseCount === 1 ? 'item' : 'items'} required to checkout. Add {minPurchaseCount - totalItems} more.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                if (!canCheckout) return;
                onCheckout();
                onClose();
              }}
              disabled={!canCheckout}
              className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-4 h-4" />
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
