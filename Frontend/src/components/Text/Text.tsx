import type { ElementType, HTMLAttributes, JSX, ReactNode } from 'react';
import type { FontSize, TypeTone } from '@/components/types';
import styles from './Text.module.css';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
  size?: FontSize;
  tone?: TypeTone;
  weight?: 'regular' | 'medium' | 'semibold';
  /** Caps the line length. */
  measure?: boolean;
  children?: ReactNode;
}

export function Text({
  as = 'p',
  size = 'base',
  tone = 'default',
  weight = 'regular',
  measure = false,
  children,
  className,
  ...rest
}: TextProps) {
  const Tag = as as ElementType;
  const classes = [
    styles.text,
    styles[`fs-${size}`],
    styles[tone],
    styles[weight],
    measure && styles.measure,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
