import type { Ref } from 'react';
import type { FormType } from '@/api/types';
import type { AsyncState } from '@/hooks/useAsync';
import { Alert, Heading, RadioCard, StateMessage, Text } from '@/components';
import styles from './StepFormType.module.css';

interface StepFormTypeProps {
  formTypes: AsyncState<FormType[]>;
  onRetry: () => void;
  value?: string;
  onChange: (formTypeId: string) => void;
  /** Shown when Nästa is pressed and something is missing or failed. */
  error?: string;
  headingRef: Ref<HTMLHeadingElement>;
}

/** Step 1: choose the form type. */
function StepFormType({ formTypes, onRetry, value, onChange, error, headingRef }: StepFormTypeProps) {
  return (
    <section aria-labelledby="form-type-heading" className={styles.step}>
      <Heading level={2} id="form-type-heading" ref={headingRef} tabIndex={-1} size="lg" className={styles.heading}>
        Vilken typ av formulär vill du skapa?
      </Heading>
      <Text id="form-type-hint" size="sm" tone="muted">
        Typen styr vilka standardfrågor som alltid ingår. Formuläret kan sedan återanvändas och kopieras för olika
        företag.
      </Text>

      {error && <Alert tone="danger" title={error} live="assertive" />}

      {/* The heading names the group, so no separate legend is needed */}
      <fieldset className={styles.formTypes} aria-labelledby="form-type-heading" aria-describedby="form-type-hint">
        {formTypes.status === 'loading' && <StateMessage variant="loading" message="Hämtar formulärtyper" />}

        {formTypes.status === 'error' && (
          <StateMessage variant="error" message="Formulärtyperna kunde inte hämtas." onRetry={onRetry} />
        )}

        {formTypes.status === 'success' &&
          formTypes.data.map((type) => (
            <RadioCard
              key={type.id}
              name="formType"
              value={type.id}
              title={type.name}
              description={type.description}
              checked={value === type.id}
              onChange={onChange}
            />
          ))}
      </fieldset>
    </section>
  );
}

export default StepFormType;
