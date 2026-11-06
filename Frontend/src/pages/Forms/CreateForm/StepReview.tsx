import { useState, type RefObject } from 'react';
import { fetchQuestionAreas } from '@/api/questionBank';
import type { FormQuestion } from '@/api/types';
import { Alert, Field, Heading, RadioGroup, Text, ToggleGroup } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import styles from './StepReview.module.css';

interface StepReviewProps {
  formName: string;
  questions: FormQuestion[];
  /** Shown when saving the form fails. */
  error?: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
}

/** Roughly how long the form takes, e.g. 7 questions -> "cirka 3 min". */
const minutesFor = (count: number) => Math.max(1, Math.round(count * 0.4));

/** One question as the employee sees it. Answers here are only for trying it out. */
function PreviewQuestion({ question, number }: { question: FormQuestion; number: number }) {
  const label = `${number}. ${question.label}`;
  const name = `preview-${question.questionId}`;

  switch (question.type) {
    case 'boolean':
      return (
        <RadioGroup
          label={label}
          name={name}
          options={[
            { value: 'yes', label: 'Ja' },
            { value: 'no', label: 'Nej' },
          ]}
        />
      );
    case 'single-choice':
      return <RadioGroup label={label} name={name} options={question.options ?? []} />;
    case 'scale': {
      const min = question.min ?? 1;
      const max = question.max ?? 5;
      const steps = Array.from({ length: max - min + 1 }, (_, i) => String(min + i));
      return (
        <div className={styles.scale}>
          <RadioGroup label={label} name={name} options={steps.map((s) => ({ value: s, label: s }))} />
          {question.helpText && (
            <Text size="sm" tone="muted">
              {question.helpText}
            </Text>
          )}
        </div>
      );
    }
    case 'number':
      return <Field label={label} type="number" min={question.min} max={question.max} />;
    default:
      return <Field label={label} />;
  }
}

/** Step 3: a preview of the form as the employee sees it, on a computer or a phone. */
function StepReview({ formName, questions, error, headingRef }: StepReviewProps) {
  const areas = useAsync(fetchQuestionAreas);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const areaLabel = (id: string) =>
    areas.state.status === 'success' ? areas.state.data.find((a) => a.id === id)?.label : undefined;

  return (
    <section aria-labelledby="review-heading" className={styles.step}>
      <div className={styles.header}>
        <div>
          <Heading level={2} id="review-heading" ref={headingRef} tabIndex={-1} size="lg" className={styles.heading}>
            Förhandsvisning
          </Heading>
          <Text size="sm" tone="muted">
            Så ser formuläret ut för den anställda. Svar sparas inte här.
          </Text>
        </div>
        <ToggleGroup
          label="Visa som"
          defaultValue="desktop"
          onChange={setDevice}
          options={[
            { value: 'desktop', label: 'Dator' },
            { value: 'mobile', label: 'Mobil' },
          ]}
        />
      </div>

      {error && <Alert tone="danger" title={error} live="assertive" />}

      {/* Grey frame that scrolls on its own, with the form as a white page inside */}
      <div className={styles.frame} tabIndex={0} aria-label="Formuläret som den anställda ser det">
        <div className={`${styles.page} ${device === 'mobile' ? styles.mobile : ''}`}>
          {/* Read-only here; the name is changed on step 2 */}
          <Heading level={3} size="lg">
            {formName}
          </Heading>
          <Text size="sm" tone="muted">
            Dina svar är konfidentiella och delas bara med företagshälsovården.
          </Text>
          <div className={styles.progress} aria-hidden="true" />
          <Text size="sm" tone="muted" className={styles.meta}>
            {questions.length === 1 ? '1 fråga' : `${questions.length} frågor`} | cirka {minutesFor(questions.length)}{' '}
            min
          </Text>

          <ol className={styles.questions}>
            {questions.map((q, i) => {
              // The area name is shown where a new area starts
              const newArea = i === 0 || questions[i - 1].area !== q.area;
              return (
                <li key={q.questionId} className={styles.question}>
                  {newArea && <span className={styles.area}>{areaLabel(q.area)}</span>}
                  <PreviewQuestion question={q} number={i + 1} />
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default StepReview;
