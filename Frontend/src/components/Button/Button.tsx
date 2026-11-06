import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { HeartbeatMark } from '@/components/Heartbeat/Heartbeat';
import type { ButtonVariant, IconComponent, Size } from '@/components/types';
import styles from './Button.module.css';

const ICON: Record<Size, number> = { sm: 14, md: 16, lg: 18 };

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  size?: Size;
  /** Sets aria-busy and aria-disabled and ignores clicks, but keeps the variant colours and focus. */
  loading?: boolean;
  /**
   * With disabled: looks disabled and ignores clicks, but stays reachable with Tab and is
   * announced as unavailable. Pair it with a visible reason linked through aria-describedby.
   */
  focusableWhenDisabled?: boolean;
  iconOnly?: boolean;
  leftIcon?: IconComponent;
  rightIcon?: IconComponent;
  /** Required when iconOnly, which has no text to name it. */
  ariaLabel?: string;
  /** Defaults to "button": a bare <button> inside a form would submit it. */
  type?: 'button' | 'submit' | 'reset';
  children?: ReactNode;
  /** Lets Modal's initialFocus target a Button. */
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  focusableWhenDisabled = false,
  iconOnly = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  ariaLabel,
  onClick,
  type = 'button',
  className,
  ...rest
}: ButtonProps) {
  // Soft-disabled: can't be used, but stays in the tab order and is announced.
  const softDisabled = loading || (disabled && focusableWhenDisabled);
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    iconOnly && styles.iconOnly,
    loading && styles.loading,
    softDisabled && !loading && styles.softDisabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const iconSize = ICON[size];

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled && !focusableWhenDisabled && !loading}
      aria-disabled={softDisabled || undefined}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
      // preventDefault also stops a submit button from submitting (including Enter in a field)
      onClick={softDisabled ? (e) => e.preventDefault() : onClick}
      {...rest}
    >
      {loading ? <HeartbeatMark /> : LeftIcon ? <LeftIcon size={iconSize} /> : null}
      {!iconOnly && children}
      {!loading && RightIcon ? <RightIcon size={iconSize} /> : null}
    </button>
  );
}
