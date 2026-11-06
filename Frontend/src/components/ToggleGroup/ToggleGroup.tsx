import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { IconComponent, Size } from '@/components/types';
import styles from './ToggleGroup.module.css';

/*
  Segmented control for choosing one of a few options (a radiogroup). One Tab
  stop; arrow keys, Home and End move the selection.
*/

export interface ToggleOption<T extends string | number = string> {
  value: T;
  label?: ReactNode;
  icon?: IconComponent;
  /** Accessible name when the visible label is an icon or an abbreviation. */
  ariaLabel?: string;
}

export interface ToggleGroupProps<T extends string | number = string> {
  label: string;
  options?: ToggleOption<T>[];
  defaultValue?: T;
  onChange?: (value: T) => void;
  size?: Size;
  hideLabel?: boolean;
}

export function ToggleGroup<T extends string | number = string>({
  label,
  options = [],
  defaultValue,
  onChange,
  size = 'md',
  hideLabel = true,
}: ToggleGroupProps<T>) {
  const id = useId();
  const [value, setValue] = useState<T | undefined>(defaultValue ?? options[0]?.value);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (next: T) => {
    setValue(next);
    onChange?.(next);
  };
  const move = (to: number) => {
    const i = (to + options.length) % options.length;
    refs.current[i]?.focus();
    select(options[i].value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        move(i + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        move(i - 1);
        break;
      case 'Home':
        e.preventDefault();
        move(0);
        break;
      case 'End':
        e.preventDefault();
        move(options.length - 1);
        break;
      default:
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={hideLabel ? label : undefined}
      aria-labelledby={hideLabel ? undefined : `${id}-label`}
      className={[styles.group, styles[size]].join(' ')}
    >
      {!hideLabel && (
        <span id={`${id}-label`} className="visually-hidden">
          {label}
        </span>
      )}
      {options.map((o, i) => {
        const checked = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={checked}
            ref={(el) => {
              refs.current[i] = el;
            }}
            tabIndex={checked ? 0 : -1}
            className={[styles.segment, checked && styles.checked].filter(Boolean).join(' ')}
            aria-label={o.ariaLabel}
            onClick={() => select(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {Icon && <Icon size={15} aria-hidden="true" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
