import type { ReactNode } from 'react';
import styles from './layout.module.css';

/* Small layout helpers for the library's examples only. The app uses CSS Modules for layout. */

export function Row({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}

export function Column({ children }: { children: ReactNode }) {
  return <div className={styles.column}>{children}</div>;
}

export function Columns({ children, min = 240 }: { children: ReactNode; min?: number }) {
  return (
    <div
      className={styles.columns}
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))` }}
    >
      {children}
    </div>
  );
}
