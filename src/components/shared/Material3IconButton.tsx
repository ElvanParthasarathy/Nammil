import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material/styles';
import '@material/web/iconbutton/icon-button.js';
import type { MdIconButton } from '@material/web/iconbutton/icon-button.js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-icon-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        'aria-label'?: string;
        title?: string;
      };
    }
  }
}

export interface Material3IconButtonProps {
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  title?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  sx?: any;
  color?: string;
  'aria-label'?: string;
}

export const Material3IconButton = forwardRef<HTMLElement, Material3IconButtonProps>((props, ref) => {
  const {
    children,
    onClick,
    disabled = false,
    size = 'medium',
    title,
    id,
    className,
    style,
    sx,
    color,
    'aria-label': ariaLabel,
  } = props;

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Sizing mapping
  const dimension = size === 'small' ? 32 : size === 'large' ? 44 : 36;
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  // Extract SX properties if passed
  const sxBgColor = sx?.bgcolor || (typeof sx?.backgroundColor === 'string' ? sx.backgroundColor : undefined);
  const sxColor = sx?.color || color;
  const sxPadding = sx?.padding || sx?.p;
  const sxMr = sx?.mr !== undefined ? (typeof sx.mr === 'number' ? `${sx.mr * 8}px` : sx.mr) : undefined;
  const sxMl = sx?.ml !== undefined ? (typeof sx.ml === 'number' ? `${sx.ml * 8}px` : sx.ml) : undefined;

  const buttonStyles: React.CSSProperties = {
    // Preserve layout & positioning
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${dimension}px`,
    height: `${dimension}px`,
    margin: 0,
    marginRight: sxMr,
    marginLeft: sxMl,
    padding: sxPadding || 0,
    verticalAlign: 'middle',
    borderRadius: '50%',
    backgroundColor: sxBgColor || 'transparent',
    cursor: disabled ? 'default' : 'pointer',
    flexShrink: 0,

    // Google M3 Icon Button tokens
    '--md-icon-button-state-layer-width': `${dimension}px`,
    '--md-icon-button-state-layer-height': `${dimension}px`,
    '--md-icon-button-icon-size': `${iconSize}px`,
    '--md-icon-button-icon-color': sxColor || (isDark ? '#ffffff' : '#000000'),
    '--md-icon-button-hover-icon-color': sx?.['&:hover']?.color || sxColor || (isDark ? '#ffffff' : '#000000'),
    '--md-icon-button-focus-icon-color': sxColor || (isDark ? '#ffffff' : '#000000'),
    '--md-icon-button-pressed-icon-color': sxColor || (isDark ? '#ffffff' : '#000000'),

    // Ripples
    '--md-icon-button-hover-state-layer-color': isDark ? '#ffffff' : '#000000',
    '--md-icon-button-pressed-state-layer-color': isDark ? '#ffffff' : '#000000',
    '--md-icon-button-hover-state-layer-opacity': '0.08',
    '--md-icon-button-pressed-state-layer-opacity': '0.12',

    // Focus ring
    '--md-focus-ring-color': isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',

    ...style,
  } as React.CSSProperties;

  return (
    <md-icon-button
      ref={ref as any}
      id={id}
      className={className}
      disabled={Boolean(disabled) || undefined}
      onClick={onClick}
      aria-label={ariaLabel || title}
      title={title}
      style={buttonStyles}
    >
      {children}
    </md-icon-button>
  );
});

export default Material3IconButton;
