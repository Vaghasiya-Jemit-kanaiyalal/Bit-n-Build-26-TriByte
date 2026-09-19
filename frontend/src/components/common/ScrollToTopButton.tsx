import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      if (scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    document.body.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    // Also scroll all main scrollable elements to top
    const scrollables = document.querySelectorAll('.overflow-y-auto, .overflow-auto');
    scrollables.forEach((el) => {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Scroll to top"
      className={`fixed bottom-6 right-6 z-[99990] p-3 rounded-full bg-[#064e3b] text-white hover:bg-[#047857] shadow-2xl border border-emerald-600/40 flex items-center justify-center transition-all duration-300 transform cursor-pointer group ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto hover:scale-110 active:scale-95'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5 text-emerald-100 group-hover:-translate-y-0.5 transition-transform" />
    </button>
  );
};

export default ScrollToTopButton;
