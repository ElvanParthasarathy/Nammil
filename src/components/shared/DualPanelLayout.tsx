import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import '../../styles/settings.css';

interface DualPanelLayoutProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  title: string;
}

function useAutoHideScrollbar() {
  const [isVisible, setIsVisible] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBriefly = React.useCallback(() => {
    setIsVisible(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 1000);
  }, []);

  const handleScroll = React.useCallback(() => {
    showBriefly();
  }, [showBriefly]);

  const handleWheel = React.useCallback(() => {
    showBriefly();
  }, [showBriefly]);

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const distanceFromRight = rect.right - e.clientX;
    // When mouse is near the scrollbar (within 24px of the right edge)
    if (distanceFromRight >= 0 && distanceFromRight <= 24) {
      setIsVisible(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    } else {
      // If mouse moved back into the content area, start a brief fade-out timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 600);
    }
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsVisible(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    className: isVisible ? 'scrollbar-visible' : '',
    onScroll: handleScroll,
    onWheel: handleWheel,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };
}

export default function DualPanelLayout({ sidebar, content, title }: DualPanelLayoutProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isSmallScreen = useMediaQuery('(max-width: 900px)');

  const leftScroll = useAutoHideScrollbar();
  const rightScroll = useAutoHideScrollbar();

  const cssVars = {
    '--mac-card-bg': isDark ? '#282929' : '#FFFFFF', 
    '--mac-selection-hover': isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    '--mac-text': isDark ? '#ffffff' : '#000000',
    '--mac-text-secondary': isDark ? '#aaaaaa' : '#666666',
    '--mac-divider': isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    '--scrollbar-thumb': isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.25)',
    '--scrollbar-thumb-hover': isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
    backgroundColor: isDark ? '#1d1f1f' : '#F6F5F4', 
    color: isDark ? '#ffffff' : '#000000',
    height: '100%',
    width: '100%'
  } as React.CSSProperties;

  return (
    <div className="s2-page-view" style={cssVars}>
      <div className="s2-content-grid" style={{ gridTemplateColumns: isSmallScreen ? '64px 1fr' : '380px 1fr' }}>
        {/* LEFT HUB */}
        <Box 
          className={`s2-col-left ${leftScroll.className}`}
          onScroll={leftScroll.onScroll}
          onWheel={leftScroll.onWheel}
          onMouseMove={leftScroll.onMouseMove}
          onMouseLeave={leftScroll.onMouseLeave}
          sx={{ 
            paddingRight: isSmallScreen ? '8px' : '24px', 
            paddingLeft: isSmallScreen ? '8px' : '24px', 
            borderRight: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)',
            scrollbarGutter: isSmallScreen ? 'auto' : 'stable',
            '&::-webkit-scrollbar': isSmallScreen ? { display: 'none' } : undefined,
            msOverflowStyle: isSmallScreen ? 'none' : 'auto',
            scrollbarWidth: isSmallScreen ? 'none' : 'auto',
          }}
        >
          {!isSmallScreen && (
            <div className="s2-sub-header" style={{ marginBottom: '32px', paddingLeft: '20px' }}>
              <Typography sx={{ fontSize: '22px', fontWeight: 600 }}>{title}</Typography>
            </div>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {sidebar}
          </Box>
        </Box>

        {/* RIGHT DETAIL VIEW */}
        <Box 
          className={`s2-col-right ${rightScroll.className}`}
          onScroll={rightScroll.onScroll}
          onWheel={rightScroll.onWheel}
          onMouseMove={rightScroll.onMouseMove}
          onMouseLeave={rightScroll.onMouseLeave}
        >
          {content}
        </Box>
      </div>
    </div>
  );
}
