import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import type { z } from 'zod';
import {
  companies,
  currentUser,
  formTypes,
  questionAreas,
  seedForms,
  seedLinks,
  seedQuestionBank,
} from './data/seed.js';
import type {
  ApiErrorBody,
  BankQuestion,
  BankQuestionWithUsage,
  Company,
  CompanyForm,
  CompanyFormLink,
  FieldError,
  Form,
  FormRecord,
  FormSummary,
  FormType,
  Overview,
  OverviewTodo,
} from './types.js';
import {
  copyFormSchema,
  createFormSchema,
  linkFormSchema,
  saveFormSchema,
  validateFormRules,
  versionOnlySchema,
  zodToFieldErrors,
} from './validation.js';

export interface AppOptions {
  /** Artificial latency in ms for every /api request. Override per request with the X-Mock-Delay header. */
  delayMs?: number;
  /** 0-1. Fraction of requests that randomly fail with 500. */
  errorRate?: number;
  /** Injected clock. */
  now?: () => Date;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fieldErrors?: FieldError[],
  ) {
    super(message);
  }
}

const notFound = (what: string) => new ApiError(404, 'NOT_FOUND', `${what} hittades inte`);
const validationFailed = (fieldErrors: FieldError[], message = 'Uppgifterna innehåller fel') =>
  new ApiError(422, 'VALIDATION_FAILED', message, fieldErrors);

/** Validates a request body, or throws 422 with field errors. */
function parseBody<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>, body: unknown): T {
  const result = schema.safeParse(body ?? {});
  if (!result.success) throw validationFailed(zodToFieldErrors(result.error));
  return result.data;
}

export function createApp(options: AppOptions = {}) {
  const { delayMs = 0, errorRate = 0, now = () => new Date() } = options;

  const bank: BankQuestion[] = seedQuestionBank();
  let forms: FormRecord[] = seedForms(now());
  let links: CompanyFormLink[] = seedLinks(now());
  let nextId = 100;

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api', async (req, _res, next) => {
    const headerDelay = Number(req.header('x-mock-delay'));
    const delay = req.header('x-mock-delay') && Number.isFinite(headerDelay) ? headerDelay : delayMs;
    if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));

    const forcedStatus = Number(req.header('x-mock-error'));
    if (forcedStatus >= 400) return next(new ApiError(forcedStatus, 'SIMULATED_ERROR', 'Simulerat fel (X-Mock-Error)'));
    if (errorRate > 0 && Math.random() < errorRate && req.path !== '/_reset') {
      return next(new ApiError(500, 'SIMULATED_ERROR', 'Något gick fel. Försök igen.'));
    }
    next();
  });

  function findCompany(id: string): Company {
    const company = companies.find((c) => c.id === id);
    if (!company) throw notFound('Företaget');
    return company;
  }

  function findFormRecord(id: string): FormRecord {
    const form = forms.find((f) => f.id === id);
    if (!form) throw notFound('Formuläret');
    return form;
  }

  function findFormType(id: string): FormType | undefined {
    return formTypes.find((t) => t.id === id);
  }

  function findLink(companyId: string, formId: string): CompanyFormLink {
    const link = links.find((l) => l.companyId === companyId && l.formId === formId);
    if (!link) throw notFound('Formuläret är inte kopplat till företaget och');
    return link;
  }

  function replaceForm(updated: FormRecord) {
    forms = forms.map((f) => (f.id === updated.id ? updated : f));
  }

  function assertVersion(form: FormRecord, version: number) {
    if (version !== form.version) {
      throw new ApiError(
        409,
        'VERSION_CONFLICT',
        `Formuläret har ändrats av ${form.updatedBy} sedan du öppnade det. Ladda om för att se den senaste versionen.`,
      );
    }
  }

  function toForm(record: FormRecord): Form {
    const { pendingEdit, ...live } = record;
    // While a saved form is being edited, the editor gets the pending changes
    const content = pendingEdit ?? live;
    const formType = findFormType(content.formTypeId)!;
    return {
      ...live,
      name: content.name,
      formTypeId: content.formTypeId,
      wizardStep: content.wizardStep,
      editing: pendingEdit !== null,
      formTypeName: formType.name,
      questions: content.questions.map(({ questionId, required }) => {
        const { id, ...question } = bank.find((b) => b.id === questionId)!;
        return { ...question, questionId: id, required, standard: formType.standardQuestionIds.includes(id) };
      }),
    };
  }

  function toSummary(record: FormRecord): FormSummary {
    const formLinks = links.filter((l) => l.formId === record.id);
    return {
      id: record.id,
      name: record.name,
      formTypeId: record.formTypeId,
      formTypeName: findFormType(record.formTypeId)!.name,
      status: record.status,
      version: record.version,
      questionCount: record.questions.length,
      selectedQuestionCount: record.questions.filter(
        (q) => !findFormType(record.formTypeId)!.standardQuestionIds.includes(q.questionId),
      ).length,
      wizardStep: record.wizardStep,
      companyCount: formLinks.length,
      publishedCount: formLinks.filter((l) => l.status === 'published').length,
      updatedAt: record.updatedAt,
      updatedBy: record.updatedBy,
    };
  }

  function published(link: CompanyFormLink, form: FormRecord): CompanyFormLink {
    return {
      ...link,
      status: 'published',
      publishedVersion: form.contentVersion,
      publishedAt: now().toISOString(),
    };
  }

  function toCompanyForm(link: CompanyFormLink): CompanyForm {
    const form = findFormRecord(link.formId);
    return {
      formId: form.id,
      name: form.name,
      companyCount: links.filter((l) => l.formId === form.id).length,
      formTypeId: form.formTypeId,
      formTypeName: findFormType(form.formTypeId)!.name,
      formUpdatedAt: form.updatedAt,
      formUpdatedBy: form.updatedBy,
      status: link.status,
      publishedVersion: link.publishedVersion,
      publishedAt: link.publishedAt,
      hasUnpublishedChanges: link.status === 'published' && link.publishedVersion !== form.contentVersion,
      responseCount: link.responseCount,
      linkedAt: link.linkedAt,
    };
  }

  const byUpdatedDesc = (a: { updatedAt: string }, b: { updatedAt: string }) => b.updatedAt.localeCompare(a.updatedAt);
  const searchQuery = (req: Request) =>
    typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

  app.get('/api/me', (_req, res) => {
    res.json(currentUser);
  });

  /** Översikt: what's waiting on the user, and how the published surveys are going. */
  app.get('/api/overview', (_req, res) => {
    const linkInfo = (link: CompanyFormLink) => ({
      formId: link.formId,
      formName: findFormRecord(link.formId).name,
      companyId: link.companyId,
      companyName: findCompany(link.companyId).name,
    });
    const isPublished = (l: CompanyFormLink) => l.status === 'published';
    const hasChanges = (l: CompanyFormLink) =>
      isPublished(l) && l.publishedVersion !== findFormRecord(l.formId).contentVersion;
    const drafts = forms
      .filter((f) => f.status === 'draft')
      .sort(byUpdatedDesc)
      .map((f) => ({ id: f.id, name: f.name, wizardStep: f.wizardStep }));

    const todos: OverviewTodo[] = [
      ...links.filter(hasChanges).map((l) => ({ type: 'unpublished-changes' as const, ...linkInfo(l) })),
      ...links.filter((l) => !isPublished(l)).map((l) => ({ type: 'not-published' as const, ...linkInfo(l) })),
      ...(drafts.length > 0 ? [{ type: 'drafts' as const, drafts }] : []),
    ];

    const rate = (r: { responseCount: number; employeeCount: number }) => r.responseCount / r.employeeCount;
    const responseRates = links
      .filter(isPublished)
      .map((l) => ({
        ...linkInfo(l),
        responseCount: l.responseCount,
        employeeCount: findCompany(l.companyId).employeeCount,
      }))
      .sort((a, b) => rate(a) - rate(b));

    const overview: Overview = { todos, responseRates };
    res.json(overview);
  });

  app.get('/api/question-areas', (_req, res) => {
    res.json(questionAreas.map((area) => ({ ...area, questionCount: bank.filter((q) => q.area === area.id).length })));
  });

  app.get('/api/question-bank', (req, res) => {
    const area = typeof req.query.area === 'string' ? req.query.area : '';
    const search = searchQuery(req);
    const formCount = (questionId: string) =>
      forms.filter((f) => f.questions.some((q) => q.questionId === questionId)).length;
    const result: BankQuestionWithUsage[] = bank
      .filter((q) => (!area || q.area === area) && (!search || q.label.toLowerCase().includes(search)))
      .map((q) => ({ ...q, formCount: formCount(q.id) }));
    res.json(result);
  });

  app.get('/api/form-types', (_req, res) => {
    res.json(formTypes);
  });

  app.get('/api/forms', (req, res) => {
    const search = searchQuery(req);
    const limit = Number(req.query.limit);
    const result = forms
      .filter((f) => !search || f.name.toLowerCase().includes(search))
      .sort(byUpdatedDesc)
      .map(toSummary);
    res.json(Number.isInteger(limit) && limit > 0 ? result.slice(0, limit) : result);
  });

  app.post('/api/forms', (req, res) => {
    const input = parseBody(createFormSchema, req.body);
    const formType = findFormType(input.formTypeId);
    if (!formType) throw validationFailed([{ field: 'formTypeId', message: 'Okänd formulärtyp' }]);

    const timestamp = now().toISOString();
    const form: FormRecord = {
      id: `form-${nextId++}`,
      name: input.name ?? formType.name,
      formTypeId: formType.id,
      status: 'draft',
      version: 1,
      questions: formType.standardQuestionIds.map((questionId) => ({ questionId, required: true })),
      // Drafts are created when the user leaves step 1
      wizardStep: 2,
      contentVersion: 1,
      pendingEdit: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      updatedBy: currentUser.name,
    };
    forms = [...forms, form];
    res.status(201).json(toForm(form));
  });

  app.get('/api/forms/:id', (req, res) => {
    res.json(toForm(findFormRecord(req.params.id)));
  });

  app.put('/api/forms/:id', (req, res) => {
    const form = findFormRecord(req.params.id);
    const parsed = saveFormSchema.safeParse(req.body ?? {});
    if (parsed.success) assertVersion(form, parsed.data.version);

    const fieldErrors = parsed.success
      ? validateFormRules(parsed.data, bank, findFormType(parsed.data.formTypeId))
      : zodToFieldErrors(parsed.error);
    if (!parsed.success || fieldErrors.length) throw validationFailed(fieldErrors, 'Formuläret innehåller fel');

    const content = {
      name: parsed.data.name,
      formTypeId: parsed.data.formTypeId,
      questions: parsed.data.questions.map(({ questionId, required }) => ({ questionId, required })),
    };
    const timestamp = now().toISOString();
    // A saved form is in use, so edits wait in pendingEdit until "Spara ändringar" (complete)
    const updated: FormRecord =
      form.status === 'saved'
        ? {
            ...form,
            pendingEdit: {
              ...content,
              wizardStep: parsed.data.step ?? form.pendingEdit?.wizardStep ?? 2,
              updatedAt: timestamp,
            },
            version: form.version + 1,
          }
        : {
            ...form,
            ...content,
            wizardStep: parsed.data.step ?? form.wizardStep,
            version: form.version + 1,
            contentVersion: form.contentVersion + 1,
            updatedAt: timestamp,
            updatedBy: currentUser.name,
          };
    replaceForm(updated);
    res.json(toForm(updated));
  });

  /**
   * Step 3, "Granska och spara": a draft becomes a saved form that can be linked to companies.
   * For a saved form being edited, "Spara ändringar" makes the pending edit the live content.
   */
  app.post('/api/forms/:id/complete', (req, res) => {
    const form = findFormRecord(req.params.id);
    assertVersion(form, parseBody(versionOnlySchema, req.body).version);

    const { pendingEdit } = form;
    const completed: FormRecord = pendingEdit
      ? {
          ...form,
          name: pendingEdit.name,
          formTypeId: pendingEdit.formTypeId,
          questions: pendingEdit.questions,
          pendingEdit: null,
          version: form.version + 1,
          contentVersion: form.contentVersion + 1,
          updatedAt: now().toISOString(),
          updatedBy: currentUser.name,
        }
      : { ...form, status: 'saved' };
    replaceForm(completed);
    res.json(toForm(completed));
  });

  /** "Avbryt" while editing a saved form: throws the pending edit away. */
  app.post('/api/forms/:id/discard-edit', (req, res) => {
    const form = findFormRecord(req.params.id);
    assertVersion(form, parseBody(versionOnlySchema, req.body).version);

    const discarded: FormRecord = { ...form, pendingEdit: null, version: form.version + 1 };
    replaceForm(discarded);
    res.json(toForm(discarded));
  });

  app.post('/api/forms/:id/copy', (req, res) => {
    const source = findFormRecord(req.params.id);
    const input = parseBody(copyFormSchema, req.body);

    const timestamp = now().toISOString();
    const copy: FormRecord = {
      ...source,
      id: `form-${nextId++}`,
      name: input.name ?? `Kopia av ${source.name}`,
      status: 'draft',
      version: 1,
      questions: source.questions.map((q) => ({ ...q })),
      wizardStep: 2,
      contentVersion: 1,
      pendingEdit: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      updatedBy: currentUser.name,
    };
    forms = [...forms, copy];
    res.status(201).json(toForm(copy));
  });

  /** Deletes a form. Refused while it's linked to a company, so no company loses its form by accident. */
  app.delete('/api/forms/:id', (req, res) => {
    const form = findFormRecord(req.params.id);
    const linkedTo = links.filter((l) => l.formId === form.id).length;
    if (linkedTo > 0) {
      throw new ApiError(
        409,
        'FORM_LINKED',
        `Formuläret är kopplat till ${linkedTo} företag. Koppla bort det från företagen först.`,
      );
    }
    forms = forms.filter((f) => f.id !== form.id);
    res.status(204).end();
  });

  app.get('/api/companies', (req, res) => {
    const search = searchQuery(req);
    res.json(companies.filter((c) => !search || c.name.toLowerCase().includes(search) || c.orgNumber.includes(search)));
  });

  app.get('/api/companies/:id', (req, res) => {
    res.json(findCompany(req.params.id));
  });

  app.get('/api/companies/:id/forms', (req, res) => {
    const company = findCompany(req.params.id);
    const result = links
      .filter((l) => l.companyId === company.id)
      .map(toCompanyForm)
      .sort((a, b) => b.formUpdatedAt.localeCompare(a.formUpdatedAt));
    res.json(result);
  });

  /** "Koppla formulär": links a saved form to the company, as a draft or published right away. */
  app.post('/api/companies/:id/forms', (req, res) => {
    const company = findCompany(req.params.id);
    const { formId, publish } = parseBody(linkFormSchema, req.body);
    const form = forms.find((f) => f.id === formId);
    if (!form) throw validationFailed([{ field: 'formId', message: 'Formuläret finns inte' }]);
    if (form.status !== 'saved') {
      throw new ApiError(409, 'FORM_NOT_SAVED', 'Formuläret är inte färdigt. Granska och spara det först.');
    }
    if (links.some((l) => l.companyId === company.id && l.formId === form.id)) {
      throw new ApiError(409, 'ALREADY_LINKED', `Formuläret är redan kopplat till ${company.name}`);
    }

    const draftLink: CompanyFormLink = {
      companyId: company.id,
      formId: form.id,
      status: 'draft',
      publishedVersion: null,
      publishedAt: null,
      responseCount: 0,
      linkedAt: now().toISOString(),
    };
    const link = publish ? published(draftLink, form) : draftLink;
    links = [...links, link];
    res.status(201).json(toCompanyForm(link));
  });

  /** "Koppla bort": removes the link only. The form itself is kept. */
  app.delete('/api/companies/:id/forms/:formId', (req, res) => {
    const link = findLink(findCompany(req.params.id).id, req.params.formId);
    links = links.filter((l) => l !== link);
    res.status(204).end();
  });

  /** Publishes the form's current version at this company. */
  app.post('/api/companies/:id/forms/:formId/publish', (req, res) => {
    const link = findLink(findCompany(req.params.id).id, req.params.formId);
    const form = findFormRecord(link.formId);
    if (form.status !== 'saved') {
      throw new ApiError(409, 'FORM_NOT_SAVED', 'Formuläret är inte färdigt. Granska och spara det först.');
    }
    if (link.status === 'published' && link.publishedVersion === form.contentVersion) {
      throw new ApiError(409, 'ALREADY_PUBLISHED', 'Den här versionen är redan publicerad för företaget');
    }

    const updated = published(link, form);
    links = links.map((l) => (l === link ? updated : l));
    res.json(toCompanyForm(updated));
  });

  /** "Avpublicera": the employees can't answer any more. Answers already given are kept. */
  app.post('/api/companies/:id/forms/:formId/unpublish', (req, res) => {
    const link = findLink(findCompany(req.params.id).id, req.params.formId);
    if (link.status !== 'published') {
      throw new ApiError(409, 'NOT_PUBLISHED', 'Formuläret är inte publicerat för företaget');
    }

    const unpublished: CompanyFormLink = {
      ...link,
      status: 'draft',
      publishedVersion: null,
      publishedAt: null,
    };
    links = links.map((l) => (l === link ? unpublished : l));
    res.json(toCompanyForm(unpublished));
  });

  /** Restores all seed data. */
  app.post('/api/_reset', (_req, res) => {
    forms = seedForms(now());
    links = seedLinks(now());
    res.status(204).end();
  });

  app.use('/api', (_req, _res, next) => next(new ApiError(404, 'NOT_FOUND', 'Endpointen finns inte')));

  app.use((err: unknown, _req: Request, res: Response<ApiErrorBody>, _next: NextFunction) => {
    if (err instanceof ApiError) {
      res.status(err.status).json({
        error: { code: err.code, message: err.message, ...(err.fieldErrors && { fieldErrors: err.fieldErrors }) },
      });
      return;
    }
    if (err instanceof SyntaxError) {
      res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Ogiltig JSON i request body' } });
      return;
    }
    console.error(err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internt serverfel' } });
  });

  return app;
}
