import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material/styles';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import type { MdFilledButton } from '@material/web/button/filled-button.js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-filled-button': any;
      'md-outlined-button': any;
      'md-text-button': any;
    }
  }
}

export interface Material3ButtonProps {
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  variant?: 'filled' | 'contained' | 'outlined' | 'text';
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  title?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  sx?: any;
  color?: string;
  'aria-label'?: string;
}

export const Material3Button = forwardRef<HTMLElement, Material3ButtonProps>((props, ref) => {
  const {
    children,
    onClick,
    disabled = false,
    variant = 'filled',
    fullWidth = false,
    size = 'medium',
    icon,
    trailingIcon,
    title,
    id,
    className,
    style,
    sx,
    'aria-label': ariaLabel,
  } = props;

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Extract SX values to preserve the exact existing appearance
  const sxBgColor = sx?.bgcolor || (typeof sx?.backgroundColor === 'string' ? sx.backgroundColor : undefined);
  const sxColor = sx?.color || props.color;
  const sxBorderRadius = sx?.borderRadius;
  const sxMinWidth = sx?.minWidth;
  const sxWidth = fullWidth ? '100%' : (sx?.width || undefined);
  const sxFontWeight = sx?.fontWeight || 600;
  const sxFontSize = sx?.fontSize;
  const sxPx = sx?.px !== undefined ? (typeof sx.px === 'number' ? `${sx.px * 8}px` : sx.px) : undefined;
  const sxPy = sx?.py !== undefined ? (typeof sx.py === 'number' ? `${sx.py * 8}px` : sx.py) : undefined;
  const sxHeight = size === 'small' ? '32px' : size === 'large' ? '48px' : '40px';

  // Determine shape: if borderRadius is 500 or 500px, 9999px; else use exact borderRadius or default 24px
  const shape = sxBorderRadius ? (typeof sxBorderRadius === 'number' ? `${sxBorderRadius}px` : sxBorderRadius) : '24px';

  // Base container & text colors
  const containerColor = sxBgColor || (isDark ? '#282929' : '#FFFFFF');
  const labelColor = sxColor || (isDark ? '#ffffff' : '#000000');

  // Hover layer & state colors
  const hoverLayerColor = isDark ? '#ffffff' : '#000000';

  const buttonStyles: React.CSSProperties = {
    // Preserve layout & sizing
    width: sxWidth,
    minWidth: typeof sxMinWidth === 'number' ? `${sxMinWidth}px` : sxMinWidth,
    fontFamily: 'inherit',
    verticalAlign: 'middle',
    cursor: disabled ? 'default' : 'pointer',

    // Google M3 Filled Button Custom Properties
    '--md-filled-button-container-color': containerColor,
    '--md-filled-button-label-text-color': labelColor,
    '--md-filled-button-container-shape': shape,
    '--md-filled-button-container-height': sxHeight,
    '--md-filled-button-label-text-font': 'inherit',
    '--md-filled-button-label-text-weight': String(sxFontWeight),
    '--md-filled-button-label-text-size': sxFontSize ? (typeof sxFontSize === 'number' ? `${sxFontSize}px` : sxFontSize) : (size === 'small' ? '13px' : '14px'),
    '--md-filled-button-leading-space': sxPx || '20px',
    '--md-filled-button-trailing-space': sxPx || '20px',
    '--md-filled-button-hover-state-layer-color': hoverLayerColor,
    '--md-filled-button-pressed-state-layer-color': hoverLayerColor,
    '--md-filled-button-hover-state-layer-opacity': '0.08',
    '--md-filled-button-pressed-state-layer-opacity': '0.12',
    '--md-filled-button-container-elevation': '0',
    '--md-filled-button-hover-container-elevation': '0',
    '--md-filled-button-pressed-container-elevation': '0',

    // Outlined button tokens (if variant === 'outlined')
    '--md-outlined-button-outline-color': sx?.borderColor || (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'),
    '--md-outlined-button-label-text-color': labelColor,
    '--md-outlined-button-container-shape': shape,
    '--md-outlined-button-hover-state-layer-color': hoverLayerColor,
    '--md-outlined-button-pressed-state-layer-color': hoverLayerColor,

    // Text button tokens (if variant === 'text')
    '--md-text-button-label-text-color': labelColor,
    '--md-text-button-container-shape': shape,
    '--md-text-button-hover-state-layer-color': hoverLayerColor,
    '--md-text-button-pressed-state-layer-color': hoverLayerColor,

    // Focus ring
    '--md-focus-ring-color': isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',

    ...style,
  } as React.CSSProperties;

  const isOutlined = variant === 'outlined';
  const isText = variant === 'text';

  if (isOutlined) {
    return (
      <md-outlined-button
        ref={ref as any}
        id={id}
        className={className}
        disabled={Boolean(disabled) || undefined}
        onClick={onClick}
        aria-label={ariaLabel || title}
        title={title}
        style={buttonStyles}
      >
        {icon && <span slot="icon">{icon}</span>}
        {children}
        {trailingIcon && <span slot="trailing-icon">{trailingIcon}</span>}
      </md-outlined-button>
    );
  }

  if (isText) {
    return (
      <md-text-button
        ref={ref as any}
        id={id}
        className={className}
        disabled={Boolean(disabled) || undefined}
        onClick={onClick}
        aria-label={ariaLabel || title}
        title={title}
        style={buttonStyles}
      >
        {icon && <span slot="icon">{icon}</span>}
        {children}
        {trailingIcon && <span slot="trailing-icon">{trailingIcon}</span>}
      </md-text-button>
    );
  }

  return (
    <md-filled-button
      ref={ref as any}
      id={id}
      className={className}
      disabled={Boolean(disabled) || undefined}
      onClick={onClick}
      aria-label={ariaLabel || title}
      title={title}
      style={buttonStyles}
    >
      {icon && <span slot="icon">{icon}</span>}
      {children}
      {trailingIcon && <span slot="trailing-icon">{trailingIcon}</span>}
    </md-filled-button>
  );
});

export default Material3Button;
