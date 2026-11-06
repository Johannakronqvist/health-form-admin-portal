import type { HTMLAttributes } from 'react';
import type { Size } from '@/components/types';
import styles from './Avatar.module.css';

/*
  A person as a picture or initials. Beside the person's name it's decorative,
  so alt="" by default and the initials are aria-hidden. Pass alt when the
  avatar is the only thing that identifies the person.
*/

export type AvatarSize = Size | 'xl';

const SIZE: Record<AvatarSize, number> = { sm: 24, md: 36, lg: 48, xl: 64 };

function initialsFrom(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase();
}

export interface AvatarProps extends HTMLAttributes<HTMLElement> {
  /** Gives the initials when there is no src. */
  name: string;
  src?: string;
  alt?: string;
  size?: AvatarSize;
  tone?: 'accent' | 'neutral';
}

export function Avatar({ name, src, alt, size = 'md', tone = 'accent', className, ...rest }: AvatarProps) {
  const px = SIZE[size];
  const classes = [styles.avatar, styles[tone], className].filter(Boolean).join(' ');
  const style = { width: px, height: px, fontSize: Math.round(px * 0.38) };

  if (src) {
    return <img className={classes} style={style} src={src} alt={alt ?? ''} width={px} height={px} {...rest} />;
  }

  return (
    <span className={classes} style={style} {...rest}>
      {alt ? <span className="visually-hidden">{alt}</span> : null}
      <span aria-hidden="true">{initialsFrom(name || '?')}</span>
    </span>
  );
}
