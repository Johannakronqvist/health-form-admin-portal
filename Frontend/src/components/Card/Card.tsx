import type { ElementType, HTMLAttributes, JSX, ReactNode } from 'react';
import type { HeadingLevel } from '@/components/types';
import styles from './Card.module.css';

/*
  A surface. title renders a real heading at the level you pass, so the card is
  findable in the heading order. It takes no onClick: a clickable card is a link
  or a button, so put a real control inside it.
*/

/** `title` is a heading here, not the tooltip attribute, so it's omitted from the HTML attributes. */
export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  as?: keyof JSX.IntrinsicElements;
  title?: ReactNode;
  headingLevel?: HeadingLevel;
  footer?: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

export function Card({
  as = 'div',
  title,
  headingLevel = 3,
  footer,
  padding = 'md',
  children,
  className,
  ...rest
}: CardProps) {
  const Tag = as as ElementType;
  const Heading = `h${headingLevel}` as const;
  return (
    <Tag className={[styles.card, styles[padding], className].filter(Boolean).join(' ')} {...rest}>
      {title && <Heading className={styles.title}>{title}</Heading>}
      {children}
      {footer && <div className={styles.footer}>{footer}</div>}
    </Tag>
  );
}
