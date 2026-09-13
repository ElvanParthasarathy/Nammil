import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { useTheme } from '@mui/material/styles';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import type { MdOutlinedSelect } from '@material/web/select/outlined-select.js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-outlined-select': any;
      'md-select-option': any;
    }
  }
}

export interface Material3SelectOptionProps {
  value: string;
  children?: React.ReactNode;
  headline?: string;
  disabled?: boolean;
}

export const Material3SelectOption: React.FC<Material3SelectOptionProps> = ({ value, children, headline, disabled }) => {
  return (
    <md-select-option value={value} disabled={disabled || undefined}>
      <div slot="headline" style={{ color: 'var(--mac-text)', fontSize: '13px' }}>
        {headline || children}
      </div>
    </md-select-option>
  );
};

export interface Material3SelectProps {
  value?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
  name?: string;
  id?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  sx?: any;
}

export const Material3Select = forwardRef<any, Material3SelectProps>((props, ref) => {
  const {
    value,
    onChange,
    disabled = false,
    size = 'small',
    name,
    id,
    children,
    style,
    sx,
  } = props;

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const innerRef = useRef<MdOutlinedSelect | null>(null);

  useImperativeHandle(ref, () => innerRef.current);

  // Synchronize value
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    if (value !== undefined && el.value !== value) {
      el.value = value;
    }
  }, [value]);

  // Handle change event
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const handleChange = (e: Event) => {
      const target = e.target as any;
      if (onChange) {
        onChange({
          target: {
            value: target.value,
            name,
          },
        });
      }
    };

    el.addEventListener('change', handleChange);
    return () => {
      el.removeEventListener('change', handleChange);
    };
  }, [onChange, name]);

  const minWidth = sx?.minWidth || 120;
  const borderRadius = sx?.borderRadius || '12px';

  const selectStyles: React.CSSProperties = {
    minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
    display: 'inline-block',
    verticalAlign: 'middle',
    color: 'var(--mac-text)',

    // Material Web Select & Field tokens
    '--md-outlined-field-container-shape': borderRadius,
    '--md-outlined-select-text-field-container-shape': borderRadius,
    '--md-outlined-field-outline-color': 'var(--mac-divider)',
    '--md-outlined-select-text-field-outline-color': 'var(--mac-divider)',
    '--md-outlined-field-hover-outline-color': 'var(--mac-text-secondary)',
    '--md-outlined-select-text-field-hover-outline-color': 'var(--mac-text-secondary)',
    '--md-outlined-field-focus-outline-color': 'var(--mac-text)',
    '--md-outlined-select-text-field-focus-outline-color': 'var(--mac-text)',
    '--md-outlined-field-input-text-color': 'var(--mac-text)',
    '--md-outlined-select-text-field-input-text-color': 'var(--mac-text)',

    // Space & height tokens for compact size
    '--md-outlined-field-top-space': size === 'small' ? '4px' : '8px',
    '--md-outlined-field-bottom-space': size === 'small' ? '4px' : '8px',
    '--md-outlined-field-leading-space': '12px',
    '--md-outlined-field-trailing-space': '12px',

    // Menu dropdown tokens
    '--md-menu-container-color': isDark ? '#2c2c2e' : '#ffffff',
    '--md-menu-container-shape': '12px',
    '--md-menu-container-elevation': '3',
    '--md-menu-item-label-text-color': 'var(--mac-text)',

    ...style,
  } as React.CSSProperties;

  return (
    <md-outlined-select
      ref={innerRef}
      id={id}
      disabled={Boolean(disabled) || undefined}
      quick
      style={selectStyles}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        // If it's already a Material3SelectOption or md-select-option, pass through
        const childProps = child.props as any;
        return (
          <md-select-option
            value={childProps.value}
            selected={childProps.value === value ? true : undefined}
            disabled={childProps.disabled || undefined}
          >
            <div slot="headline" style={{ color: 'var(--mac-text)', fontSize: '13px' }}>
              {childProps.children}
            </div>
          </md-select-option>
        );
      })}
    </md-outlined-select>
  );
});

export default Material3Select;
