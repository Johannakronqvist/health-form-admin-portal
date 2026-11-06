import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import type { AlertTone, IconComponent } from '@/components/types';
import styles from './Alert.module.css';

/*
  Message with an icon and a title.
  Pass live="assertive" (role=alert) or live="polite" (role=status) when it
  appears after an action; leave it out for content that's there on load.
*/

const ICON: Record<AlertTone, IconComponent> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
};

export interface AlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
  /** How the alert is announced. Omit for content present on load. */
  live?: 'polite' | 'assertive' | 'off';
}

export function Alert({ tone = 'info', title, children, onDismiss, dismissLabel, live }: AlertProps) {
  const Icon = ICON[tone];
  const role = live === 'assertive' ? 'alert' : live === 'polite' ? 'status' : undefined;
  const colors = {
    background: `var(--al-${tone}-bg)`,
    borderColor: `var(--al-${tone}-border)`,
    '--alert-bg': `var(--al-${tone}-bg)`,
    '--alert-head': `var(--al-${tone}-head)`,
    '--alert-body': `var(--al-${tone}-body)`,
  } as CSSProperties;

  return (
    <div className={styles.alert} role={role} style={colors}>
      <Icon className={styles.icon} size={23} aria-hidden="true" />
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.text}>{children}</div>}
      </div>
      {onDismiss && (
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label={dismissLabel || 'Dismiss'}>
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
