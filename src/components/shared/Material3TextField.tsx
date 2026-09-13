import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { useTheme } from '@mui/material/styles';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/textfield/filled-text-field.js';
import type { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-outlined-text-field': any;
      'md-filled-text-field': any;
    }
  }
}

export interface Material3TextFieldProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled';
  type?: string;
  name?: string;
  id?: string;
  className?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  style?: React.CSSProperties;
  sx?: any;
}

export const Material3TextField = forwardRef<any, Material3TextFieldProps>((props, ref) => {
  const {
    value,
    defaultValue,
    placeholder,
    label,
    onChange,
    onKeyDown,
    autoFocus,
    disabled = false,
    readOnly = false,
    fullWidth = false,
    variant = 'outlined',
    type = 'text',
    name,
    id,
    className,
    leadingIcon,
    trailingIcon,
    style,
    sx,
  } = props;

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const innerRef = useRef<MdOutlinedTextField | null>(null);

  useImperativeHandle(ref, () => innerRef.current);

  // Sync value to custom element
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    if (value !== undefined && el.value !== value) {
      el.value = value;
    }
  }, [value]);

  // Handle native input & change events
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (onChange) {
        onChange({
          target: {
            value: target.value,
            name,
          },
        });
      }
    };

    el.addEventListener('input', handleInput);
    return () => {
      el.removeEventListener('input', handleInput);
    };
  }, [onChange, name]);

  // Autofocus handling
  useEffect(() => {
    if (autoFocus && innerRef.current) {
      requestAnimationFrame(() => {
        innerRef.current?.focus();
      });
    }
  }, [autoFocus]);

  // Parse SX styles to match existing look 100%
  const rootSx = sx?.['& .MuiOutlinedInput-root'] || sx;
  const sxBgColor = rootSx?.bgcolor || rootSx?.backgroundColor || (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)');
  const sxColor = rootSx?.color || (isDark ? '#ffffff' : '#000000');
  const sxBorderRadius = rootSx?.borderRadius || '100px';
  const sxBorder = rootSx?.['& fieldset']?.border === 'none' ? 'none' : undefined;

  const fieldStyles: React.CSSProperties = {
    width: fullWidth ? '100%' : undefined,
    display: fullWidth ? 'block' : 'inline-block',
    verticalAlign: 'middle',
    borderRadius: sxBorderRadius,
    backgroundColor: sxBgColor,
    color: sxColor,
    boxShadow: rootSx?.boxShadow,

    // Outlined textfield custom properties
    '--md-outlined-text-field-container-shape': sxBorderRadius,
    '--md-outlined-field-container-shape': sxBorderRadius,
    '--md-outlined-field-container-color': sxBgColor,
    '--md-outlined-text-field-input-text-color': sxColor,
    '--md-outlined-text-field-input-text-placeholder-color': isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
    '--md-outlined-text-field-outline-color': sxBorder === 'none' ? 'transparent' : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'),
    '--md-outlined-field-outline-color': sxBorder === 'none' ? 'transparent' : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'),
    '--md-outlined-text-field-hover-outline-color': sxBorder === 'none' ? 'transparent' : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'),
    '--md-outlined-field-hover-outline-color': sxBorder === 'none' ? 'transparent' : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'),
    '--md-outlined-text-field-focus-outline-color': sxBorder === 'none' ? 'transparent' : (isDark ? '#ffffff' : '#000000'),
    '--md-outlined-field-focus-outline-color': sxBorder === 'none' ? 'transparent' : (isDark ? '#ffffff' : '#000000'),
    '--md-outlined-text-field-focus-outline-width': sxBorder === 'none' ? '0px' : '2px',
    '--md-outlined-field-focus-outline-width': sxBorder === 'none' ? '0px' : '2px',
    '--md-outlined-text-field-top-space': '10px',
    '--md-outlined-text-field-bottom-space': '10px',
    '--md-outlined-text-field-leading-space': '18px',
    '--md-outlined-text-field-trailing-space': '18px',
    '--md-outlined-field-top-space': '10px',
    '--md-outlined-field-bottom-space': '10px',
    '--md-outlined-field-leading-space': '18px',
    '--md-outlined-field-trailing-space': '18px',
    '--md-outlined-text-field-caret-color': isDark ? '#ffffff' : '#000000',

    ...style,
  } as React.CSSProperties;

  return (
    <md-outlined-text-field
      ref={innerRef}
      id={id}
      className={className}
      value={value !== undefined ? value : defaultValue}
      placeholder={placeholder}
      label={label}
      disabled={Boolean(disabled) || undefined}
      readOnly={Boolean(readOnly) || undefined}
      type={type}
      onKeyDown={onKeyDown}
      style={fieldStyles}
    >
      {leadingIcon && <span slot="leading-icon">{leadingIcon}</span>}
      {trailingIcon && <span slot="trailing-icon">{trailingIcon}</span>}
    </md-outlined-text-field>
  );
});

export default Material3TextField;
