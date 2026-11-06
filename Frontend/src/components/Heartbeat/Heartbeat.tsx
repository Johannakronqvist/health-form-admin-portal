import type { CSSProperties } from 'react';
import styles from './Heartbeat.module.css';

/*
  Saving decoration, aria-hidden: pair it with status text in a role="status" element.
  Used by Button's loading state and Spinner.
*/

/** One beat in the 28x16 icon box: flat, small bump, spike, flat. */
const MARK_PATH = 'M0 9.5H9.9l1.8-2.3 1.8 2.3h1.4l1.8-7.2 2.3 11.8 1.8-6.3 1.8 1.8H28';

export interface HeartbeatMarkProps {
  /** Height in px. Defaults to 16, the size in the Spara button. */
  size?: number;
  className?: string;
}

export function HeartbeatMark({ size, className }: HeartbeatMarkProps) {
  const style: CSSProperties | undefined = size ? { width: size * 1.75, height: size } : undefined;
  return (
    <svg
      className={[styles.mark, className].filter(Boolean).join(' ')}
      style={style}
      viewBox="0 0 28 16"
      aria-hidden="true"
      focusable="false"
    >
      <path d={MARK_PATH} pathLength={100} />
    </svg>
  );
}
