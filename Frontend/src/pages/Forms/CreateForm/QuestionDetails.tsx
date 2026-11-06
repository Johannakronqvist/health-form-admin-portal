import { AlignLeft, Check, CircleDot, Hash, Lightbulb, SlidersHorizontal } from 'lucide-react';
import type { BankQuestion, FormQuestion } from '@/api/types';
import { Badge, Button, Modal, Text } from '@/components';
import { formatDate } from '@/lib/formatDate';
import styles from './QuestionDetails.module.css';

interface QuestionDetailsProps {
  /** The question to show; null keeps the modal closed. */
  question: BankQuestion | null;
  /** The question as it is in this form, if it has been added. */
  inForm?: FormQuestion;
  areaLabel?: string;
  onClose: () => void;
}

/** "Radioknappar", "Ja / Nej | ett svar" ... for the Svarstyp tile. */
function answerTypeDetails(q: BankQuestion) {
  switch (q.type) {
    case 'boolean':
      return { icon: CircleDot, name: 'Radioknappar', detail: 'Ja / Nej | ett svar' };
    case 'single-choice':
      return {
        icon: CircleDot,
        name: 'Radioknappar',
        detail: `${q.options?.map((o) => o.label).join(' / ')} | ett svar`,
      };
    case 'scale':
      return { icon: SlidersHorizontal, name: 'Skala', detail: q.helpText ?? `${q.min}-${q.max}` };
    case 'number':
      return { icon: Hash, name: 'Tal', detail: `${q.min}-${q.max}` };
    case 'textarea':
      return { icon: AlignLeft, name: 'Fritext', detail: 'Långt svar' };
    default:
      return { icon: AlignLeft, name: 'Fritext', detail: 'Kort svar' };
  }
}

/** The answer options drawn as the employee sees them (not interactive). */
function Preview({ question }: { question: BankQuestion }) {
  const choices =
    question.type === 'boolean'
      ? ['Ja', 'Nej']
      : question.type === 'single-choice'
        ? (question.options ?? []).map((o) => o.label)
        : [];

  return (
    <div className={styles.preview}>
      <p className={styles.previewLabel}>{question.label}</p>
      {choices.length > 0 && (
        <div className={styles.choices}>
          {choices.map((choice) => (
            <span key={choice} className={styles.choice}>
              <span className={styles.radio} aria-hidden="true" />
              {choice}
            </span>
          ))}
        </div>
      )}
      {question.type === 'scale' && question.min !== undefined && question.max !== undefined && (
        <div className={styles.choices}>
          {Array.from({ length: question.max - question.min + 1 }, (_, i) => question.min! + i).map((n) => (
            <span key={n} className={`${styles.choice} ${styles.scaleStep}`}>
              {n}
            </span>
          ))}
        </div>
      )}
      {(question.type === 'text' || question.type === 'number') && <span className={styles.input} />}
      {question.type === 'textarea' && <span className={`${styles.input} ${styles.textarea}`} />}
      {question.helpText && question.type === 'scale' && (
        <Text size="sm" tone="muted">
          {question.helpText}
        </Text>
      )}
    </div>
  );
}

/** Question details, opened from the info button on a question. */
function QuestionDetails({ question, inForm, areaLabel, onClose }: QuestionDetailsProps) {
  if (!question) return <Modal open={false} onClose={onClose} title="" />;

  const answerType = answerTypeDetails(question);
  const AnswerIcon = answerType.icon;
  // New questions are added as required, so that's what they'll be until it's changed in the form
  const required = inForm ? inForm.required : true;

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      dismissLabel="Stäng"
      eyebrow={
        <span className={styles.badges}>
          {areaLabel && (
            <Badge tone="accent" variant="soft">
              {areaLabel}
            </Badge>
          )}
          {inForm && (
            <Badge tone="neutral" variant="solid">
              <Check size={14} aria-hidden="true" /> I formuläret
            </Badge>
          )}
        </span>
      }
      title={question.label}
      description={`Standardfråga från Hälsoportalen | Används i ${question.formCount} formulär`}
      footer={
        <div className={styles.footer}>
          <Text size="sm" tone="muted">
            Senast ändrad {formatDate(question.updatedAt)}
          </Text>
          <Button onClick={onClose}>Stäng</Button>
        </div>
      }
    >
      <div className={styles.content}>
        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>Svarstyp</dt>
            <dd>
              <span className={styles.factValue}>
                <AnswerIcon size={16} aria-hidden="true" />
                {answerType.name}
              </span>
              <span className={styles.factDetail}>{answerType.detail}</span>
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>Obligatorisk</dt>
            <dd>
              <span className={styles.factValue}>{required ? 'Obligatorisk' : 'Valfri'}</span>
              <span className={styles.factDetail}>
                {inForm?.standard ? 'Ingår alltid i formulärtypen' : 'Kan ändras i formuläret'}
              </span>
            </dd>
          </div>
          <div className={styles.fact}>
            <dt>Visas för</dt>
            <dd>
              <span className={styles.factValue}>Alla anställda</span>
              <span className={styles.factDetail}>Ingen villkorslogik</span>
            </dd>
          </div>
        </dl>

        {question.guidance && (
          <section className={styles.guidance} aria-labelledby="guidance-heading">
            <h3 id="guidance-heading" className={styles.guidanceHeading}>
              <Lightbulb size={18} aria-hidden="true" />
              När ska frågan användas?
            </h3>
            <p>{question.guidance}</p>
            {question.guidanceTip && <p className={styles.tip}>{question.guidanceTip}</p>}
          </section>
        )}

        <section aria-labelledby="preview-heading">
          <h3 id="preview-heading" className={styles.previewHeading}>
            Så ser den anställda frågan
          </h3>
          <Preview question={question} />
        </section>
      </div>
    </Modal>
  );
}

export default QuestionDetails;
