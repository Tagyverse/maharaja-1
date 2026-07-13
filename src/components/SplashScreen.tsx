import { useEffect, useState } from 'react';
import { brand } from '../config/brand';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!brand.features.splash_screen) {
      setIsVisible(false);
      onComplete();
      return;
    }

    const timer1 = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    const timer2 = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: `linear-gradient(135deg, ${brand.splash.gradientFrom}, ${brand.splash.gradientVia}, ${brand.splash.gradientTo})`,
      }}
    >
      <div className="text-center">
        <div className="relative mb-8 animate-float">
          <div className="w-32 h-32 mx-auto relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${brand.splash.glowFrom} ${brand.splash.glowTo} rounded-3xl animate-pulse-slow opacity-20 scale-110`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={brand.logo || brand.favicon}
                alt={brand.name}
                className="w-28 h-28 object-contain animate-fade-in rounded-2xl"
              />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2 animate-slide-up">
          {brand.splash.title}
        </h1>
        <p className="text-lg text-gray-600 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {brand.splash.subtitle}
        </p>

        <div className="flex justify-center gap-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {brand.splash.dotColors.map((color, i) => (
            <div key={i} className={`w-2 h-2 ${color} rounded-full animate-bounce`} style={{ animationDelay: `${i * 0.15}s` }}></div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1.1); }
          50% { opacity: 0.3; transform: scale(1.2); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; opacity: 0; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
