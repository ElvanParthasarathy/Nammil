import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useI18n } from '../i18n/I18nContext';
import { getTheme } from '../theme';

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
  const theme = getTheme(actualMode);

  const contentColor = actualMode === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)';
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
      className={`onboarding-container splash-screen-root ${actualMode === 'dark' ? 'dark' : ''}`}
      style={{ WebkitAppRegion: 'no-drag' }}
    >
      {/* Floating Animated Shapes from Neram */}
      <div className="onboarding-shape shape-1" />
      <div className="onboarding-shape shape-2" />
      <div className="onboarding-shape shape-3" />
      <div className="onboarding-shape shape-4" />
      
      {/* Centered Content: Logo with Changing Language Below */}
      <Box 
        sx={{ 
          width: '100vw', 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          transform: `translateY(${SPLASH_COORDINATES.centerOffsetY}px)`,
          color: actualMode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,
          position: 'relative',
          zIndex: 10000,
          pointerEvents: 'none'
        }}
      >
        {/* Logo — Always centered on top, exact match with HTML splash */}
        <Box 
          component="img"
          src="/app_icon.png"
          alt="Nammil"
          sx={{ 
            width: `${SPLASH_COORDINATES.logoSize}px`,
            height: `${SPLASH_COORDINATES.logoSize}px`,
            mb: `${SPLASH_COORDINATES.logoMarginBottom}px`,
            objectFit: 'contain',
            flexShrink: 0,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
            userSelect: 'none',
          }} 
        />

        {/* App name — Placed directly below the logo with smooth cross-language fade */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: `${Math.round(SPLASH_COORDINATES.brandFontSize * 1.4)}px`,
          }}
        >
          <Typography 
            sx={{ 
              fontSize: `${SPLASH_COORDINATES.brandFontSize}px`,
              fontWeight: SPLASH_COORDINATES.brandFontWeight,
              letterSpacing: `${SPLASH_COORDINATES.brandLetterSpacing}px`,
              fontFamily: "'Elvan Sans', sans-serif",
              color: contentColor,
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.25s ease-in-out',
              whiteSpace: 'nowrap',
              textAlign: 'center',
            }}
          >
            {currentName}
          </Typography>
        </Box>
      </Box>

      {/* Elvan Navil Parent Branding at the bottom */}
      <Box
        sx={{
          position: 'absolute',
          bottom: `${SPLASH_COORDINATES.footerBottom}px`,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
          pointerEvents: 'none'
        }}
      >
        <Typography 
          sx={{ 
            fontSize: `${SPLASH_COORDINATES.footerFontSize}px`, 
            fontFamily: "'Elvan Sans', sans-serif",
            letterSpacing: `${SPLASH_COORDINATES.footerLetterSpacing}px`,
            fontWeight: SPLASH_COORDINATES.footerFontWeight,
            color: actualMode === 'dark' 
              ? `rgba(255, 255, 255, ${SPLASH_COORDINATES.footerOpacity})` 
              : `rgba(0, 0, 0, ${SPLASH_COORDINATES.footerOpacity})`,
          }}
        >
          Elvan Navil
        </Typography>
      </Box>
    </div>
  );
}
