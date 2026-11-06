import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState, useSyncExternalStore, type MouseEvent, type ReactNode } from 'react';
import { Avatar } from '@/components/Avatar/Avatar';
import { SideNav } from '@/components/SideNav/SideNav';
import { SkipLink } from '@/components/SkipLink/SkipLink';
import { Text } from '@/components/Text/Text';
import type { NavLink } from '@/components/types';
import styles from './AppLayout.module.css';

export type NavLinkItem = NavLink;

interface AppLayoutProps {
  /** Give every item an icon: the collapsed menu shows only icons. */
  navItems: NavLinkItem[];
  currentHref: string;
  onNavigate: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Shown at the top of the sidebar. Leave out while it's loading. */
  user?: { name: string; title: string };
  /** Shown under the menu, e.g. the company list on the Företag pages. Hidden when collapsed. */
  subnav?: ReactNode;
  children: ReactNode;
}

const COLLAPSED_KEY = 'sidebar-collapsed';

// localStorage can throw (private windows, blocked storage), and then the menu just starts expanded
function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

// Below this width (phones) the sidebar sits on top of the content, so it can't collapse
const WIDE_QUERY = '(min-width: 600px)';

function subscribeToWidth(onChange: () => void) {
  if (typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

const isWide = () => (typeof window.matchMedia === 'function' ? window.matchMedia(WIDE_QUERY).matches : true);

export function AppLayout({ navItems, currentHref, onNavigate, user, subnav, children }: AppLayoutProps) {
  const [collapsedChoice, setCollapsedChoice] = useState(readCollapsed);
  const wide = useSyncExternalStore(subscribeToWidth, isWide);
  const collapsed = collapsedChoice && wide;

  function toggle() {
    const next = !collapsed;
    setCollapsedChoice(next);
    try {
      localStorage.setItem(COLLAPSED_KEY, String(next));
    } catch {
      // Not remembered, but the menu still collapses
    }
  }

  return (
    <div className={[styles.layout, collapsed && styles.collapsed].filter(Boolean).join(' ')}>
      <SkipLink href="#main">Hoppa till huvudinnehållet</SkipLink>

      {/* theme-sidebar (styles/tokens.css) switches the tokens to the navy sidebar colours */}
      <aside className={`theme-sidebar ${styles.sidebar}`}>
        <div className={styles.top}>
          <span className={styles.brand}>Hälsoportalen</span>
          <button
            type="button"
            className={styles.toggle}
            onClick={toggle}
            aria-label={collapsed ? 'Fäll ut menyn' : 'Fäll in menyn'}
          >
            {collapsed ? (
              <PanelLeftOpen size={20} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={20} aria-hidden="true" />
            )}
          </button>
        </div>

        {user && (
          <div className={styles.user}>
            <Avatar name={user.name} tone="accent" />
            <div className={styles.userText}>
              <Text weight="semibold">{user.name}</Text>
              <Text size="sm" tone="muted">
                {user.title}
              </Text>
            </div>
          </div>
        )}

        <SideNav
          label="Huvudmeny"
          groups={[{ label: 'Meny', items: navItems }]}
          currentHref={currentHref}
          onNavigate={onNavigate}
          collapsed={collapsed}
        />

        {subnav && !collapsed && <div className={styles.subnav}>{subnav}</div>}

        {/* No login in the mock API, so "Logga ut" has nowhere to go yet */}
        <button type="button" className={styles.logout}>
          <LogOut size={20} className={styles.logoutIcon} aria-hidden="true" />
          <span className={styles.logoutText}>Logga ut</span>
        </button>
      </aside>

      <main id="main" tabIndex={-1} className={styles.main}>
        {children}
      </main>
    </div>
  );
}
