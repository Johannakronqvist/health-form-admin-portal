import type { ReactNode } from 'react';
import styles from './SkipLink.module.css';

export interface SkipLinkProps {
  href?: string;
  children?: ReactNode;
}

/** The first Tab stop on the page; jumps past the menu to the main content. */
export function SkipLink({ href = '#main', children = 'Skip to main content' }: SkipLinkProps) {
  return (
    <a className={styles.skipLink} href={href}>
      {children}
    </a>
  );
}
