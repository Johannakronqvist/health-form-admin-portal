import { useState, type RefObject } from 'react';
import { fetchQuestionAreas, fetchQuestionBank } from '@/api/questionBank';
import type { BankQuestion, FormQuestion } from '@/api/types';
import { StateMessage } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import FormName from './FormName';
import FormQuestionList from './FormQuestionList';
import QuestionBank from './QuestionBank';
import QuestionDetails from './QuestionDetails';
import styles from './StepQuestions.module.css';

interface StepQuestionsProps {
  formName: string;
  /** Saves a new name for the form. */
  onRename: (name: string) => Promise<void>;
  questions: FormQuestion[];
  onChange: (questions: FormQuestion[]) => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
}

/** Step 2: the form's name on top, its questions on the left and the question bank on the right. */
function StepQuestions({ formName, onRename, questions, onChange, headingRef }: StepQuestionsProps) {
  const bank = useAsync(fetchQuestionBank);
  const areas = useAsync(fetchQuestionAreas);
  const [announcement, setAnnouncement] = useState('');
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const areaLabels: Record<string, string> =
    areas.state.status === 'success' ? Object.fromEntries(areas.state.data.map((a) => [a.id, a.label])) : {};
  const addedIds = new Set(questions.map((q) => q.questionId));
  const detailsQuestion =
    bank.state.status === 'success' ? (bank.state.data.find((q) => q.id === detailsId) ?? null) : null;

  function addQuestion(q: BankQuestion) {
    const added: FormQuestion = {
      questionId: q.id,
      area: q.area,
      type: q.type,
      label: q.label,
      helpText: q.helpText,
      options: q.options,
      min: q.min,
      max: q.max,
      required: true,
      standard: false,
    };
    onChange([...questions, added]);
    setAnnouncement(`"${q.label}" lades till i formuläret.`);
  }

  return (
    <div className={styles.step}>
      <FormName name={formName} onRename={onRename} />

      <div className={styles.columns}>
        <FormQuestionList
          questions={questions}
          onChange={onChange}
          areaLabels={areaLabels}
          announce={setAnnouncement}
          onShowDetails={setDetailsId}
          headingRef={headingRef}
        />

        {bank.state.status === 'loading' || areas.state.status === 'loading' ? (
          <StateMessage variant="loading" message="Hämtar frågebanken" />
        ) : bank.state.status === 'error' || areas.state.status === 'error' ? (
          <StateMessage
            variant="error"
            message="Frågebanken kunde inte hämtas."
            onRetry={() => {
              bank.retry();
              areas.retry();
            }}
          />
        ) : (
          <QuestionBank
            questions={bank.state.data}
            areas={areas.state.data}
            addedIds={addedIds}
            onAdd={addQuestion}
            onShowDetails={setDetailsId}
          />
        )}

        <QuestionDetails
          question={detailsQuestion}
          inForm={questions.find((q) => q.questionId === detailsId)}
          areaLabel={detailsQuestion ? areaLabels[detailsQuestion.area] : undefined}
          onClose={() => setDetailsId(null)}
        />

        {/* Moves, removals and additions are announced here */}
        <p role="status" className="visually-hidden">
          {announcement}
        </p>
      </div>
    </div>
  );
}

export default StepQuestions;
