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
}

export default function SplashScreen({ userTheme }: SplashScreenProps) {
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const actualMode = userTheme === 'system' ? (prefersDarkMode ? 'dark' : 'light') : userTheme;

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
      
      {/* Centered Content: Logo alone */}
      <div className="splash-center">
        <img 
          src="/app_icon.png" 
          alt="Nammil" 
          className="splash-logo" 
        />
      </div>

      {/* Elvan Navil Parent Branding at the bottom */}
      <div className="splash-footer">
        <span className="splash-footer-brand">
          Elvan Navil
        </span>
      </div>
    </div>
  );
}
