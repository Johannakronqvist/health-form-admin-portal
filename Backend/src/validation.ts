import { z } from 'zod';
import type { BankQuestion, FieldError, FormType } from './types.js';

export const MAX_QUESTIONS = 40;

const nameSchema = z
  .string({ required_error: 'Formuläret måste ha ett namn' })
  .trim()
  .min(1, 'Formuläret måste ha ett namn')
  .max(100, 'Högst 100 tecken');

const versionSchema = z.number({ required_error: 'version saknas' }).int();

export const createFormSchema = z.object({
  formTypeId: z.string({ required_error: 'Välj en formulärtyp' }),
  name: nameSchema.optional(),
});

export const copyFormSchema = z.object({
  name: nameSchema.optional(),
});

export const saveFormSchema = z.object({
  version: versionSchema,
  /** Optional: the create-flow step the draft is on. */
  step: z.number().int().min(1).max(3).optional(),
  name: nameSchema,
  formTypeId: z.string({ required_error: 'Välj en formulärtyp' }),
  questions: z
    .array(
      z.object({
        questionId: z.string({ required_error: 'questionId saknas' }),
        required: z.boolean({ required_error: 'Ange om frågan är obligatorisk' }),
      }),
      { required_error: 'Formuläret måste ha minst en fråga' },
    )
    .min(1, 'Formuläret måste ha minst en fråga')
    .max(MAX_QUESTIONS, `Formuläret får ha högst ${MAX_QUESTIONS} frågor`),
});

export type SaveFormInput = z.infer<typeof saveFormSchema>;

export const versionOnlySchema = z.object({ version: versionSchema });

/** Rules that need the question bank and the form type, run after the shape has been validated. */
export function validateFormRules(
  input: SaveFormInput,
  bank: BankQuestion[],
  formType: FormType | undefined,
): FieldError[] {
  const errors: FieldError[] = [];
  if (!formType) errors.push({ field: 'formTypeId', message: 'Okänd formulärtyp' });
  const standardIds = formType?.standardQuestionIds ?? [];
  const seen = new Set<string>();

  input.questions.forEach((question, index) => {
    const path = `questions.${index}`;
    if (!bank.some((b) => b.id === question.questionId)) {
      errors.push({ field: `${path}.questionId`, message: 'Frågan finns inte i frågebanken' });
      return;
    }
    if (seen.has(question.questionId)) {
      errors.push({ field: path, message: 'Frågan finns redan i formuläret' });
    }
    seen.add(question.questionId);
    if (standardIds.includes(question.questionId) && !question.required) {
      errors.push({ field: `${path}.required`, message: 'Standardfrågor måste vara obligatoriska' });
    }
  });

  if (formType) {
    for (const id of standardIds.filter((standardId) => !seen.has(standardId))) {
      const label = bank.find((b) => b.id === id)?.label ?? id;
      errors.push({
        field: 'questions',
        message: `"${label}" ingår alltid i ${formType.name} och kan inte tas bort`,
      });
    }
  }

  return errors;
}

export const linkFormSchema = z.object({
  formId: z.string({ required_error: 'Välj ett formulär' }),
  /** Publish right away ("Publicera nu"); otherwise it's linked as a draft. */
  publish: z.boolean().optional(),
});

export function zodToFieldErrors(error: z.ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));
}
