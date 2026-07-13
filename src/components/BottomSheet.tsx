import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
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
        {!sheetExpanded && (
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 min-h-0">
          <div className="prose prose-sm prose-gray max-w-none text-gray-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
