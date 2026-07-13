import { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import type { Category } from '../types';

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  showInStock: boolean;
  showOnSale: boolean;
  onInStockChange: (checked: boolean) => void;
  onOnSaleChange: (checked: boolean) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export default function FilterBottomSheet({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onCategorySelect,
  showInStock,
  showOnSale,
  onInStockChange,
  onOnSaleChange,
  sortBy,
  onSortChange
}: FilterBottomSheetProps) {
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'New Arrivals' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-az', label: 'Name: A-Z' },
    { value: 'name-za', label: 'Name: Z-A' },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div
        className={`absolute left-0 right-0 bg-white flex flex-col overflow-hidden rounded-t-3xl transition-[top,border-radius] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          sheetExpanded ? 'top-0 !rounded-t-none' : 'top-[8%]'
        }`}
        style={{ bottom: 0 }}
      >
        {/* Drag handle */}
        {!sheetExpanded && (
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Filter & Sort</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 pb-6">
          <div className="px-5 py-4 space-y-6">
            {/* Sort */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">Sort by</h3>
              <div className="space-y-0.5">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onSortChange(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      sortBy === opt.value ? 'bg-green-50 text-green-800 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                    {sortBy === opt.value && <Check className="w-4 h-4 text-green-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { onCategorySelect(null); onClose(); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    selectedCategory === null
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => { onCategorySelect(category.id); onClose(); }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">Availability</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${showInStock ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                    {showInStock && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <input type="checkbox" checked={showInStock} onChange={(e) => onInStockChange(e.target.checked)} className="sr-only" />
                  <span className="text-sm text-gray-700">In Stock Only</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${showOnSale ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                    {showOnSale && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <input type="checkbox" checked={showOnSale} onChange={(e) => onOnSaleChange(e.target.checked)} className="sr-only" />
                  <span className="text-sm text-gray-700">On Sale Only</span>
                </label>
              </div>
            </div>

            {/* Apply button */}
            <button
              onClick={onClose}
              className="w-full bg-green-100 text-gray-900 py-3.5 rounded-xl font-bold text-sm hover:bg-green-200 transition-colors active:scale-[0.98] border border-green-300"
            >
              Show Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
