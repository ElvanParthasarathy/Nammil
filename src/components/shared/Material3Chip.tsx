import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material/styles';
import '@material/web/chips/filter-chip.js';
import '@material/web/chips/assist-chip.js';
import '@material/web/chips/chip-set.js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-filter-chip': any;
      'md-assist-chip': any;
      'md-chip-set': any;
    }
  }
}

export interface Material3ChipProps {
  label: React.ReactNode;
  selected?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  showCheckmark?: boolean;
  icon?: React.ReactNode;
  sx?: any;
  style?: React.CSSProperties;
  className?: string;
}

export const Material3Chip = forwardRef<any, Material3ChipProps>((props, ref) => {
  const {
    label,
    selected = false,
    onClick,
    disabled = false,
    showCheckmark = false,
    icon,
    sx,
    style,
    className,
  } = props;

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const borderRadius = sx?.borderRadius || '100px';
  const height = sx?.height || '32px';
  const fontSize = sx?.fontSize || '13px';
  const fontWeight = sx?.fontWeight || 500;

  // Exact color matching
  const selectedBg = selected && sx?.bgcolor ? sx.bgcolor : (isDark ? '#ffffff' : '#000000');
  const unselectedBg = !selected && sx?.bgcolor ? sx.bgcolor : (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)');
  const selectedColor = selected && sx?.color ? sx.color : (isDark ? '#000000' : '#ffffff');
  const unselectedColor = !selected && sx?.color ? sx.color : 'var(--mac-text)';

  const chipStyles: React.CSSProperties = {
    // Shape & size tokens
    '--md-filter-chip-container-shape': borderRadius,
    '--md-filter-chip-container-height': typeof height === 'number' ? `${height}px` : height,
    '--md-filter-chip-label-text-size': typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
    '--md-filter-chip-label-text-weight': `${fontWeight}`,
    '--md-filter-chip-label-text-font': 'inherit',

    // Colors
    '--md-filter-chip-selected-container-color': selectedBg,
    '--md-filter-chip-selected-label-text-color': selectedColor,
    '--md-filter-chip-unselected-container-color': unselectedBg,
    '--md-filter-chip-unselected-label-text-color': unselectedColor,

    // Border / Outline suppression
    '--md-filter-chip-outline-width': '0px',
    '--md-filter-chip-selected-outline-width': '0px',
    '--md-filter-chip-outline-color': 'transparent',

    // Ripple / Hover
    '--md-filter-chip-hover-state-layer-opacity': '0.08',
    '--md-filter-chip-hover-state-layer-color': isDark ? '#ffffff' : '#000000',

    cursor: 'pointer',
    flexShrink: sx?.flexShrink !== undefined ? sx.flexShrink : undefined,
    ...style,
  } as React.CSSProperties;

  return (
    <md-filter-chip
      ref={ref}
      label={typeof label === 'string' ? label : undefined}
      selected={selected || undefined}
      disabled={disabled || undefined}
      onClick={onClick}
      className={className}
      style={chipStyles}
    >
      {typeof label !== 'string' && <span slot="label">{label}</span>}
      {icon && <span slot="icon">{icon}</span>}
      {!showCheckmark && <span slot="selected-icon" style={{ display: 'none' }} />}
    </md-filter-chip>
  );
});

export default Material3Chip;
