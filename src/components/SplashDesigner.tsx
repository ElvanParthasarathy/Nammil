import React, { useState } from 'react';
import { Box, Typography, Slider, Button, IconButton, Paper, Chip } from '@mui/material';
import { Wrench, X, Copy, Check, ArrowsClockwise, Pause, Play, CaretDown, CaretUp, Plus, Minus } from '@phosphor-icons/react';

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
        className="splash-designer-panel"
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
          bgcolor: 'rgba(20, 24, 30, 0.88)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#FFFFFF',
          cursor: 'pointer',
          pointerEvents: 'auto',
          WebkitAppRegion: 'no-drag',
          '& *': {
            WebkitAppRegion: 'no-drag !important',
          },
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
      className="splash-designer-panel"
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        width: 375,
        maxHeight: 'calc(100vh - 32px)',
        zIndex: 99999,
        overflowY: 'auto',
        borderRadius: '16px',
        bgcolor: 'rgba(18, 22, 28, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        color: '#FFFFFF',
        p: 2.5,
        pointerEvents: 'auto',
        WebkitAppRegion: 'no-drag',
        '& *': {
          WebkitAppRegion: 'no-drag !important',
        },
        boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.2,
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
          <IconButton size="small" onClick={() => setMinimized(true)} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}>
            <CaretUp size={16} />
          </IconButton>
          <IconButton size="small" onClick={onCloseDesigner} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}>
            <X size={16} />
          </IconButton>
        </Box>
      </Box>

      {/* Play / Pause Animation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.04)', p: 1.2, borderRadius: '10px' }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
          Cycle: {isPaused ? 'Paused (Design Mode)' : 'Running'}
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
            fontWeight: 700,
            borderRadius: '6px',
            WebkitAppRegion: 'no-drag',
            '&:hover': { bgcolor: isPaused ? '#00c853' : 'rgba(255,255,255,0.25)' },
          }}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
      </Box>

      {/* Script / Language Previewer */}
      <Box>
        <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', mb: 1, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Preview Script / Language
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
                WebkitAppRegion: 'no-drag',
                '&:hover': { bgcolor: previewLang === item.id ? '#00c853' : 'rgba(255,255,255,0.15)' },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* SECTION 1: Logo Settings */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#00e676', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Logo & Center Position
        </Typography>

        <ControlItem
          label="Logo Size"
          value={config.logoSize}
          min={36}
          max={180}
          step={2}
          unit="px"
          onChange={(v) => update('logoSize', v)}
        />

        <ControlItem
          label="Gap Below Logo"
          value={config.logoMarginBottom}
          min={0}
          max={80}
          step={2}
          unit="px"
          onChange={(v) => update('logoMarginBottom', v)}
        />

        <ControlItem
          label="Center Y-Offset"
          value={config.centerOffsetY}
          min={-150}
          max={150}
          step={2}
          unit="px"
          onChange={(v) => update('centerOffsetY', v)}
        />
      </Box>

      {/* SECTION 2: Brand Name (Nammil) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#00e676', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Brand Name (Nammil)
        </Typography>

        <ControlItem
          label="Font Size"
          value={config.brandFontSize}
          min={16}
          max={64}
          step={1}
          unit="px"
          onChange={(v) => update('brandFontSize', v)}
        />

        <ControlItem
          label="Font Weight (Boldness)"
          value={config.brandFontWeight}
          min={300}
          max={900}
          step={100}
          weightPresets
          onChange={(v) => update('brandFontWeight', v)}
        />

        <ControlItem
          label="Letter Spacing"
          value={config.brandLetterSpacing}
          min={-2}
          max={6}
          step={0.1}
          unit="px"
          onChange={(v) => update('brandLetterSpacing', Number(v.toFixed(1)))}
        />
      </Box>

      {/* SECTION 3: Footer (Elvan Navil) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#00e676', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Parent Brand (Elvan Navil)
        </Typography>

        <ControlItem
          label="Bottom Offset"
          value={config.footerBottom}
          min={10}
          max={140}
          step={2}
          unit="px"
          onChange={(v) => update('footerBottom', v)}
        />

        <ControlItem
          label="Font Size"
          value={config.footerFontSize}
          min={12}
          max={32}
          step={0.5}
          unit="px"
          onChange={(v) => update('footerFontSize', Number(v.toFixed(1)))}
        />

        <ControlItem
          label="Font Weight (Boldness)"
          value={config.footerFontWeight}
          min={300}
          max={900}
          step={100}
          weightPresets
          onChange={(v) => update('footerFontWeight', v)}
        />

        <ControlItem
          label="Letter Spacing"
          value={config.footerLetterSpacing}
          min={-2}
          max={6}
          step={0.1}
          unit="px"
          onChange={(v) => update('footerLetterSpacing', Number(v.toFixed(1)))}
        />

        <ControlItem
          label="Opacity"
          value={config.footerOpacity}
          min={0.1}
          max={1.0}
          step={0.05}
          onChange={(v) => update('footerOpacity', Number(v.toFixed(2)))}
        />
      </Box>

      {/* Copy & Actions */}
      <Box sx={{ pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 1 }}>
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
            py: 1.2,
            borderRadius: '8px',
            WebkitAppRegion: 'no-drag',
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
              WebkitAppRegion: 'no-drag',
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
                WebkitAppRegion: 'no-drag',
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

interface ControlItemProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  weightPresets?: boolean;
}

function ControlItem({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  weightPresets = false,
}: ControlItemProps) {
  const handleDec = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = Math.max(min, Number((value - step).toFixed(2)));
    onChange(next);
  };

  const handleInc = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = Math.min(max, Number((value + step).toFixed(2)));
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(val);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {/* Top row: Label + Stepper controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
          {label}
        </Typography>
        
        {/* Interactive Stepper (Minus, Input, Plus) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={handleDec}
            sx={{
              width: 24,
              height: 24,
              p: 0,
              bgcolor: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.85)',
              borderRadius: '6px',
              WebkitAppRegion: 'no-drag',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.18)', color: '#00e676' },
            }}
          >
            <Minus size={12} weight="bold" />
          </IconButton>

          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={handleInputChange}
            style={{
              width: '56px',
              height: '24px',
              textAlign: 'center',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
              color: '#00e676',
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 700,
              outline: 'none',
              padding: '0 2px',
              WebkitAppRegion: 'no-drag',
            }}
          />
          {unit && (
            <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', minWidth: '14px' }}>
              {unit}
            </Typography>
          )}

          <IconButton
            size="small"
            onClick={handleInc}
            sx={{
              width: 24,
              height: 24,
              p: 0,
              bgcolor: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.85)',
              borderRadius: '6px',
              WebkitAppRegion: 'no-drag',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.18)', color: '#00e676' },
            }}
          >
            <Plus size={12} weight="bold" />
          </IconButton>
        </Box>
      </Box>

      {/* Slider */}
      <Box sx={{ px: 0.5 }}>
        <Slider
          size="small"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(_, v) => onChange(typeof v === 'number' ? v : v[0])}
          sx={{
            color: '#00e676',
            py: 1,
            WebkitAppRegion: 'no-drag',
            touchAction: 'none',
            '& .MuiSlider-thumb': {
              width: 14,
              height: 14,
              WebkitAppRegion: 'no-drag',
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0 0 0 8px rgba(0, 230, 118, 0.16)',
              },
            },
            '& .MuiSlider-track': {
              WebkitAppRegion: 'no-drag',
            },
            '& .MuiSlider-rail': {
              bgcolor: 'rgba(255,255,255,0.15)',
              WebkitAppRegion: 'no-drag',
            },
          }}
        />
      </Box>

      {/* Boldness Presets (Neram match) */}
      {weightPresets && (
        <Box sx={{ display: 'flex', gap: 0.5, mt: -0.5 }}>
          {[
            { w: 400, label: '400 Reg' },
            { w: 500, label: '500 Med (Neram)' },
            { w: 600, label: '600 Semi' },
            { w: 700, label: '700 Bold' },
          ].map((preset) => (
            <Chip
              key={preset.w}
              label={preset.label}
              size="small"
              clickable
              onClick={() => onChange(preset.w)}
              sx={{
                height: '22px',
                fontSize: '10px',
                fontWeight: value === preset.w ? 700 : 500,
                bgcolor: value === preset.w ? '#00e676' : 'rgba(255,255,255,0.06)',
                color: value === preset.w ? '#000' : 'rgba(255,255,255,0.7)',
                borderRadius: '4px',
                WebkitAppRegion: 'no-drag',
                '&:hover': {
                  bgcolor: value === preset.w ? '#00c853' : 'rgba(255,255,255,0.12)',
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
