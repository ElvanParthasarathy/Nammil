import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import AppLogo from '../assets/app_icon.png';
import SplashBrandSvg from './SplashBrandSvg';

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

interface SplashScreenProps {
  userTheme: string;
}

export default function SplashScreen({ userTheme }: SplashScreenProps) {
  const { actualLang } = useI18n();
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
          src={AppLogo} 
          alt="" 
          className="splash-logo" 
        />
      </div>

      {/* Elvan Navil Parent Branding at the bottom — instant vector SVG in exact Elvan Sans font */}
      <div className="splash-footer">
        <SplashBrandSvg lang={actualLang} />
      </div>
    </div>
  );
}
