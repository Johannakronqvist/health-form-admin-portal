import { useState } from 'react';
import type { SelectOption } from '@/components/types';
import styles from './RadioGroup.module.css';

/* Radio buttons in a fieldset with a legend, so the group's question is read with each option. */

export interface RadioGroupProps {
  /** Becomes the <legend>. */
  label: string;
  name: string;
  options?: SelectOption[];
  defaultValue?: string;
  /** Controlled value. Leave undefined to use defaultValue (uncontrolled). */
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  /** sm: smaller circles and text. */
  size?: 'sm' | 'md';
  weight?: 'regular' | 'medium';
}

export function RadioGroup({
  label,
  name,
  options = [],
  defaultValue,
  value,
  onChange,
  disabled = false,
  size = 'md',
  weight = 'regular',
}: RadioGroupProps) {
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const current = value ?? internalValue;

  return (
    <fieldset className={styles.group} disabled={disabled || undefined}>
      <legend className={styles.legend}>{label}</legend>
      {options.map((o) => (
        <label
          key={o.value}
          className={[styles.radio, styles[size], styles[weight], disabled && styles.disabled]
            .filter(Boolean)
            .join(' ')}
        >
          <input
            type="radio"
            className={styles.input}
            name={name}
            value={o.value}
            checked={current === o.value}
            onChange={() => {
              setInternalValue(o.value);
              onChange?.(o.value);
            }}
          />
          <span className={styles.circle} aria-hidden="true">
            <span className={styles.dot} />
          </span>
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
