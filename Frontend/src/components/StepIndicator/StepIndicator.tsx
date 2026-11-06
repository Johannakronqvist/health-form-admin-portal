import { Check } from 'lucide-react';
import styles from './StepIndicator.module.css';

/*
  Progress through a multi-step flow. An ordered list, so screen readers announce
  how many steps there are. The current step gets aria-current="step", and finished
  steps get hidden text, since the check icon alone isn't read out.
*/

export interface StepIndicatorProps {
  /** Step names, in order. */
  steps: string[];
  /** Index of the current step, starting at 0. */
  current: number;
  /** Names the list, e.g. "Steg". */
  label?: string;
  /** Read after finished steps, e.g. "klar". */
  doneLabel?: string;
}

export function StepIndicator({ steps, current, label = 'Steps', doneLabel = 'completed' }: StepIndicatorProps) {
  return (
    <ol aria-label={label} className={styles.list}>
      {steps.map((step, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'upcoming';
        return (
          <li
            key={step}
            className={`${styles.step} ${styles[state]}`}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className={styles.marker} aria-hidden="true">
              {state === 'done' ? <Check size={16} strokeWidth={3} /> : i + 1}
            </span>
            <span className={styles.name}>{step}</span>
            {state === 'done' && <span className="visually-hidden"> ({doneLabel})</span>}
          </li>
        );
      })}
    </ol>
  );
}
