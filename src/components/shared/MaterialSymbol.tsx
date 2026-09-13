import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

export interface MaterialSymbolProps {
  icon: string;
  size?: number | string;
  fill?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  grade?: number;
  opticalSize?: number;
  color?: string;
  className?: string;
  sx?: SxProps<Theme>;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

export default function MaterialSymbol({
  icon,
  size = 20,
  fill = false,
  weight = 400,
  grade = 0,
  opticalSize,
  color,
  className = '',
  sx,
  style,
  onClick,
}: MaterialSymbolProps) {
  const opsz = opticalSize || (typeof size === 'number' ? Math.min(Math.max(Math.round(size), 20), 48) : 24);

  return (
    <Box
      component="span"
      className={`material-symbols-rounded ${className}`.trim()}
      onClick={onClick}
      sx={{
        fontFamily: "'Material Symbols Rounded' !important",
        fontWeight: 'normal',
        fontStyle: 'normal',
        fontSize: typeof size === 'number' ? `${size}px` : size,
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        lineHeight: 1,
        letterSpacing: 'normal',
        textTransform: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
        wordWrap: 'normal',
        direction: 'ltr',
        fontFeatureSettings: "'liga'",
        WebkitFontSmoothing: 'antialiased',
        userSelect: 'none',
        verticalAlign: 'middle',
        flexShrink: 0,
        color: color || 'inherit',
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opsz}`,
        transition: 'font-variation-settings 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s ease',
        ...sx,
      }}
      style={style}
    >
      {icon}
    </Box>
  );
}
