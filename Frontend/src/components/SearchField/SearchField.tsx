import { Search, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import fieldStyles from '@/components/Field/Field.module.css';
import styles from './SearchField.module.css';

/*
  Search input in its own search landmark. Escape clears it, and the number of
  results is announced politely when it changes.
*/

export interface SearchFieldProps {
  label?: string;
  hint?: string;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  hideLabel?: boolean;
  clearLabel?: string;
  /** Called on every change, on Enter and when cleared. */
  onSearch?: (value: string) => void;
  /** Announced politely when it changes. */
  resultCount?: number;
  resultLabel?: (count: number) => string;
  /** Controlled value. Leave undefined to use defaultValue. */
  value?: string;
  name?: string;
}

export function SearchField({
  label = 'Search',
  hint,
  placeholder = 'Search...',
  defaultValue = '',
  disabled = false,
  hideLabel = false,
  clearLabel = 'Clear search',
  onSearch,
  resultCount,
  resultLabel,
  value: controlledValue,
  name,
}: SearchFieldProps) {
  const id = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = hint ? `${id}-hint` : undefined;

  const change = (next: string) => {
    setInternalValue(next);
    onSearch?.(next);
  };
  const clear = () => {
    change('');
    inputRef.current?.focus();
  };

  const status =
    resultCount == null
      ? ''
      : resultLabel
        ? resultLabel(resultCount)
        : `${resultCount} ${resultCount === 1 ? 'result' : 'results'}`;

  return (
    // aria-label names the landmark, so several searches on one page stay distinguishable
    <div className={fieldStyles.field} role="search" aria-label={label}>
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : fieldStyles.label}>
        {label}
      </label>
      {hint && (
        <div id={hintId} className={fieldStyles.hint}>
          {hint}
        </div>
      )}
      <div className={styles.wrap}>
        <Search size={16} className={styles.icon} aria-hidden="true" />
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="search"
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          aria-describedby={hintId}
          onChange={(e) => change(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSearch?.(value);
            }
            if (e.key === 'Escape' && value) {
              e.preventDefault();
              clear();
            }
          }}
          className={`${fieldStyles.input} ${styles.input}`}
        />
        {value && !disabled && (
          <button type="button" className={styles.clear} onClick={clear} aria-label={clearLabel}>
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>
      {resultCount != null && (
        <div className={fieldStyles.hint} role="status">
          {status}
        </div>
      )}
    </div>
  );
}
