// --- Companies (same shapes as mock-api/src/types.ts) ---

export interface Company {
  id: string;
  name: string;
  orgNumber: string;
  industry: string;
  employeeCount: number;
}

/** A form's status at one company: linked but not published, or published. */
export type CompanyFormStatus = 'draft' | 'published';

export interface StaffUser {
  id: string;
  name: string;
  title: string;
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
  /** The form has been changed since it was published here. */
  hasUnpublishedChanges: boolean;
  /** Answers received from this company's employees. */
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

export interface FormType {
  id: string;
  name: string;
  description: string;
  standardQuestionIds: string[];
}

// --- Question bank (same shapes as mock-api/src/types.ts) ---

export type QuestionType = 'text' | 'textarea' | 'number' | 'boolean' | 'single-choice' | 'scale';

export type QuestionAreaId =
  'general-health' | 'medication' | 'lifestyle' | 'physical-work-environment' | 'psychosocial-work-environment';

export interface QuestionArea {
  id: QuestionAreaId;
  label: string;
  questionCount: number;
}

export interface BankQuestion {
  id: string;
  area: QuestionAreaId;
  type: QuestionType;
  label: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  /** "När ska frågan användas?" in the question details. */
  guidance?: string;
  guidanceTip?: string;
  updatedAt: string;
  /** Number of forms the question is used in. */
  formCount: number;
}

// --- Forms ---

/** A question as it appears in a form, with the bank question's content filled in. */
export interface FormQuestion extends Pick<
  BankQuestion,
  'area' | 'type' | 'label' | 'helpText' | 'options' | 'min' | 'max'
> {
  questionId: string;
  required: boolean;
  /** Standard question for the form's type ("Ingår alltid"): can't be removed or moved. */
  standard: boolean;
}

export interface Form {
  id: string;
  name: string;
  formTypeId: string;
  formTypeName: string;
  status: 'draft' | 'saved';
  /** Send it back on PUT, so you don't overwrite someone else's changes. */
  version: number;
  questions: FormQuestion[];
  /** The create-flow step a draft was left on (1-3). */
  wizardStep: number;
  /** True while a saved form has changes that aren't saved with "Spara ändringar" yet. */
  editing: boolean;
  /** Increases only when the live content changes (what companies get when it's published). */
  contentVersion: number;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

/** A form in GET /api/forms (FormSummary in the mock API). */
export interface FormListItem {
  id: string;
  name: string;
  formTypeId: string;
  formTypeName: string;
  status: 'draft' | 'saved';
  version: number;
  questionCount: number;
  /** Questions chosen on top of the type's standard questions ("12 frågor valda"). */
  selectedQuestionCount: number;
  /** The create-flow step a draft was left on (1-3). */
  wizardStep: number;
  /** "Används av". */
  companyCount: number;
  publishedCount: number;
  updatedAt: string;
  updatedBy: string;
}

/** Body for PUT /api/forms/:id. */
export interface SaveFormInput {
  version: number;
  /** The create-flow step the draft is on. */
  step?: number;
  name: string;
  formTypeId: string;
  questions: { questionId: string; required: boolean }[];
}

/** A form at one company, for Översikt. */
interface OverviewLink {
  formId: string;
  formName: string;
  companyId: string;
  companyName: string;
}

/** Something waiting on the user ("Att göra"). */
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
