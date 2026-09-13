import React, { forwardRef } from 'react';
import '@material/web/divider/divider.js';
import { useTheme } from '@mui/material/styles';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-divider': any;
    }
  }
}

export interface Material3DividerProps {
  inset?: boolean;
  insetStart?: boolean;
  insetEnd?: boolean;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  sx?: any;
}

export const Material3Divider = forwardRef<any, Material3DividerProps>((props, ref) => {
  const {
    inset = false,
    insetStart = false,
    insetEnd = false,
    color,
    className,
    style,
    sx,
  } = props;

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const borderColor = color || sx?.borderColor || (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)');

  const mx = sx?.mx ? (typeof sx.mx === 'number' ? `${sx.mx * 8}px` : sx.mx) : undefined;
  const my = sx?.my ? (typeof sx.my === 'number' ? `${sx.my * 8}px` : sx.my) : undefined;

  const dividerStyles: React.CSSProperties = {
    '--md-divider-color': borderColor,
    '--md-divider-thickness': '1px',
    display: 'block',
    marginLeft: mx,
    marginRight: mx,
    marginTop: my,
    marginBottom: my,
    ...style,
  } as React.CSSProperties;

  return (
    <md-divider
      ref={ref}
      inset={inset || undefined}
      inset-start={insetStart || undefined}
      inset-end={insetEnd || undefined}
      className={className}
      style={dividerStyles}
    />
  );
});

export default Material3Divider;
