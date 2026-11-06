import type { ComponentType, MouseEvent, ReactNode } from 'react';

/** An icon component for leftIcon / rightIcon / icon props. Every lucide-react icon fits. */
export type IconComponent = ComponentType<{ size?: number | string; className?: string }>;

/** The three control sizes. Avatar adds "xl". */
export type Size = 'sm' | 'md' | 'lg';

/** A union rather than number, so `h${level}` is a valid element type. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

export type FontSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';

export type TypeTone = 'default' | 'muted' | 'accent';

/** An option in a RadioGroup. */
export interface SelectOption {
  value: string;
  label: string;
}

export interface NavLink {
  href: string;
  label: ReactNode;
  icon?: IconComponent;
}

/** The event lets the caller preventDefault and route client-side. */
export type NavigateHandler = (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
