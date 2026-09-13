import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { useTheme } from '@mui/material/styles';
import '@material/web/dialog/dialog.js';
import type { MdDialog } from '@material/web/dialog/dialog.js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-dialog': any;
    }
  }
}

export interface Material3DialogProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  width?: number | string;
  style?: React.CSSProperties;
  sx?: any;
}

export const Material3Dialog = forwardRef<any, Material3DialogProps>((props, ref) => {
  const { open, onClose, children, width = 500, style, sx } = props;
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const innerRef = useRef<MdDialog | null>(null);

  useImperativeHandle(ref, () => innerRef.current);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    if (open) {
      if (!el.open) {
        el.show();
      }
    } else {
      if (el.open) {
        el.close();
      }
    }
  }, [open]);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const handleClosed = () => {
      onClose();
    };

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    el.addEventListener('closed', handleClosed);
    el.addEventListener('cancel', handleCancel);
    return () => {
      el.removeEventListener('closed', handleClosed);
      el.removeEventListener('cancel', handleCancel);
    };
  }, [onClose]);

  const dialogWidth = typeof width === 'number' ? `${width}px` : width;
  const bgColor = isDark ? '#202020' : '#ffffff';
  const borderRadius = '16px';

  const dialogStyles: React.CSSProperties = {
    '--md-dialog-container-shape': borderRadius,
    '--md-dialog-container-color': bgColor,
    '--md-dialog-container-max-width': dialogWidth,
    '--md-dialog-container-min-width': dialogWidth,
    width: dialogWidth,
    maxWidth: dialogWidth,
    ...style,
  } as React.CSSProperties;

  return (
    <md-dialog
      ref={innerRef}
      style={dialogStyles}
    >
      <div slot="content" style={{ margin: '-24px', padding: 0, overflow: 'hidden', borderRadius }}>
        {children}
      </div>
    </md-dialog>
  );
});

export default Material3Dialog;
