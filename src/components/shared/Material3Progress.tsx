import React, { forwardRef } from 'react';
import '@material/web/progress/circular-progress.js';
import { useTheme } from '@mui/material/styles';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-circular-progress': any;
    }
  }
}

export interface Material3CircularProgressProps {
  size?: number | string;
  value?: number;
  indeterminate?: boolean;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  sx?: any;
}

export const Material3CircularProgress = forwardRef<any, Material3CircularProgressProps>((props, ref) => {
  const {
    size = 24,
    value,
    indeterminate = value === undefined,
    color,
    className,
    style,
    sx,
  } = props;

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const indicatorColor = color || sx?.color || (isDark ? '#ffffff' : '#000000');
  const sizePx = typeof size === 'number' ? `${size}px` : size;

  const progressStyles: React.CSSProperties = {
    '--md-circular-progress-size': sizePx,
    '--md-circular-progress-active-indicator-color': indicatorColor,
    '--md-circular-progress-active-indicator-width': typeof size === 'number' && size <= 24 ? '3px' : '4px',
    display: 'inline-flex',
    verticalAlign: 'middle',
    marginRight: sx?.mr ? (typeof sx.mr === 'number' ? `${sx.mr * 8}px` : sx.mr) : undefined,
    marginLeft: sx?.ml ? (typeof sx.ml === 'number' ? `${sx.ml * 8}px` : sx.ml) : undefined,
    marginTop: sx?.mt ? (typeof sx.mt === 'number' ? `${sx.mt * 8}px` : sx.mt) : undefined,
    marginBottom: sx?.mb ? (typeof sx.mb === 'number' ? `${sx.mb * 8}px` : sx.mb) : undefined,
    ...style,
  } as React.CSSProperties;

  return (
    <md-circular-progress
      ref={ref}
      indeterminate={indeterminate || undefined}
      value={!indeterminate ? value : undefined}
      className={className}
      style={progressStyles}
    />
  );
});

export default Material3CircularProgress;
