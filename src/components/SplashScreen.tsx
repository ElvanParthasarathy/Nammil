import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Wrench } from '@phosphor-icons/react';
import { useI18n } from '../i18n/I18nContext';
import { getTheme } from '../theme';
import SplashDesigner, { SplashConfig, DEFAULT_SPLASH_CONFIG } from './SplashDesigner';

import './Onboarding/Onboarding.css';

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

  // Designer Config State (persisted in localStorage)
  const [config, setConfig] = useState<SplashConfig>(() => {
    try {
      const saved = localStorage.getItem('nammil-splash-designer-config');
      if (saved) return { ...DEFAULT_SPLASH_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SPLASH_CONFIG;
  });

  const [isDesignerOpen, setIsDesignerOpen] = useState(true);
  const [isPaused, setIsPaused] = useState(true); // Paused by default for designing
  const [previewLang, setPreviewLang] = useState('cycle');

  const [nameIndex, setNameIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const doneRef = useRef(false);

  useEffect(() => {
    if (isPaused || previewLang !== 'cycle') return;
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
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [nameIndex, order.length, isPaused, previewLang]);

  let currentName = BRAND_NAMES['en'];
  if (previewLang !== 'cycle') {
    currentName = BRAND_NAMES[previewLang] || BRAND_NAMES['en'];
  } else {
    currentName = BRAND_NAMES[order[nameIndex]] || BRAND_NAMES['en'];
  }

  return (
    <div className={`onboarding-container ${actualMode === 'dark' ? 'dark' : ''}`}>
      <div className="onboarding-shape shape-1" />
      <div className="onboarding-shape shape-2" />
      <div className="onboarding-shape shape-3" />
      <div className="onboarding-shape shape-4" />

      {/* Floating Toggle Button when Designer is Closed */}
      {!isDesignerOpen && (
        <Button
          onClick={() => setIsDesignerOpen(true)}
          startIcon={<Wrench size={16} weight="fill" />}
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 99999,
            bgcolor: 'rgba(20, 24, 30, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#00e676',
            borderRadius: '20px',
            textTransform: 'none',
            fontSize: '12px',
            fontWeight: 700,
            px: 1.5,
            py: 0.5,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            '&:hover': { bgcolor: 'rgba(30, 36, 45, 0.95)', borderColor: '#00e676' },
          }}
        >
          Dev Designer
        </Button>
      )}

      {/* Interactive Dev Designer Panel */}
      {isDesignerOpen && (
        <SplashDesigner
          config={config}
          onChange={setConfig}
          previewLang={previewLang}
          onPreviewLangChange={setPreviewLang}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(p => !p)}
          onCloseDesigner={() => setIsDesignerOpen(false)}
          onEnterApp={onFinish}
        />
      )}
      
      {/* Centered Content: Logo with Changing Language Below */}
      <Box 
        sx={{ 
          width: '100vw', 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', // VERTICAL: Brand name placed below logo
          justifyContent: 'center', 
          alignItems: 'center', 
          transform: `translateY(${config.centerOffsetY}px)`,
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
            width: `${config.logoSize}px`,
            height: `${config.logoSize}px`,
            mb: `${config.logoMarginBottom}px`,
            objectFit: 'contain',
            flexShrink: 0,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))',
            userSelect: 'none',
          }} 
        />

        {/* App name — Placed directly below the logo */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: `${Math.round(config.brandFontSize * 1.3)}px`,
          }}
        >
          <Typography 
            sx={{ 
              fontSize: `${config.brandFontSize}px`,
              fontWeight: config.brandFontWeight,
              letterSpacing: `${config.brandLetterSpacing}px`,
              fontFamily: "'Elvan Sans', sans-serif",
              color: contentColor,
              opacity: (previewLang !== 'cycle' || visible) ? 1 : 0,
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
          bottom: `${config.footerBottom}px`,
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
            fontSize: `${config.footerFontSize}px`, 
            fontFamily: "'Elvan Sans', sans-serif",
            letterSpacing: `${config.footerLetterSpacing}px`,
            fontWeight: config.footerFontWeight,
            color: actualMode === 'dark' ? `rgba(255, 255, 255, ${config.footerOpacity})` : `rgba(0, 0, 0, ${config.footerOpacity})`,
          }}
        >
          Elvan Navil
        </Typography>
      </Box>
    </div>
  );
}
