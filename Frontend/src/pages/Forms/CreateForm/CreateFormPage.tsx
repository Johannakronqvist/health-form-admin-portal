import { Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router';
import { fetchFormTypes } from '@/api/formTypes';
import { Breadcrumbs, Button, Heading, HeartbeatMark, Modal, StateMessage, StepIndicator, Text } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import StepFormType from './StepFormType';
import StepQuestions from './StepQuestions';
import StepReview from './StepReview';
import { useFormDraft } from './useFormDraft';
import styles from './CreateFormPage.module.css';

const steps = [
  { name: 'Formulärtyp', next: 'Nästa: Välj frågor' },
  { name: 'Frågor', next: 'Nästa: Granska' },
  { name: 'Granska och spara', next: 'Spara formulär' },
];

/*
  The create flow, also used to edit a saved form (/formular/:formId/redigera).
  Editing starts on Frågor, and the changes only go live with "Spara ändringar".
*/
function CreateFormPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const formTypes = useAsync(fetchFormTypes);
  const draft = useFormDraft();
  const { formId } = useParams();
  const isEditing = Boolean(formId);

  // The step lives in the URL (?steg=2), so the browser's Back button moves between steps
  const stepNumber = Math.min(Math.max(Number(searchParams.get('steg')) || (isEditing ? 2 : 1), 1), steps.length);
  const step = steps[stepNumber - 1];
  const isLastStep = stepNumber === steps.length;
  const nextLabel = isEditing && isLastStep ? 'Spara ändringar' : step.next;
  // The draft's id is in the URL too (?utkast=form-5, or the path when editing), so a reload can load it again
  const draftId = formId ?? searchParams.get('utkast');

  const [formTypeId, setFormTypeId] = useState<string>();
  const [stepError, setStepError] = useState<string>();
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string>();
  const [loadError, setLoadError] = useState<string>();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const keepEditingRef = useRef<HTMLButtonElement>(null);

  const { form, load } = draft;
  useEffect(() => {
    if (!draftId || form?.id === draftId) return;
    load(draftId).then(
      (loaded) => setFormTypeId((current) => current ?? loaded.formTypeId),
      (error: unknown) => setLoadError(error instanceof Error ? error.message : 'Utkastet kunde inte hämtas.'),
    );
  }, [draftId, form?.id, load]);

  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusStepHeading = useRef(false);

  useEffect(() => {
    // After Nästa or Tillbaka, start keyboard and screen reader users at the new step's heading
    if (focusStepHeading.current) {
      focusStepHeading.current = false;
      stepHeadingRef.current?.focus();
    }
  }, [stepNumber]);

  function goToStep(next: number, draftFormId = draft.form?.id) {
    focusStepHeading.current = true;
    draft.setStep(next);
    // When editing, the form's id is already in the path
    setSearchParams(draftFormId && !isEditing ? { steg: String(next), utkast: draftFormId } : { steg: String(next) });
  }

  /** Avbryt: when editing, ask before throwing the changes away. */
  function cancel() {
    if (isEditing && draft.form?.editing) setConfirmDiscard(true);
    else navigate('/formular');
  }

  async function discardChanges() {
    setDiscarding(true);
    try {
      await draft.discard();
      navigate('/formular');
    } catch (error) {
      setConfirmDiscard(false);
      setStepError(error instanceof Error ? error.message : 'Ändringarna kunde inte slängas.');
    } finally {
      setDiscarding(false);
    }
  }

  async function next() {
    if (stepNumber === 1) {
      const formType =
        formTypes.state.status === 'success' ? formTypes.state.data.find((t) => t.id === formTypeId) : undefined;
      if (!formType) {
        setStepError('Välj en formulärtyp för att gå vidare.');
        return;
      }
      setStepError(undefined);
      setStarting(true);
      try {
        const started = await draft.start(formType);
        goToStep(2, started.id);
      } catch (error) {
        setStepError(error instanceof Error ? error.message : 'Utkastet kunde inte skapas.');
      } finally {
        setStarting(false);
      }
      return;
    }

    if (isLastStep) {
      setCompleteError(undefined);
      setCompleting(true);
      try {
        const saved = await draft.complete();
        // The forms page confirms the save and highlights the form
        navigate('/formular', {
          state: { savedFormId: saved.id, savedFormName: saved.name, edited: isEditing },
        });
      } catch (error) {
        setCompleteError(error instanceof Error ? error.message : 'Formuläret kunde inte sparas.');
      } finally {
        setCompleting(false);
      }
      return;
    }
    goToStep(stepNumber + 1);
  }

  // Past step 1 there must be a draft: load it from the URL, or start over without one
  if (stepNumber > 1 && !draft.form) {
    if (!draftId) return <Navigate to="?steg=1" replace />;
    return loadError ? (
      <StateMessage
        variant="error"
        message={`${isEditing ? 'Formuläret' : 'Utkastet'} kunde inte hämtas. ${loadError}`}
        onRetry={() => {
          setLoadError(undefined);
          load(draftId).catch((error: unknown) =>
            setLoadError(error instanceof Error ? error.message : 'Utkastet kunde inte hämtas.'),
          );
        }}
      />
    ) : (
      <StateMessage variant="loading" message={isEditing ? 'Hämtar formuläret' : 'Hämtar utkastet'} />
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Breadcrumbs
          label="Brödsmulor"
          items={[
            { label: 'Formulär', href: '/formular' },
            { label: isEditing ? (draft.form?.name ?? 'Formulär') : 'Nytt formulär' },
          ]}
          onNavigate={(href, event) => {
            event.preventDefault();
            navigate(href);
          }}
        />
        <Heading level={1}>{isEditing ? 'Redigera formulär' : 'Skapa formulär'}</Heading>
        <StepIndicator steps={steps.map((s) => s.name)} current={stepNumber - 1} label="Steg" doneLabel="klar" />
      </div>

      {stepNumber === 1 && (
        <StepFormType
          formTypes={formTypes.state}
          onRetry={formTypes.retry}
          value={formTypeId}
          onChange={(id) => {
            setFormTypeId(id);
            setStepError(undefined);
          }}
          error={stepError}
          headingRef={stepHeadingRef}
        />
      )}

      {stepNumber === 2 && draft.form && (
        <StepQuestions
          formName={draft.form.name}
          onRename={draft.rename}
          questions={draft.questions}
          onChange={draft.updateQuestions}
          headingRef={stepHeadingRef}
        />
      )}

      {stepNumber === 3 && draft.form && (
        <StepReview
          formName={draft.form.name}
          questions={draft.questions}
          error={completeError}
          headingRef={stepHeadingRef}
        />
      )}

      <div className={styles.footer}>
        {stepNumber > 1 && (
          <div role="status" className={styles.saveStatus}>
            {draft.saveStatus === 'saving' && (
              <>
                <HeartbeatMark />
                <Text size="sm" tone="muted" weight="medium">
                  Sparar
                </Text>
              </>
            )}
            {draft.saveStatus === 'error' && (
              <>
                <Text size="sm" weight="medium" className={styles.saveError}>
                  Utkastet kunde inte sparas. {draft.saveError}
                </Text>
                <Button variant="ghost" size="sm" onClick={draft.retrySave}>
                  Försök igen
                </Button>
              </>
            )}
            {(draft.saveStatus === 'idle' || draft.saveStatus === 'saved') && (
              <Text size="sm" tone="muted" weight="medium">
                {isEditing
                  ? 'Ändringarna sparas automatiskt och går live när du sparar formuläret'
                  : 'Utkastet sparas automatiskt'}
              </Text>
            )}
          </div>
        )}
        <div className={styles.actions}>
          {stepNumber === 1 ? (
            <Button variant="secondary" onClick={cancel}>
              Avbryt
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => goToStep(stepNumber - 1)}>
              Tillbaka
            </Button>
          )}
          <Button loading={starting || completing} leftIcon={isLastStep ? Save : undefined} onClick={() => void next()}>
            {nextLabel}
          </Button>
        </div>
      </div>

      <Modal
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        title="Släng ändringarna?"
        description="Formuläret blir som det var när det senast sparades."
        dismissLabel="Stäng"
        initialFocus={keepEditingRef}
        size="sm"
        footer={
          <div className={styles.actions}>
            <Button ref={keepEditingRef} variant="secondary" onClick={() => setConfirmDiscard(false)}>
              Fortsätt redigera
            </Button>
            <Button variant="danger" loading={discarding} onClick={() => void discardChanges()}>
              Släng ändringarna
            </Button>
          </div>
        }
      />
    </div>
  );
}

export default CreateFormPage;
