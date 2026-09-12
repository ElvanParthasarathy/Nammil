import React, { useState } from 'react';
import { Box, Typography, Slider, Button, IconButton, Paper, Chip } from '@mui/material';
import { Wrench, X, Copy, Check, ArrowsClockwise, Pause, Play, CaretDown, CaretUp } from '@phosphor-icons/react';

export interface SplashConfig {
  logoSize: number;
  logoMarginBottom: number;
  centerOffsetY: number;
  brandFontSize: number;
  brandFontWeight: number;
  brandLetterSpacing: number;
  footerBottom: number;
  footerFontSize: number;
  footerFontWeight: number;
  footerLetterSpacing: number;
  footerOpacity: number;
}

export const DEFAULT_SPLASH_CONFIG: SplashConfig = {
  logoSize: 72,
  logoMarginBottom: 16,
  centerOffsetY: -20,
  brandFontSize: 28,
  brandFontWeight: 600,
  brandLetterSpacing: -0.2,
  footerBottom: 50,
  footerFontSize: 18,
  footerFontWeight: 500,
  footerLetterSpacing: -0.2,
  footerOpacity: 0.4,
};

interface SplashDesignerProps {
  config: SplashConfig;
  onChange: (newConfig: SplashConfig) => void;
  previewLang: string;
  onPreviewLangChange: (lang: string) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onCloseDesigner: () => void;
  onEnterApp?: () => void;
}

export default function SplashDesigner({
  config,
  onChange,
  previewLang,
  onPreviewLangChange,
  isPaused,
  onTogglePause,
  onCloseDesigner,
  onEnterApp,
}: SplashDesignerProps) {
  const [copied, setCopied] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const update = (key: keyof SplashConfig, value: number) => {
    const updated = { ...config, [key]: value };
    onChange(updated);
    try {
      localStorage.setItem('nammil-splash-designer-config', JSON.stringify(updated));
    } catch {}
  };

  const handleCopy = () => {
    const json = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    onChange(DEFAULT_SPLASH_CONFIG);
    try {
      localStorage.removeItem('nammil-splash-designer-config');
    } catch {}
  };

  if (minimized) {
    return (
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.75,
          borderRadius: '20px',
          bgcolor: 'rgba(20, 24, 30, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#FFFFFF',
          cursor: 'pointer',
          pointerEvents: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
        onClick={() => setMinimized(false)}
      >
        <Wrench size={18} weight="fill" color="#00e676" />
        <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>Designer</Typography>
        <CaretDown size={14} />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={16}
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        width: 360,
        maxHeight: 'calc(100vh - 32px)',
        zIndex: 99999,
        overflowY: 'auto',
        borderRadius: '16px',
        bgcolor: 'rgba(18, 22, 28, 0.94)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        color: '#FFFFFF',
        p: 2.5,
        pointerEvents: 'auto',
        boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Wrench size={20} weight="fill" color="#00e676" />
          <Typography sx={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.5px' }}>
            Splash Designer
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" onClick={() => setMinimized(true)} sx={{ color: 'rgba(255,255,255,0.6)' }}>
            <CaretUp size={16} />
          </IconButton>
          <IconButton size="small" onClick={onCloseDesigner} sx={{ color: 'rgba(255,255,255,0.6)' }}>
            <X size={16} />
          </IconButton>
        </Box>
      </Box>

      {/* Play / Pause Animation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.04)', p: 1.2, borderRadius: '10px' }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
          Animation: {isPaused ? 'Paused (Design Mode)' : 'Cycling'}
        </Typography>
        <Button
          size="small"
          variant="contained"
          onClick={onTogglePause}
          startIcon={isPaused ? <Play size={14} weight="fill" /> : <Pause size={14} weight="fill" />}
          sx={{
            bgcolor: isPaused ? '#00e676' : 'rgba(255,255,255,0.15)',
            color: isPaused ? '#000' : '#fff',
            textTransform: 'none',
            fontSize: '12px',
            fontWeight: 600,
            borderRadius: '6px',
            '&:hover': { bgcolor: isPaused ? '#00c853' : 'rgba(255,255,255,0.25)' },
          }}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
      </Box>

      {/* Script / Language Previewer */}
      <Box>
        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Preview Language
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {[
            { id: 'cycle', label: 'Auto Cycle' },
            { id: 'en', label: 'Nammil (EN)' },
            { id: 'ta', label: 'நம்மில் (TA)' },
            { id: 'ml', label: 'നമ്മിൽ (ML)' },
          ].map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              size="small"
              clickable
              onClick={() => onPreviewLangChange(item.id)}
              sx={{
                bgcolor: previewLang === item.id ? '#00e676' : 'rgba(255,255,255,0.08)',
                color: previewLang === item.id ? '#000' : '#fff',
                fontWeight: previewLang === item.id ? 700 : 500,
                fontSize: '12px',
                borderRadius: '6px',
                '&:hover': { bgcolor: previewLang === item.id ? '#00c853' : 'rgba(255,255,255,0.15)' },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* SECTION 1: Logo Settings */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#00e676', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Logo & Placement
        </Typography>

        <ControlRow
          label="Logo Size"
          value={`${config.logoSize}px`}
          control={
            <Slider
              size="small"
              min={40}
              max={160}
              value={config.logoSize}
              onChange={(_, v) => update('logoSize', v as number)}
              sx={{ color: '#00e676' }}
            />
          }
        />

        <ControlRow
          label="Gap Below Logo"
          value={`${config.logoMarginBottom}px`}
          control={
            <Slider
              size="small"
              min={0}
              max={80}
              value={config.logoMarginBottom}
              onChange={(_, v) => update('logoMarginBottom', v as number)}
              sx={{ color: '#00e676' }}
            />
          }
        />

        <ControlRow
          label="Center Y-Offset"
          value={`${config.centerOffsetY}px`}
          control={
            <Slider
              size="small"
              min={-120}
              max={120}
              value={config.centerOffsetY}
              onChange={(_, v) => update('centerOffsetY', v as number)}
              sx={{ color: '#00e676' }}
            />
          }
        />
      </Box>

      {/* SECTION 2: Brand Name (Nammil) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#00e676', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Brand Name (Nammil)
        </Typography>

        <ControlRow
          label="Font Size"
          value={`${config.brandFontSize}px`}
          control={
            <Slider
              size="small"
              min={18}
              max={60}
              value={config.brandFontSize}
              onChange={(_, v) => update('brandFontSize', v as number)}
              sx={{ color: '#00e676' }}
            />
          }
        />

        <ControlRow
          label="Font Weight (Boldness)"
          value={String(config.brandFontWeight)}
          control={
            <Slider
              size="small"
              min={300}
              max={900}
              step={100}
              marks
              value={config.brandFontWeight}
              onChange={(_, v) => update('brandFontWeight', v as number)}
              sx={{ color: '#00e676' }}
            />
          }
        />

        <ControlRow
          label="Letter Spacing"
          value={`${config.brandLetterSpacing}px`}
          control={
            <Slider
              size="small"
              min={-2}
              max={6}
              step={0.1}
              value={config.brandLetterSpacing}
              onChange={(_, v) => update('brandLetterSpacing', Number((v as number).toFixed(1)))}
              sx={{ color: '#00e676' }}
            />
          }
        />
      </Box>

      {/* SECTION 3: Footer (Elvan Navil) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#00e676', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Parent Brand (Elvan Navil)
        </Typography>

        <ControlRow
          label="Bottom Offset"
          value={`${config.footerBottom}px`}
          control={
            <Slider
              size="small"
              min={15}
              max={120}
              value={config.footerBottom}
              onChange={(_, v) => update('footerBottom', v as number)}
              sx={{ color: '#00e676' }}
            />
          }
        />

        <ControlRow
          label="Font Size"
          value={`${config.footerFontSize}px`}
          control={
            <Slider
              size="small"
              min={12}
              max={32}
              value={config.footerFontSize}
              onChange={(_, v) => update('footerFontSize', v as number)}
              sx={{ color: '#00e676' }}
            />
          }
        />

        <ControlRow
          label="Font Weight (Boldness)"
          value={String(config.footerFontWeight)}
          control={
            <Slider
              size="small"
              min={300}
              max={900}
              step={100}
              marks
              value={config.footerFontWeight}
              onChange={(_, v) => update('footerFontWeight', v as number)}
              sx={{ color: '#00e676' }}
            />
          }
        />

        <ControlRow
          label="Letter Spacing"
          value={`${config.footerLetterSpacing}px`}
          control={
            <Slider
              size="small"
              min={-2}
              max={5}
              step={0.1}
              value={config.footerLetterSpacing}
              onChange={(_, v) => update('footerLetterSpacing', Number((v as number).toFixed(1)))}
              sx={{ color: '#00e676' }}
            />
          }
        />

        <ControlRow
          label="Opacity"
          value={`${Math.round(config.footerOpacity * 100)}%`}
          control={
            <Slider
              size="small"
              min={0.1}
              max={1.0}
              step={0.05}
              value={config.footerOpacity}
              onChange={(_, v) => update('footerOpacity', Number((v as number).toFixed(2)))}
              sx={{ color: '#00e676' }}
            />
          }
        />
      </Box>

      {/* Copy & Actions */}
      <Box sx={{ pt: 1, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleCopy}
          startIcon={copied ? <Check size={18} weight="bold" /> : <Copy size={18} weight="bold" />}
          sx={{
            bgcolor: copied ? '#00e676' : '#2563eb',
            color: copied ? '#000' : '#fff',
            textTransform: 'none',
            fontSize: '13px',
            fontWeight: 700,
            py: 1,
            borderRadius: '8px',
            '&:hover': { bgcolor: copied ? '#00c853' : '#1d4ed8' },
          }}
        >
          {copied ? 'Copied Coordinates!' : 'Copy Coordinates'}
        </Button>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            onClick={handleReset}
            startIcon={<ArrowsClockwise size={14} />}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              borderColor: 'rgba(255,255,255,0.2)',
              textTransform: 'none',
              fontSize: '12px',
              borderRadius: '8px',
              '&:hover': { borderColor: 'rgba(255,255,255,0.4)', color: '#fff' },
            }}
          >
            Reset
          </Button>

          {onEnterApp && (
            <Button
              fullWidth
              size="small"
              variant="outlined"
              onClick={onEnterApp}
              sx={{
                color: '#00e676',
                borderColor: 'rgba(0, 230, 118, 0.4)',
                textTransform: 'none',
                fontSize: '12px',
                borderRadius: '8px',
                '&:hover': { borderColor: '#00e676', bgcolor: 'rgba(0,230,118,0.1)' },
              }}
            >
              Enter App →
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

function ControlRow({ label, value, control }: { label: string; value: string; control: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{label}</Typography>
        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#00e676', fontFamily: 'monospace' }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ px: 0.5 }}>{control}</Box>
    </Box>
  );
}
