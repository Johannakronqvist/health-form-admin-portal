import { AlertCircle } from 'lucide-react';
import { useId, type InputHTMLAttributes } from 'react';
import styles from './Field.module.css';

/*
  Text input with label, hint and error. The hint and error are wired with
  aria-describedby, the error has an icon, and required is announced to screen
  readers. Controlled with value/onChange, otherwise uncontrolled with defaultValue.
*/

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'type' | 'placeholder' | 'disabled' | 'required' | 'className' | 'style'
>;

export interface FieldProps extends NativeInputProps {
  label: string;
  hint?: string;
  /** Shown in a role="alert" region and wired to aria-describedby. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  /** Controlled value. Leave undefined to use defaultValue (uncontrolled). */
  value?: string;
  onChange?: (value: string) => void;
  /** Screen-reader text after a required label. */
  requiredLabel?: string;
}

export function Field({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  type = 'text',
  placeholder,
  defaultValue,
  value,
  onChange,
  requiredLabel = '(required)',
  id: idProp,
  ...rest
}: FieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {' *'}
          </span>
        )}
        {required && <span className="visually-hidden"> {requiredLabel}</span>}
      </label>
      {hint && (
        <div id={hintId} className={styles.hint}>
          {hint}
        </div>
      )}
      <input
        {...rest}
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...(value !== undefined ? { value } : { defaultValue })}
        onChange={onChange && ((e) => onChange(e.target.value))}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        className={[styles.input, error && styles.invalid].filter(Boolean).join(' ')}
      />
      {error && (
        <div id={errorId} className={styles.error} role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </div>
      )}
    </div>
  );
}
