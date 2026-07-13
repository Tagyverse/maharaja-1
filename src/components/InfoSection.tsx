import { useRef, useState, useEffect } from 'react';

interface InfoSectionProps {
  title: string;
  content: string;
  theme: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'gradient';
}

const themeStyles = {
  default: { bg: 'bg-gray-50', border: 'border-gray-200', title: 'text-gray-900', text: 'text-gray-600' },
  primary: { bg: 'bg-brand-soft', border: 'border-brand-soft', title: 'text-gray-900', text: 'text-gray-700' },
  success: { bg: 'bg-green-50', border: 'border-green-100', title: 'text-green-900', text: 'text-green-700' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-100', title: 'text-amber-900', text: 'text-amber-700' },
  info: { bg: 'bg-blue-50', border: 'border-blue-100', title: 'text-blue-900', text: 'text-blue-700' },
  gradient: { bg: 'bg-brand-soft', border: 'border-brand-soft', title: 'text-gray-900', text: 'text-gray-700' },
};

export default function InfoSection({ title, content, theme }: InfoSectionProps) {
  const styles = themeStyles[theme];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const points = content.split('\n').filter(line => line.trim().length > 0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const cardWidth = el.offsetWidth * 0.78;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveIndex(Math.min(idx, points.length - 1));
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [points.length]);

  if (points.length <= 1) {
    return (
      <div className={`rounded-2xl border p-6 ${styles.bg} ${styles.border}`}>
        <h3 className={`text-lg font-semibold mb-2 ${styles.title}`}>{title}</h3>
        <p className={`text-sm leading-relaxed ${styles.text}`}>{content}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className={`text-lg font-semibold mb-3 px-1 ${styles.title}`}>{title}</h3>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {points.map((point, idx) => (
          <div
            key={idx}
            className={`snap-start flex-shrink-0 w-[78%] rounded-xl border p-5 ${styles.bg} ${styles.border}`}
          >
            <p className={`text-sm leading-relaxed ${styles.text}`}>{point.trim()}</p>
          </div>
        ))}
      </div>
      {points.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {points.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-5 bg-gray-800' : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
