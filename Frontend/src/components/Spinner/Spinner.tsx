import type { HTMLAttributes } from 'react';
import { HeartbeatMark } from '@/components/Heartbeat/Heartbeat';
import type { Size } from '@/components/types';
import styles from './Spinner.module.css';

/*
  A busy indicator that says what it is: role="status" announces the label
  politely. Under reduced motion the animation stops and the label becomes
  visible.
*/

const SIZE: Record<Size, number> = { sm: 16, md: 20, lg: 28 };

export interface SpinnerProps extends HTMLAttributes<HTMLElement> {
  size?: Size;
  label?: string;
  labelVisible?: boolean;
  /** "heartbeat" draws a heartbeat; "ring" is a spinning ring. */
  variant?: 'heartbeat' | 'ring';
}

export function Spinner({
  size = 'md',
  label = 'Loading',
  labelVisible = false,
  variant = 'heartbeat',
  className,
  ...rest
}: SpinnerProps) {
  const px = SIZE[size];
  return (
    <span
      className={[styles.spinner, labelVisible && styles.labelVisible, className].filter(Boolean).join(' ')}
      role="status"
      {...rest}
    >
      {variant === 'heartbeat' ? (
        <HeartbeatMark size={px} className={styles.mark} />
      ) : (
        <svg
          className={`${styles.mark} ${styles.ring}`}
          width={px}
          height={px}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      )}
      <span className={styles.label}>{label}</span>
    </span>
  );
}
