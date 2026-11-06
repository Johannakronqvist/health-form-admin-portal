import { useId, type ReactNode } from 'react';
import styles from './RadioCard.module.css';

/*
  One radio option drawn as a card. The whole card is the <label>, so a click
  anywhere selects it. The title names the radio and the description is read
  after it ("Hälsoprofil, radio button, 1 of 9"). Put the cards in a <fieldset>
  that names the question, and give them the same name so arrow keys move
  between them.
*/

export interface RadioCardProps {
  /** Shared by every card in the group. */
  name: string;
  value: string;
  title: string;
  description?: string;
  /** Controlled state. Leave undefined to use defaultChecked (uncontrolled). */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: string) => void;
  /** Can't be chosen, e.g. a form that's already linked. Say why in `badge` or the description. */
  disabled?: boolean;
  /** Shown at the right, e.g. a Badge with "Redan kopplat". */
  badge?: ReactNode;
}

export function RadioCard({
  name,
  value,
  title,
  description,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  badge,
}: RadioCardProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const badgeId = `${id}-badge`;

  return (
    <label className={[styles.card, disabled && styles.disabled].filter(Boolean).join(' ')}>
      <input
        type="radio"
        className={styles.input}
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={() => onChange?.(value)}
        aria-labelledby={titleId}
        aria-describedby={[description && descriptionId, badge && badgeId].filter(Boolean).join(' ') || undefined}
      />
      <span className={styles.circle} aria-hidden="true" />
      <span className={styles.text}>
        <span id={titleId} className={styles.title}>
          {title}
        </span>
        {description && (
          <span id={descriptionId} className={styles.description}>
            {description}
          </span>
        )}
      </span>
      {badge && (
        <span id={badgeId} className={styles.badge}>
          {badge}
        </span>
      )}
    </label>
  );
}
