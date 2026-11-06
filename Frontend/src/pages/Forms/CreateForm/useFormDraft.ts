import { useCallback, useEffect, useRef, useState } from 'react';
import { completeForm, createForm, discardEdit, fetchForm, saveForm } from '@/api/forms';
import type { Form, FormQuestion, FormType } from '@/api/types';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/** How long to wait after the last change before saving. */
const SAVE_DELAY_MS = 600;

const toInput = (q: FormQuestion) => ({ questionId: q.questionId, required: q.required });

/** The draft form being built in the wizard, saved automatically. */
export function useFormDraft() {
  const [form, setForm] = useState<Form | null>(null);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string>();

  const versionRef = useRef(0);
  const timerRef = useRef<number>(undefined);
  const savingRef = useRef(false);
  const pendingRef = useRef<FormQuestion[] | null>(null);
  // Questions changed but not saved yet; null when everything is saved
  const unsavedRef = useRef<FormQuestion[] | null>(null);
  // The wizard step, saved with the draft so "Fortsätt där du slutade" can return to it
  const stepRef = useRef(1);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const applySaved = useCallback((saved: Form) => {
    versionRef.current = saved.version;
    setForm(saved);
  }, []);

  const load = useCallback(
    async (id: string) => {
      const loaded = await fetchForm(id);
      stepRef.current = loaded.wizardStep;
      applySaved(loaded);
      setQuestions(loaded.questions);
      return loaded;
    },
    [applySaved],
  );

  /** Returns the draft, so the caller can put its id in the URL. */
  async function start(formType: FormType): Promise<Form> {
    if (!form) {
      const created = await createForm(formType.id);
      stepRef.current = created.wizardStep;
      applySaved(created);
      setQuestions(created.questions);
      return created;
    }
    if (form.formTypeId === formType.id) return form;

    // Another type: its standard questions first, then the user's own questions
    const own = questions.filter((q) => !q.standard && !formType.standardQuestionIds.includes(q.questionId));
    const saved = await saveForm(form.id, {
      version: versionRef.current,
      step: stepRef.current,
      // Keep a name the user chose; a default name follows the type
      name: form.name === form.formTypeName ? formType.name : form.name,
      formTypeId: formType.id,
      questions: [
        ...formType.standardQuestionIds.map((questionId) => ({ questionId, required: true })),
        ...own.map(toInput),
      ],
    });
    applySaved(saved);
    setQuestions(saved.questions);
    return saved;
  }

  async function save(next: FormQuestion[]) {
    if (!form) return;
    if (savingRef.current) {
      pendingRef.current = next;
      return;
    }

    savingRef.current = true;
    setSaveStatus('saving');
    try {
      const saved = await saveForm(form.id, {
        version: versionRef.current,
        step: stepRef.current,
        name: form.name,
        formTypeId: form.formTypeId,
        questions: next.map(toInput),
      });
      applySaved(saved);
      if (unsavedRef.current === next) unsavedRef.current = null;
      setSaveStatus('saved');
      setSaveError(undefined);
    } catch (error) {
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'Något gick fel. Försök igen.');
    } finally {
      savingRef.current = false;
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending) void save(pending);
    }
  }

  function updateQuestions(next: FormQuestion[]) {
    setQuestions(next);
    unsavedRef.current = next;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => void save(next), SAVE_DELAY_MS);
  }

  /** Remembers the wizard step and saves it with the draft. */
  function setStep(step: number) {
    if (!form || step === stepRef.current) return;
    stepRef.current = step;
    // Only drafts need it saved. For a saved form, saving would create an edit with no real change.
    if (form.status === 'draft') updateQuestions(unsavedRef.current ?? questions);
  }

  /** Saves a new name right away, together with the current questions. */
  async function rename(name: string) {
    if (!form) throw new Error('Det finns inget utkast att spara.');
    window.clearTimeout(timerRef.current);
    while (savingRef.current) await new Promise((resolve) => setTimeout(resolve, 50));

    const saved = await saveForm(form.id, {
      version: versionRef.current,
      step: stepRef.current,
      name,
      formTypeId: form.formTypeId,
      questions: (unsavedRef.current ?? questions).map(toInput),
    });
    applySaved(saved);
    unsavedRef.current = null;
  }

  async function complete(): Promise<Form> {
    if (!form) throw new Error('Det finns inget utkast att spara.');

    // Save right away instead of waiting for the timer, after any save that is already running
    window.clearTimeout(timerRef.current);
    while (savingRef.current) await new Promise((resolve) => setTimeout(resolve, 50));
    if (unsavedRef.current) await save(unsavedRef.current);
    if (unsavedRef.current) throw new Error('Utkastet kunde inte sparas. Försök igen.');

    const completed = await completeForm(form.id, versionRef.current);
    applySaved(completed);
    return completed;
  }

  async function discard() {
    if (!form) return;
    window.clearTimeout(timerRef.current);
    while (savingRef.current) await new Promise((resolve) => setTimeout(resolve, 50));
    unsavedRef.current = null;
    applySaved(await discardEdit(form.id, versionRef.current));
  }

  return {
    form,
    questions,
    saveStatus,
    saveError,
    load,
    start,
    rename,
    setStep,
    complete,
    discard,
    updateQuestions,
    retrySave: () => void save(questions),
  };
}
