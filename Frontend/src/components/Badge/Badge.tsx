import { X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import type { BadgeTone } from '@/components/types';
import styles from './Badge.module.css';

/*
  Small label.
  With onRemove it becomes a tag with a real remove button.
*/

export interface BadgeProps {
  tone?: BadgeTone;
  variant?: 'solid' | 'soft';
  children?: ReactNode;
  onRemove?: () => void;
  /** Required with onRemove, e.g. "Ta bort Fysisk arbetsmiljö". */
  removeLabel?: string;
}

export function Badge({ tone = 'neutral', variant = 'solid', children, onRemove, removeLabel }: BadgeProps) {
  const colors: CSSProperties =
    variant === 'soft'
      ? { background: `var(--bd-${tone}-sb)`, color: `var(--bd-${tone}-sf)` }
      : { background: `var(--bd-${tone}-lb)`, color: `var(--bd-${tone}-lf)` };
  return (
    <span className={styles.badge} style={colors}>
      {children}
      {onRemove && (
        <button type="button" className={styles.remove} onClick={onRemove} aria-label={removeLabel || 'Remove'}>
          <X size={12} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
