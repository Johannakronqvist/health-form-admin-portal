import { useId, type AnchorHTMLAttributes, type ReactNode } from 'react';
import type { HeadingLevel, IconComponent, NavigateHandler, NavLink } from '@/components/types';
import styles from './SideNav.module.css';

/*
  Side menu in a nav landmark. The current page gets aria-current="page" and is
  marked with fill and weight. Each item can have an icon
  before its label.
*/

export interface NavItemProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  /** Sets aria-current="page". */
  current?: boolean;
  /** Optional, shown before the label. */
  icon?: IconComponent;
  children?: ReactNode;
}

export function NavItem({ href, current = false, icon: Icon, children, className, ...rest }: NavItemProps) {
  return (
    <a
      href={href}
      className={[styles.item, current && styles.current, className].filter(Boolean).join(' ')}
      aria-current={current ? 'page' : undefined}
      {...rest}
    >
      {Icon && <Icon size={18} className={styles.icon} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </a>
  );
}

export interface SideNavGroup {
  label?: string;
  items: NavLink[];
}

export interface SideNavProps {
  groups?: SideNavGroup[];
  currentHref?: string;
  onNavigate?: NavigateHandler;
  /** Names the nav landmark, e.g. "Huvudmeny". */
  label?: string;
  /** Group labels are plain text unless a level is given. */
  headingLevel?: HeadingLevel;
  /** Icons only. The names stay for screen readers, so give every item an icon. */
  collapsed?: boolean;
}

export function SideNav({
  groups = [],
  currentHref,
  onNavigate,
  label = 'Sections',
  headingLevel,
  collapsed = false,
}: SideNavProps) {
  const id = useId();
  const GroupLabel = headingLevel ? (`h${headingLevel}` as const) : 'div';

  return (
    <nav aria-label={label} className={[styles.nav, collapsed && styles.collapsed].filter(Boolean).join(' ')}>
      {groups.map((group, gi) => {
        const labelId = `${id}-group-${gi}`;
        return (
          <div key={group.label || gi} className={styles.group}>
            {group.label && (
              <GroupLabel id={labelId} className={styles.groupLabel}>
                {group.label}
              </GroupLabel>
            )}
            <ul className={styles.list} aria-labelledby={group.label ? labelId : undefined}>
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavItem
                    href={item.href}
                    icon={item.icon}
                    current={item.href === currentHref}
                    onClick={onNavigate && ((e) => onNavigate(item.href, e))}
                  >
                    {item.label}
                  </NavItem>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
