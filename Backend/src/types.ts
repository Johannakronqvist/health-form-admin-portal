export type QuestionType = 'text' | 'textarea' | 'number' | 'boolean' | 'single-choice' | 'scale';
export type QuestionAreaId =
  | 'general-health'
  | 'medication'
  | 'lifestyle'
  | 'physical-work-environment'
  | 'psychosocial-work-environment';
/** `draft` while it's being built in the wizard (autosaved), `saved` once it's been reviewed and saved. */
export type FormStatus = 'draft' | 'saved';
/** Status of a form at one company. */
export type CompanyFormStatus = 'draft' | 'published';

export interface StaffUser {
  id: string;
  name: string;
  title: string;
}

export interface Company {
  id: string;
  name: string;
  orgNumber: string;
  industry: string;
  employeeCount: number;
}

export interface QuestionOption {
  value: string;
  label: string;
}

export interface QuestionArea {
  id: QuestionAreaId;
  label: string;
}

/** A question in the question bank. Forms are built only from bank questions. */
export interface BankQuestion {
  id: string;
  area: QuestionAreaId;
  type: QuestionType;
  label: string;
  helpText?: string;
  options?: QuestionOption[]; // single-choice only
  min?: number; // number / scale
  max?: number; // number / scale
  /** "När ska frågan användas?" in the question details. */
  guidance?: string;
  /** A short hint under the guidance, e.g. a question to combine it with. */
  guidanceTip?: string;
  updatedAt: string;
}

/** A bank question as GET /api/question-bank returns it. */
export interface BankQuestionWithUsage extends BankQuestion {
  /** Number of forms the question is used in ("Används i 21 formulär"). */
  formCount: number;
}

export interface FormType {
  id: string;
  name: string;
  description: string;
  /** These questions are always part of a form of this type and must be required. */
  standardQuestionIds: string[];
}

/** How a form is stored. Questions only reference the bank. */
export interface FormRecord {
  id: string;
  name: string;
  formTypeId: string;
  status: FormStatus;
  /** Increases on every save. Send it back on PUT to avoid overwriting someone else's changes. */
  version: number;
  questions: { questionId: string; required: boolean }[];
  /** The create-flow step a draft was left on (1-3), for "Fortsätt där du slutade". */
  wizardStep: number;
  /**
   * Increases only when the live content changes (what companies get when it's published).
   * `version` increases on every save, also of a pending edit, and guards against overwrites.
   */
  contentVersion: number;
  /** Changes to a saved form that haven't been saved with "Spara ändringar" yet. */
  pendingEdit: PendingEdit | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PendingEdit {
  name: string;
  formTypeId: string;
  questions: { questionId: string; required: boolean }[];
  wizardStep: number;
  updatedAt: string;
}

/** A question as it appears in a form, with the bank question's content filled in. */
export interface FormQuestion extends Omit<BankQuestion, 'id'> {
  questionId: string;
  required: boolean;
  /** Standard question for the form's type ("Ingår alltid"): can't be removed or made optional. */
  standard: boolean;
}

/**
 * A form as the API returns it. While a saved form is being edited, name, type, questions and
 * wizardStep are the pending edit's, and `editing` is true.
 */
export interface Form extends Omit<FormRecord, 'questions' | 'pendingEdit'> {
  formTypeName: string;
  questions: FormQuestion[];
  editing: boolean;
}

export interface FormSummary {
  id: string;
  name: string;
  formTypeId: string;
  formTypeName: string;
  status: FormStatus;
  version: number;
  questionCount: number;
  /** Questions chosen on top of the type's standard questions ("12 frågor valda"). */
  selectedQuestionCount: number;
  /** The create-flow step a draft was left on (1-3). */
  wizardStep: number;
  /** Number of companies the form is linked to ("Används av"). */
  companyCount: number;
  /** Number of companies where it is published. */
  publishedCount: number;
  updatedAt: string;
  updatedBy: string;
}

/** How a link between a company and a form is stored. */
export interface CompanyFormLink {
  companyId: string;
  formId: string;
  status: CompanyFormStatus;
  /** The form version that was published here. */
  publishedVersion: number | null;
  publishedAt: string | null;
  /** Answers received from this company's employees. */
  responseCount: number;
  linkedAt: string;
}

/** A form as listed on a company page. */
export interface CompanyForm {
  formId: string;
  name: string;
  /** Number of companies the form is linked to ("Används av 2 företag"). */
  companyCount: number;
  formTypeId: string;
  formTypeName: string;
  formUpdatedAt: string;
  formUpdatedBy: string;
  status: CompanyFormStatus;
  publishedVersion: number | null;
  publishedAt: string | null;
  /** The form has been edited since it was published here. */
  hasUnpublishedChanges: boolean;
  responseCount: number;
  linkedAt: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    fieldErrors?: FieldError[];
  };
}

/** A form at one company, for the overview's to-do list. */
interface OverviewLink {
  formId: string;
  formName: string;
  companyId: string;
  companyName: string;
}

/** Something waiting on the user ("Att göra" on Översikt). */
export type OverviewTodo =
  | ({ type: 'unpublished-changes' } & OverviewLink)
  | ({ type: 'not-published' } & OverviewLink)
  | { type: 'drafts'; drafts: { id: string; name: string; wizardStep: number }[] };

/** How many of a company's employees have answered a published form ("Så går enkäterna"). */
export interface ResponseRate extends OverviewLink {
  responseCount: number;
  employeeCount: number;
}

export interface Overview {
  todos: OverviewTodo[];
  /** Lowest response rate first. */
  responseRates: ResponseRate[];
}
