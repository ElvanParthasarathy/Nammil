import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { useTheme } from '@mui/material/styles';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import type { MdMenu } from '@material/web/menu/menu.js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-menu': any;
      'md-menu-item': any;
    }
  }
}

export interface Material3MenuItemProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  sx?: any;
  style?: React.CSSProperties;
}

export const Material3MenuItem: React.FC<Material3MenuItemProps> = ({ children, onClick, disabled, sx, style }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const itemColor = sx?.color || 'var(--mac-text)';

  const itemStyles: React.CSSProperties = {
    color: itemColor,
    '--md-menu-item-label-text-color': itemColor,
    '--md-menu-item-hover-state-layer-color': isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    ...style,
  } as React.CSSProperties;

  return (
    <md-menu-item disabled={disabled || undefined} onClick={onClick} style={itemStyles}>
      <div slot="headline" style={{ fontSize: sx?.fontSize || '14px', fontWeight: sx?.fontWeight || 500 }}>
        {children}
      </div>
    </md-menu-item>
  );
};

export interface Material3MenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  PaperProps?: any;
  style?: React.CSSProperties;
  sx?: any;
}

export const Material3Menu = forwardRef<any, Material3MenuProps>((props, ref) => {
  const { anchorEl, open, onClose, children, PaperProps, style, sx } = props;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const menuRef = useRef<MdMenu | null>(null);

  useImperativeHandle(ref, () => menuRef.current);

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;

    if (anchorEl) {
      el.anchorElement = anchorEl;
    }

    if (open) {
      el.open = true;
    } else {
      el.open = false;
    }
  }, [open, anchorEl]);

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;

    const handleClosed = () => {
      onClose();
    };

    el.addEventListener('closed', handleClosed);
    return () => {
      el.removeEventListener('closed', handleClosed);
    };
  }, [onClose]);

  const paperSx = PaperProps?.sx || sx;
  const containerBg = paperSx?.bgcolor || (isDark ? '#2c2c2e' : '#ffffff');
  const containerShape = paperSx?.borderRadius || '16px';

  const menuStyles: React.CSSProperties = {
    '--md-menu-container-color': containerBg,
    '--md-menu-container-shape': containerShape,
    '--md-menu-container-elevation': '3',
    minWidth: paperSx?.minWidth || '160px',
    boxShadow: paperSx?.boxShadow || (isDark ? '0 8px 32px rgba(0,0,0,0.6)' : '0 8px 32px rgba(0,0,0,0.15)'),
    ...style,
  } as React.CSSProperties;

  return (
    <md-menu
      ref={menuRef}
      has-overflow
      positioning="popover"
      style={menuStyles}
    >
      {children}
    </md-menu>
  );
});

export default Material3Menu;
