import type { NavigateHandler } from '@/components/types';
import styles from './Breadcrumbs.module.css';

export interface CrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items?: CrumbItem[];
  /** Names the nav landmark, e.g. "Brödsmulor". */
  label?: string;
  /** Called when a link is clicked, so the page can route client-side (like SideNav). */
  onNavigate?: NavigateHandler;
}

/**
 * An ordered list in a nav landmark; the last item is the current page and not a link.
 * Grey text with "/" between the items.
 */
export function Breadcrumbs({ items = [], label = 'Breadcrumb', onNavigate }: BreadcrumbsProps) {
  return (
    <nav aria-label={label}>
      <ol className={styles.list}>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.href || item.label} className={styles.item}>
              {last ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <>
                  <a
                    className={styles.link}
                    href={item.href}
                    onClick={onNavigate && item.href ? (e) => onNavigate(item.href!, e) : undefined}
                  >
                    {item.label}
                  </a>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
