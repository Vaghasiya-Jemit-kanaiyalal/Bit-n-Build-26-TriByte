import React from 'react';
import { Sparkles } from 'lucide-react';

interface GarbageTruckLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GarbageTruckLoader: React.FC<GarbageTruckLoaderProps> = ({
  message = 'Loading Fleet Data...',
  size = 'md'
}) => {
  const containerSizeClass = size === 'sm' ? 'w-48 h-18' : size === 'lg' ? 'w-80 h-28' : 'w-64 h-24';

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full select-none animate-in fade-in duration-200">
      {/* Truck & Road Scene Box */}
      <div className={`relative ${containerSizeClass} overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-center`}>
        
        {/* Animated Sky / Background Stars */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 opacity-90" />

        {/* Animated Road Lines */}
        <div className="absolute bottom-3 inset-x-0 h-8 bg-slate-800 border-t border-slate-700 overflow-hidden">
          {/* Asphalt texture / dashed road lines moving left */}
          <div className="absolute top-3 inset-x-0 flex space-x-4 animate-road-stripes">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-6 h-1 bg-amber-400/80 rounded-full shrink-0 shadow-sm" />
            ))}
          </div>
        </div>

        {/* Animated Garbage Truck */}
        <div className="relative z-10 flex flex-col items-center animate-truck-bounce">
          
          {/* Exhaust Smoke Particles */}
          <div className="absolute -left-3 top-1 flex space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400/40 animate-ping" style={{ animationDuration: '0.8s' }} />
            <span className="w-2 h-2 rounded-full bg-slate-300/30 animate-pulse" style={{ animationDuration: '1s' }} />
          </div>

          <svg className="w-24 h-12 text-[#88a573]" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Truck Body Compactor Bin */}
            <path
              d="M10 15 H55 V38 H10 Z"
              fill="#738a62"
              stroke="#5f7350"
              strokeWidth="2"
            />
            {/* Compactor Accent Stripes */}
            <path d="M15 18 H50 M15 24 H50 M15 30 H50" stroke="#88a573" strokeWidth="1.5" strokeDasharray="3 2" />
            
            {/* Eco Leaf Badge on Bin */}
            <circle cx="32" cy="26" r="6" fill="#5f7350" />
            <path d="M30 27 C30 24 34 24 34 27 C34 29 32 30 30 27 Z" fill="#88a573" />

            {/* Truck Cabin */}
            <path
              d="M55 20 H75 L85 28 V38 H55 Z"
              fill="#1e293b"
              stroke="#475569"
              strokeWidth="2"
            />
            {/* Cabin Window */}
            <path
              d="M62 23 H73 L79 28 H62 Z"
              fill="#38bdf8"
              opacity="0.85"
            />
            {/* Headlight */}
            <circle cx="83" cy="34" r="2.5" fill="#fef08a" className="animate-pulse" />
            <path d="M85 34 L98 31 L98 37 Z" fill="#fef08a" opacity="0.15" />

            {/* Wheels - Front & Rear */}
            <g className="animate-spin-slow origin-[25px_38px]">
              <circle cx="25" cy="38" r="6" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
              <circle cx="25" cy="38" r="2" fill="#94a3b8" />
              <line x1="25" y1="32" x2="25" y2="44" stroke="#94a3b8" strokeWidth="1" />
            </g>
            <g className="animate-spin-slow origin-[45px_38px]">
              <circle cx="45" cy="38" r="6" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
              <circle cx="45" cy="38" r="2" fill="#94a3b8" />
              <line x1="45" y1="32" x2="45" y2="44" stroke="#94a3b8" strokeWidth="1" />
            </g>
            <g className="animate-spin-slow origin-[72px_38px]">
              <circle cx="72" cy="38" r="6" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
              <circle cx="72" cy="38" r="2" fill="#94a3b8" />
              <line x1="72" y1="32" x2="72" y2="44" stroke="#94a3b8" strokeWidth="1" />
            </g>
          </svg>
        </div>
      </div>

      {/* Loading Text */}
      <div className="mt-4 flex items-center space-x-2 text-slate-700 font-medium">
        <Sparkles className="w-4 h-4 text-[#738a62] animate-spin" style={{ animationDuration: '3s' }} />
        <span className="text-xs sm:text-sm tracking-wide font-semibold">{message}</span>
      </div>

      {/* Inline Keyframe Styles for Truck Animation */}
      <style>{`
        @keyframes road-stripes {
          0% { transform: translateX(0); }
          100% { transform: translateX(-40px); }
        }
        @keyframes truck-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-road-stripes {
          animation: road-stripes 0.6s linear infinite;
        }
        .animate-truck-bounce {
          animation: truck-bounce 0.4s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GarbageTruckLoader;
