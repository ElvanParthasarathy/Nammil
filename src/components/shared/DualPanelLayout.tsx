import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import '../../styles/settings.css';

interface DualPanelLayoutProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
  title: string;
}

function useAutoHideScrollbar() {
  const ref = React.useRef<HTMLDivElement>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScroll = React.useCallback(() => {
    if (ref.current) {
      ref.current.classList.add('scrollbar-visible');
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      if (ref.current) {
        ref.current.classList.remove('scrollbar-visible');
      }
    }, 1000);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    ref,
    onScroll: handleScroll,
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
          ref={leftScroll.ref}
          className="s2-col-left"
          onScroll={leftScroll.onScroll}
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
          ref={rightScroll.ref}
          className="s2-col-right"
          onScroll={rightScroll.onScroll}
        >
          {content}
        </Box>
      </div>
    </div>
  );
}
