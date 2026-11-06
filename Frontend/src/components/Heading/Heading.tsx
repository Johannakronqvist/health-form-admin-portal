import type { HTMLAttributes, ReactNode, Ref } from 'react';
import type { FontSize, HeadingLevel, TypeTone } from '@/components/types';
import styles from './Heading.module.css';

const SIZE_FOR_LEVEL: Record<HeadingLevel, FontSize> = {
  1: '2xl',
  2: 'xl',
  3: 'lg',
  4: 'base',
  5: 'base',
  6: 'sm',
};

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** The outline position. Set `size` separately to change how big it looks. */
  level?: HeadingLevel;
  size?: FontSize;
  tone?: TypeTone;
  children?: ReactNode;
  /** Lets a page move focus to the heading. */
  ref?: Ref<HTMLHeadingElement>;
}

export function Heading({ level = 2, size, tone = 'default', children, className, ...rest }: HeadingProps) {
  const Tag = `h${level}` as const;
  const resolved = size || SIZE_FOR_LEVEL[level];
  return (
    <Tag
      className={[styles.heading, styles[`fs-${resolved}`], styles[tone], className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}
