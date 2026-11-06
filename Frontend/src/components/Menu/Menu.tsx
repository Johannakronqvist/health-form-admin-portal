import { ChevronDown } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useDismissable } from '@/hooks/useDismissable';
import { Button } from '@/components/Button/Button';
import type { ButtonVariant, IconComponent, Size } from '@/components/types';
import styles from './Menu.module.css';

/*
  The ARIA menu button pattern, for actions (not for picking a value).
  Open with click, Enter, Space or ArrowDown (first item) or ArrowUp (last item).
  Move with the arrows and Home/End, jump by typing, choose with Enter or Space,
  close with Escape or Tab. Focus goes back to the trigger.
  Disabled items keep their place and are announced as unavailable.
*/

export interface MenuItem {
  value?: string;
  label?: ReactNode;
  icon?: IconComponent;
  disabled?: boolean;
  /** Red, for actions like removing something. */
  destructive?: boolean;
  onSelect?: (value?: string) => void;
  /** Renders a divider instead of an item. */
  separator?: boolean;
}

export interface MenuProps {
  /** The trigger's text, or its accessible name when iconOnly. */
  label: string;
  items?: MenuItem[];
  /** Which edge of the trigger the menu lines up with. */
  align?: 'start' | 'end';
  variant?: ButtonVariant;
  size?: Size;
  icon?: IconComponent;
  /** Shows only the icon (e.g. a "more actions" button); label becomes the aria-label. */
  iconOnly?: boolean;
  showChevron?: boolean;
}

const GAP = 6;
const EDGE = 8;

export function Menu({
  label,
  items = [],
  align = 'start',
  variant = 'secondary',
  size = 'md',
  icon,
  iconOnly = false,
  showChevron = true,
}: MenuProps) {
  const id = useId();
  const menuId = `${id}-menu`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const typeahead = useRef({ text: '', time: 0 });

  // Separators can't be focused, so keyboard positions count only real items
  const focusable = items.filter((i) => !i.separator);
  const last = focusable.length - 1;

  const dismiss = useCallback(() => setOpen(false), []);
  useDismissable({ open, onDismiss: dismiss, triggerRef, contentRef });

  /*
    The menu is position: fixed next to the trigger, so a scrolling parent (like a
    table wrapper) can't clip it. It opens upwards when there's no room below.
  */
  useLayoutEffect(() => {
    if (!open) return undefined;
    const place = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      const menu = contentRef.current;
      if (!trigger || !menu) return;
      const { width, height } = menu.getBoundingClientRect();
      const below = trigger.bottom + GAP;
      const top = below + height > window.innerHeight - EDGE ? Math.max(EDGE, trigger.top - GAP - height) : below;
      const left = align === 'end' ? trigger.right - width : trigger.left;
      menu.style.top = `${top}px`;
      menu.style.left = `${Math.max(EDGE, Math.min(left, window.innerWidth - width - EDGE))}px`;
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, align]);

  useEffect(() => {
    if (open) itemRefs.current[active]?.focus({ preventScroll: true });
  }, [open, active]);

  const openAt = (i: number) => {
    setActive(i);
    setOpen(true);
  };

  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  const choose = (i: number) => {
    const item = focusable[i];
    if (!item || item.disabled) return;
    close();
    item.onSelect?.(item.value);
  };

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openAt(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openAt(last);
    }
  };

  const onMenuKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActive((a) => (a >= last ? 0 : a + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((a) => (a <= 0 ? last : a - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActive(0);
        break;
      case 'End':
        e.preventDefault();
        setActive(last);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        choose(active);
        break;
      // Tab closes and lets focus move on, instead of trapping it
      case 'Tab':
        close(false);
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const now = e.timeStamp;
          const t = typeahead.current;
          t.text = (now - t.time < 500 ? t.text : '') + e.key.toLowerCase();
          t.time = now;
          // Only string labels can be matched
          const hit = focusable.findIndex(
            (o) => typeof o.label === 'string' && o.label.toLowerCase().startsWith(t.text),
          );
          if (hit >= 0) setActive(hit);
        }
    }
  };

  return (
    <div className={styles.root}>
      <Button
        ref={triggerRef}
        id={id}
        variant={variant}
        size={size}
        iconOnly={iconOnly}
        leftIcon={icon}
        rightIcon={!iconOnly && showChevron ? ChevronDown : undefined}
        ariaLabel={iconOnly ? label : undefined}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(false) : openAt(0))}
        onKeyDown={onTriggerKeyDown}
      >
        {label}
      </Button>
      {open && (
        <ul
          ref={contentRef}
          id={menuId}
          role="menu"
          aria-labelledby={id}
          className={styles.menu}
          onKeyDown={onMenuKeyDown}
        >
          {items.map((item, i) => {
            if (item.separator) return <li key={`separator-${i}`} role="separator" className={styles.separator} />;
            const p = focusable.indexOf(item);
            const Icon = item.icon;
            return (
              <li key={item.value ?? i} role="none">
                <button
                  ref={(el) => {
                    itemRefs.current[p] = el;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  className={[styles.item, item.destructive && styles.destructive].filter(Boolean).join(' ')}
                  aria-disabled={item.disabled || undefined}
                  onClick={() => choose(p)}
                  onMouseEnter={() => setActive(p)}
                >
                  {Icon && <Icon size={16} className={styles.icon} aria-hidden="true" />}
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
