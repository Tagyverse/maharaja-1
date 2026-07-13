import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface PolicySheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function PolicySheet({ isOpen, onClose, title, children }: PolicySheetProps) {
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSheetExpanded(false);
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      scrollRef.current?.scrollTo(0, 0);
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

  return (
    <div
      className={`fixed inset-0 z-50 transition-[visibility] duration-300 ${
        isOpen ? 'visible' : 'invisible delay-300'
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`absolute left-0 right-0 bg-white flex flex-col overflow-hidden rounded-t-3xl transition-[top,border-radius,transform] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } ${sheetExpanded ? 'top-0 !rounded-t-none' : 'top-[8%]'}`}
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
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}
