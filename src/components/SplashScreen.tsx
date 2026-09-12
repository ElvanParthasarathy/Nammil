import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../i18n/I18nContext';

import './Onboarding/Onboarding.css';

// Exact coordinates designed and approved
export const SPLASH_COORDINATES = {
  logoSize: 82,
  logoMarginBottom: 10,
  centerOffsetY: 0,
  brandFontSize: 20,
  brandFontWeight: 500,
  brandLetterSpacing: 0,
  footerBottom: 47,
  footerFontSize: 17,
  footerFontWeight: 400,
  footerLetterSpacing: 0,
  footerOpacity: 0.45,
};

// Brand name in each script
const BRAND_NAMES: Record<string, string> = {
  ta: 'நம்மில்',
  en: 'Nammil',
  ml: 'നമ്മിൽ',
};

// Cycle order per language setting — primary script first, then others. No looping.
const LANG_ORDER: Record<string, string[]> = {
  ta:      ['ta', 'en', 'ml'],
  ta_latn: ['en', 'ta', 'ml'],
  ta_ml:   ['ml', 'ta', 'en'],
  en:      ['en', 'ta', 'ml'],
  ml:      ['ml', 'en', 'ta'],
  ml_latn: ['en', 'ml', 'ta'],
  ml_tam:  ['ta', 'ml', 'en'],
  system:  ['en', 'ta', 'ml'],
};

interface SplashScreenProps {
  userTheme: string;
  onFinish?: () => void;
}

export default function SplashScreen({ userTheme, onFinish }: SplashScreenProps) {
  const { lang } = useI18n();
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const actualMode = userTheme === 'system' ? (prefersDarkMode ? 'dark' : 'light') : userTheme;
  const order = LANG_ORDER[lang] || LANG_ORDER['en'];

  const [nameIndex, setNameIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;

    // Smooth cycle: 450ms visible + 250ms fade = 700ms per name
    const timer = setTimeout(() => {
      if (nameIndex < order.length - 1) {
        setVisible(false);
        setTimeout(() => {
          setNameIndex(prev => prev + 1);
          setVisible(true);
        }, 250);
      } else {
        doneRef.current = true;
        // Hold the final language briefly (400ms), then smoothly transition into app
        setTimeout(() => {
          onFinish?.();
        }, 400);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [nameIndex, order.length, onFinish]);

  const currentName = BRAND_NAMES[order[nameIndex]] || BRAND_NAMES['en'];

  return (
    <div 
      className={`splash-screen-root ${actualMode === 'dark' ? 'dark' : 'light'}`}
      style={{ WebkitAppRegion: 'no-drag' }}
    >
      {/* Floating Animated Shapes from Neram - exact match with index.html */}
      <div className="splash-shape shape-1" />
      <div className="splash-shape shape-2" />
      <div className="splash-shape shape-3" />
      <div className="splash-shape shape-4" />
      
      {/* Centered Content: 100% Identical DOM & CSS to HTML pre-splash */}
      <div className="splash-center">
        <img 
          src="/app_icon.png" 
          alt="Nammil" 
          className="splash-logo" 
        />
        <div className="splash-brand-wrap">
          <span 
            className="splash-brand-name"
            style={{ 
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.25s ease-in-out',
            }}
          >
            {currentName}
          </span>
        </div>
      </div>

      {/* Elvan Navil Parent Branding at the bottom: 100% Identical DOM & CSS to HTML pre-splash */}
      <div className="splash-footer">
        <span className="splash-footer-brand">
          Elvan Navil
        </span>
      </div>
    </div>
  );
}
