import React, { useEffect, useRef, useImperativeHandle } from 'react';
import { useTheme } from '@mui/material/styles';
import '@material/web/switch/switch.js';
import type { MdSwitch } from '@material/web/switch/switch.js';

// Augment JSX namespace for <md-switch> custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-switch': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        selected?: boolean;
        icons?: boolean;
        'show-only-selected-icon'?: boolean;
        showOnlySelectedIcon?: boolean;
        disabled?: boolean;
        value?: string;
        name?: string;
        'touch-target'?: string;
      };
    }
  }
}

export interface Material3SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (event: { target: { checked: boolean; name?: string; value?: string } }) => void;
  disabled?: boolean;
  name?: string;
  value?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  sx?: any;
  'aria-label'?: string;
}

export const Material3Switch = React.forwardRef<any, Material3SwitchProps>((props, ref) => {
  const {
    checked,
    defaultChecked,
    onChange,
    disabled = false,
    name,
    value,
    id,
    className,
    style,
    'aria-label': ariaLabel,
  } = props;

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const switchRef = useRef<MdSwitch | null>(null);

  useImperativeHandle(ref, () => switchRef.current);

  // Sync controlled state and attributes to custom element
  useEffect(() => {
    const el = switchRef.current;
    if (!el) return;

    if (checked !== undefined && el.selected !== Boolean(checked)) {
      el.selected = Boolean(checked);
    }
    el.disabled = Boolean(disabled);
    el.icons = true;
    el.showOnlySelectedIcon = true;
  }, [checked, disabled]);

  // Listen to native change events dispatched by <md-switch>
  useEffect(() => {
    const el = switchRef.current;
    if (!el) return;

    const handleChange = () => {
      if (onChange) {
        onChange({
          target: {
            checked: el.selected,
            name,
            value,
          },
        });
      }
    };

    el.addEventListener('change', handleChange);
    return () => {
      el.removeEventListener('change', handleChange);
    };
  }, [onChange, name, value]);

  const initialSelected = checked !== undefined ? Boolean(checked) : Boolean(defaultChecked);

  // Official Google Material Design 3 Switch CSS Custom Properties
  // Styled to match the application's clean monochrome aesthetic
  const switchStyles: React.CSSProperties = {
    margin: 0,
    verticalAlign: 'middle',
    cursor: disabled ? 'default' : 'pointer',

    // Selected track (Solid high-contrast monochrome)
    '--md-switch-selected-track-color': isDark ? '#ffffff' : '#000000',
    '--md-switch-selected-hover-track-color': isDark ? '#ffffff' : '#000000',
    '--md-switch-selected-focus-track-color': isDark ? '#ffffff' : '#000000',
    '--md-switch-selected-pressed-track-color': isDark ? '#ffffff' : '#000000',

    // Selected handle / thumb (Inverted for maximum contrast against track)
    '--md-switch-selected-handle-color': isDark ? '#1c1c1e' : '#ffffff',
    '--md-switch-selected-hover-handle-color': isDark ? '#1c1c1e' : '#ffffff',
    '--md-switch-selected-focus-handle-color': isDark ? '#1c1c1e' : '#ffffff',
    '--md-switch-selected-pressed-handle-color': isDark ? '#1c1c1e' : '#ffffff',

    // Selected checkmark icon (Crisp SVG icon matching track)
    '--md-switch-selected-icon-color': isDark ? '#ffffff' : '#000000',
    '--md-switch-selected-hover-icon-color': isDark ? '#ffffff' : '#000000',
    '--md-switch-selected-focus-icon-color': isDark ? '#ffffff' : '#000000',
    '--md-switch-selected-pressed-icon-color': isDark ? '#ffffff' : '#000000',

    // Unselected track
    '--md-switch-track-color': isDark ? '#322f35' : '#e6e0e9',
    '--md-switch-hover-track-color': isDark ? '#3b383f' : '#ded8e2',
    '--md-switch-focus-track-color': isDark ? '#322f35' : '#e6e0e9',
    '--md-switch-pressed-track-color': isDark ? '#322f35' : '#e6e0e9',

    // Unselected track outline
    '--md-switch-track-outline-color': isDark ? '#938f99' : '#79747e',
    '--md-switch-hover-track-outline-color': isDark ? '#cac4d0' : '#49454f',
    '--md-switch-focus-track-outline-color': isDark ? '#938f99' : '#79747e',
    '--md-switch-pressed-track-outline-color': isDark ? '#938f99' : '#79747e',

    // Unselected handle
    '--md-switch-handle-color': isDark ? '#938f99' : '#79747e',
    '--md-switch-hover-handle-color': isDark ? '#cac4d0' : '#49454f',
    '--md-switch-focus-handle-color': isDark ? '#938f99' : '#79747e',
    '--md-switch-pressed-handle-color': isDark ? '#938f99' : '#79747e',

    // Ripples
    '--md-switch-selected-hover-state-layer-color': isDark ? '#ffffff' : '#000000',
    '--md-switch-selected-pressed-state-layer-color': isDark ? '#ffffff' : '#000000',
    '--md-switch-hover-state-layer-color': isDark ? '#ffffff' : '#000000',
    '--md-switch-pressed-state-layer-color': isDark ? '#ffffff' : '#000000',

    // Focus ring
    '--md-focus-ring-color': isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',

    // Disabled state
    '--md-switch-disabled-track-opacity': 0.12,
    '--md-switch-disabled-selected-track-color': isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
    '--md-switch-disabled-handle-color': isDark ? 'rgba(255, 255, 255, 0.38)' : 'rgba(0, 0, 0, 0.38)',
    '--md-switch-disabled-selected-handle-color': isDark ? '#1c1c1e' : '#ffffff',
    '--md-switch-disabled-selected-icon-color': isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',

    ...style,
  } as React.CSSProperties;

  return (
    <md-switch
      ref={switchRef}
      id={id}
      className={className}
      selected={initialSelected || undefined}
      disabled={Boolean(disabled) || undefined}
      icons
      show-only-selected-icon
      aria-label={ariaLabel}
      style={switchStyles}
    />
  );
});

export default Material3Switch;
