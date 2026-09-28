import React from 'react';

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizeMap = {
    sm: {
      icon: 'w-7 h-7',
      text: 'text-sm tracking-wider',
      sub: 'text-[8px] tracking-[0.2em]',
      badge: 'px-1.5 py-0.2 text-[8px]',
    },
    md: {
      icon: 'w-9 h-9',
      text: 'text-base tracking-widest',
      sub: 'text-[9px] tracking-[0.25em]',
      badge: 'px-2 py-0.5 text-[9px]',
    },
    lg: {
      icon: 'w-11 h-11',
      text: 'text-lg tracking-widest',
      sub: 'text-[10px] tracking-[0.3em]',
      badge: 'px-2.5 py-0.5 text-[10px]',
    },
    xl: {
      icon: 'w-16 h-16',
      text: 'text-2xl tracking-widest',
      sub: 'text-xs tracking-[0.35em]',
      badge: 'px-3 py-1 text-xs',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Luxury 24K Gold & Platinum Crest */}
      <div className={`relative ${currentSize.icon} flex-shrink-0 group`}>
        {/* Ambient champagne gold glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/40 via-yellow-400/30 to-amber-600/40 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Outer 24k Gold Foil Beveled Border */}
        <div className="relative w-full h-full rounded-2xl p-[1.5px] bg-gradient-to-br from-yellow-200 via-amber-400 to-amber-700 shadow-xl shadow-amber-950/30">
          <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-[#131926] via-[#0c1017] to-[#07090e] flex items-center justify-center overflow-hidden border border-amber-500/20">
            <svg
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4/5 h-4/5 transform transition-transform duration-300 group-hover:scale-110"
            >
              <defs>
                <linearGradient id="goldSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fffbeb" />
                  <stop offset="25%" stopColor="#fde047" />
                  <stop offset="60%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>

                <linearGradient id="crestRing" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#b45309" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#fde047" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0.4" />
                </linearGradient>

                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Diamond-Octagonal Heraldic Border */}
              <polygon
                points="22,3 38,10 41,26 31,39 13,39 3,26 6,10"
                stroke="url(#crestRing)"
                strokeWidth="1.6"
                fill="none"
              />

              {/* Subtle Luxury Ray Grid */}
              <line x1="22" y1="3" x2="22" y2="39" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.3" />
              <line x1="3" y1="26" x2="38" y2="10" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.3" />
              <line x1="6" y1="10" x2="41" y2="26" stroke="#d4af37" strokeWidth="0.5" strokeOpacity="0.3" />

              {/* Corner Star Diamonds */}
              <circle cx="22" cy="3" r="1.5" fill="#fef08a" />
              <circle cx="38" cy="10" r="1.2" fill="#d4af37" />
              <circle cx="6" cy="10" r="1.2" fill="#d4af37" />
              <circle cx="31" cy="39" r="1.2" fill="#fde047" />
              <circle cx="13" cy="39" r="1.2" fill="#fde047" />

              {/* Center Royal Electric Bolt with Gold Sheen */}
              <path
                d="M23.5 8L13 23H21L19 35L31 20H23L23.5 8Z"
                fill="url(#goldSheen)"
                filter="url(#goldGlow)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Luxury Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-black font-serif uppercase text-slate-900 dark:text-white ${currentSize.text}`}>
              VOLT<span className="bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 bg-clip-text text-transparent font-sans">GRID</span>
            </span>
            <span className={`font-mono font-bold uppercase rounded bg-gradient-to-r from-amber-400/15 to-yellow-500/15 border border-amber-400/30 text-amber-600 dark:text-amber-300 shadow-sm ${currentSize.badge}`}>
              LUXE
            </span>
          </div>
          <span className={`font-medium uppercase text-slate-400 dark:text-amber-200/50 mt-1 ${currentSize.sub}`}>
            Private Utility & Energy
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
