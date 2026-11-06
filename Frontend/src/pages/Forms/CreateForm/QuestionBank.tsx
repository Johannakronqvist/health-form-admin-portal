import { Check, Info, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { BankQuestion, QuestionArea } from '@/api/types';
import { Button, Heading, SearchField, Text, ToggleGroup } from '@/components';
import styles from './QuestionBank.module.css';

interface QuestionBankProps {
  questions: BankQuestion[];
  areas: QuestionArea[];
  /** Ids of the questions already in the form ("Tillagd"). */
  addedIds: Set<string>;
  onAdd: (question: BankQuestion) => void;
  /** Opens the question details (the info button). */
  onShowDetails: (questionId: string) => void;
}

/** "Ja/nej", "Skala 1-5" ... under each question. */
function answerType(q: BankQuestion) {
  switch (q.type) {
    case 'boolean':
      return 'Ja/nej';
    case 'scale':
      return `Skala ${q.min}-${q.max}`;
    case 'number':
      return 'Tal';
    case 'single-choice':
      return 'Flerval';
    default:
      return 'Fritext';
  }
}

/** The question bank: search, filter by area, and add questions to the form. */
function QuestionBank({ questions, areas, addedIds, onAdd, onShowDetails }: QuestionBankProps) {
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('all');

  // The + button is replaced by "Tillagd" when pressed, so move focus to that text
  const addedRefs = useRef(new Map<string, HTMLElement>());
  const focusAddedId = useRef<string | null>(null);
  useEffect(() => {
    if (focusAddedId.current) {
      addedRefs.current.get(focusAddedId.current)?.focus();
      focusAddedId.current = null;
    }
  }, [addedIds]);

  const query = search.trim().toLowerCase();
  const visible = questions.filter(
    (q) => (area === 'all' || q.area === area) && (!query || q.label.toLowerCase().includes(query)),
  );

  return (
    <section aria-labelledby="question-bank-heading" className={styles.panel}>
      <Heading level={2} id="question-bank-heading" size="lg">
        Frågebank
      </Heading>

      <SearchField
        label="Sök fråga"
        hideLabel
        placeholder="Sök fråga"
        clearLabel="Rensa sökningen"
        value={search}
        onSearch={setSearch}
        resultCount={visible.length}
        resultLabel={(count) => (count === 1 ? '1 fråga' : `${count} frågor`)}
      />

      <ToggleGroup
        label="Område"
        defaultValue="all"
        onChange={setArea}
        options={[
          { value: 'all', label: `Alla ${questions.length}` },
          ...areas.map((a) => ({ value: a.id, label: `${a.label} ${a.questionCount}` })),
        ]}
      />

      {visible.length === 0 ? (
        <Text tone="muted">Inga frågor matchar sökningen.</Text>
      ) : (
        <ul className={styles.list} aria-label="Frågor i frågebanken">
          {visible.map((q) => (
            <li key={q.id} className={styles.row}>
              <Button
                iconOnly
                variant="secondary"
                size="sm"
                leftIcon={Info}
                ariaLabel={`Visa detaljer: ${q.label}`}
                onClick={() => onShowDetails(q.id)}
              />
              <span className={styles.text}>
                <span className={styles.label}>{q.label}</span>
                <span className={styles.meta}>{answerType(q)}</span>
              </span>
              {addedIds.has(q.id) ? (
                <span
                  ref={(el) => {
                    if (el) addedRefs.current.set(q.id, el);
                  }}
                  tabIndex={-1}
                  className={styles.added}
                >
                  <Check size={16} aria-hidden="true" />
                  Tillagd
                </span>
              ) : (
                <Button
                  iconOnly
                  variant="secondary"
                  size="sm"
                  leftIcon={Plus}
                  ariaLabel={`Lägg till: ${q.label}`}
                  onClick={() => {
                    focusAddedId.current = q.id;
                    onAdd(q);
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default QuestionBank;
