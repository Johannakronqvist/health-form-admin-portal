# Health form mock API

A mock backend for Hälsoportalen, a staff tool in *företagshälsovård* (occupational health care).

The user is **Eva Holm, företagssköterska**. Before a health check, employees at customer
companies fill in a questionnaire. In this model, **forms are built once and reused**:

1. Eva creates a form from one of nine **form types**. The type decides the **standard
   questions** that are always included ("Ingår alltid").
2. She adds questions from the **question bank**, reorders them and names the form. The draft
   saves automatically.
3. She reviews and saves it ("Granska och spara"). The form now exists on its own, not tied to a company.
4. On a company's page she **links** saved forms and **publishes** them there. Removing a form from a company only removes the link.

Data lives in memory and is re-seeded on every restart (or via `POST /api/_reset`).

## Run it

Requires Node 20+.

```bash
npm install
npm run dev          # http://localhost:3001/api, restarts on file changes
```

| Env var           | Default | What it does                                              |
| ----------------- | ------- | --------------------------------------------------------- |
| `PORT`            | `3001`  | Port                                                      |
| `MOCK_DELAY_MS`   | `900`   | Latency added to every request, so loading states show up |
| `MOCK_ERROR_RATE` | `0`     | 0-1, fraction of requests that fail with 500 at random    |

Per-request overrides:

- `X-Mock-Delay: 3000` makes this request take 3 s.
- `X-Mock-Error: 503` makes this request fail with that status.

CORS is open, so a Vite dev server can call it directly, or proxy it in `vite.config.ts`:
`server: { proxy: { '/api': 'http://localhost:3001' } }`.

## Conventions

- JSON in and out. Timestamps are ISO 8601 in UTC.
  Show them in Swedish format with `Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', ... })`.
- No login. Every request acts as the user from `GET /api/me`.
- All shapes are in [`src/types.ts`](src/types.ts).

### Errors

Every error has the same shape:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Formuläret innehåller fel",
    "fieldErrors": [
      { "field": "name", "message": "Formuläret måste ha ett namn" },
      { "field": "questions.3.required", "message": "Standardfrågor måste vara obligatoriska" }
    ]
  }
}
```

`fieldErrors` only appears on `422`. `field` is a dot path into the request body.

| Status  | `code`                              | When                                                  |
| ------- | ----------------------------------- | ----------------------------------------------------- |
| 400     | `INVALID_JSON`                      | Malformed body                                        |
| 404     | `NOT_FOUND`                         | Unknown id or endpoint                                |
| 409     | `VERSION_CONFLICT`                  | Someone saved the form after you loaded it            |
| 409     | `FORM_NOT_SAVED`                    | Linking or publishing a form that is still a draft    |
| 409     | `ALREADY_LINKED`                    | The form is already linked to that company            |
| 409     | `ALREADY_PUBLISHED`                 | This version is already published at that company    |
| 422     | `VALIDATION_FAILED`                 | Validation failed, see `fieldErrors`                  |
| 500/503 | `INTERNAL_ERROR`, `SIMULATED_ERROR` | Server trouble (or simulated)                         |

## Endpoints

| Method & path                                    | What it does                                   |
| ------------------------------------------------ | ---------------------------------------------- |
| `GET /api/me`                                    | The logged-in staff member                     |
| `GET /api/question-areas`                        | Areas with question counts (filter chips)      |
| `GET /api/question-bank?area=&search=`           | Bank questions                                 |
| `GET /api/form-types`                            | The nine form types and their standard questions |
| `GET /api/forms?search=&limit=`                  | Form summaries, most recently changed first    |
| `POST /api/forms`                                | Create a draft from a form type                |
| `GET /api/forms/:id`                             | One form with its questions                    |
| `PUT /api/forms/:id`                             | Save (autosave) name, type and questions       |
| `POST /api/forms/:id/complete`                   | Step 3: draft -> saved, or save a pending edit  |
| `POST /api/forms/:id/discard-edit`               | Throw away a pending edit of a saved form      |
| `POST /api/forms/:id/copy`                       | Copy a form as a new draft                     |
| `DELETE /api/forms/:id`                          | Delete a form that isn't linked to a company   |
| `GET /api/overview`                              | Översikt: to-dos and response rates            |
| `GET /api/companies?search=`                     | Companies (for the menu)                       |
| `GET /api/companies/:id`                         | One company                                    |
| `GET /api/companies/:id/forms`                   | Forms linked to the company                    |
| `POST /api/companies/:id/forms`                  | Link a saved form ("Lägg till formulär")       |
| `DELETE /api/companies/:id/forms/:formId`        | Remove the link (the form is kept)             |
| `POST /api/companies/:id/forms/:formId/publish`  | Publish the form at this company               |
| `POST /api/companies/:id/forms/:formId/unpublish`| Unpublish it ("Avpublicera")                   |
| `POST /api/_reset`                               | Restore the seed data (`204`)                  |

### `GET /api/me`

```json
{ "id": "staff-1", "name": "Eva Holm", "title": "Företagssköterska" }
```

### `GET /api/question-areas`

```json
[{ "id": "general-health", "label": "Allmän hälsa", "questionCount": 4 }]
```

Areas: `general-health`, `medication`, `lifestyle`, `physical-work-environment`,
`psychosocial-work-environment`.

### `GET /api/question-bank?area=&search=`

Both parameters are optional. `search` matches the question text.

```json
[
  {
    "id": "q-shift-work",
    "area": "physical-work-environment",
    "type": "single-choice",
    "label": "Arbetar du natt eller skift?",
    "options": [{ "value": "no", "label": "Nej" }, { "value": "shift", "label": "Ja, skift" }],
    "guidance": "Använd frågan i verksamheter med dygnet-runt-arbete, ...",
    "guidanceTip": "Kombinera gärna med frågan om sömn.",
    "updatedAt": "2026-09-12T09:00:00.000Z",
    "formCount": 2
  }
]
```

- `type`: `text | textarea | number | boolean | single-choice | scale`. `options` is only set for
  `single-choice`, `min`/`max` only for `number` and `scale`. `helpText` is optional.
- `guidance` ("När ska frågan användas?") and `guidanceTip` are optional, for the question details.
- `formCount`: how many forms use the question ("Används i 2 formulär").

### `GET /api/form-types`

```json
[
  {
    "id": "health-profile-workplace",
    "name": "Hälsoprofil med Arbetsplatsprofil",
    "description": "Hälsoprofil och arbetsmiljö i samma formulär.",
    "standardQuestionIds": ["q-general-health", "q-medication"]
  }
]
```

### `GET /api/forms?search=&limit=`

Sorted by `updatedAt`, newest first. Use `limit=4` for "Senast ändrade formulär".

```json
[
  {
    "id": "form-1",
    "name": "Hälsoprofil med Arbetsplatsprofil - Bygg",
    "formTypeId": "health-profile-workplace",
    "formTypeName": "Hälsoprofil med Arbetsplatsprofil",
    "status": "saved",
    "version": 4,
    "questionCount": 7,
    "selectedQuestionCount": 5,
    "wizardStep": 3,
    "companyCount": 2,
    "publishedCount": 2,
    "updatedAt": "2026-10-28T08:30:00.000Z",
    "updatedBy": "Eva Holm"
  }
]
```

- `status`: `draft` while it's being built, `saved` after step 3.
- `selectedQuestionCount`: questions chosen on top of the type's standard questions ("5 frågor valda").
- `wizardStep`: the create-flow step a draft was left on (1-3), for "Fortsätt där du slutade".
- `companyCount` is "Används av". The overview badge can be derived from `publishedCount`:
  **Publicerad** if it's published at at least one company, otherwise **Utkast**.

### `POST /api/forms`

Body: `{ "formTypeId": "health-profile-workplace", "name": "Valfritt namn" }`. `name` is optional
and defaults to the type's name. Returns `201` with a draft that already contains the type's
standard questions.

### `GET /api/forms/:id`

```json
{
  "id": "form-1",
  "name": "Hälsoprofil med Arbetsplatsprofil - Bygg",
  "formTypeId": "health-profile-workplace",
  "formTypeName": "Hälsoprofil med Arbetsplatsprofil",
  "status": "saved",
  "version": 4,
  "createdAt": "...",
  "updatedAt": "...",
  "updatedBy": "Eva Holm",
  "questions": [
    {
      "questionId": "q-general-health",
      "area": "general-health",
      "type": "scale",
      "label": "Hur bedömer du din allmänna hälsa just nu?",
      "helpText": "1 = mycket dålig, 5 = mycket bra",
      "min": 1,
      "max": 5,
      "required": true,
      "standard": true
    }
  ]
}
```

The order of `questions` is the order employees see. `standard: true` means "Ingår alltid".

### `PUT /api/forms/:id`

Saves the whole form. Send back the `version` you loaded. Extra fields on questions are ignored,
so you can send the questions from your state as they are.

```json
{
  "version": 4,
  "name": "Hälsoprofil med Arbetsplatsprofil - Bygg",
  "formTypeId": "health-profile-workplace",
  "questions": [
    { "questionId": "q-general-health", "required": true },
    { "questionId": "q-noise", "required": false }
  ]
}
```

| Field                    | Rule                                                              |
| ------------------------ | ----------------------------------------------------------------- |
| `name`                   | Required, max 100 characters                                      |
| `formTypeId`             | A known form type                                                 |
| `questions`              | 1-40; must include all standard questions of the type            |
| `questions.N.questionId` | Must exist in the bank; each question only once                  |
| `questions.N.required`   | Must be `true` for standard questions                            |
| `step`                   | Optional, 1-3: the create-flow step the draft is on              |

If you change `formTypeId` ("Ändra" in step 2), add the new type's standard questions too.

Saving increases `version` by 1 and keeps `status`. If `version` doesn't match, you get
`409 VERSION_CONFLICT`.

Editing a saved form that is published somewhere doesn't change what the companies see: their
link sets `hasUnpublishedChanges: true` until it's published again.

### `POST /api/forms/:id/complete`

Body: `{ "version": 4 }`. Step 3: sets `status` to `saved`. Returns the form.

**Editing a saved form.** A saved form is in use, so `PUT` doesn't change it right away: the
changes are kept as a pending edit, and `GET /api/forms/:id` returns them with `editing: true`.
The list (`GET /api/forms`) and the companies still see the live form. `complete` makes the pending
edit the live form ("Spara ändringar") and increases `contentVersion`, so companies where it's
published get `hasUnpublishedChanges: true`.

- `version` increases on every save (also of a pending edit) and guards against overwrites.
- `contentVersion` increases only when the live content changes. Publishing records it as
  `publishedVersion`.

### `POST /api/forms/:id/discard-edit`

Body: `{ "version": 5 }`. Throws the pending edit away ("Avbryt" while editing). Returns the form.

### `POST /api/forms/:id/copy`

Body: `{ "name": "Valfritt namn" }` (optional; defaults to "Kopia av ..."). Returns `201` with
a new draft.

### `DELETE /api/forms/:id`

Deletes the form. Returns `204`. `409 FORM_LINKED` while it's linked to any company: unlink it
from the companies first, so no company loses a form by accident. The frontend should confirm first.

### `GET /api/overview`

What's waiting on the user ("Att göra") and how the published surveys are going ("Så går enkäterna").

```json
{
  "todos": [
    { "type": "unpublished-changes", "formId": "form-1", "formName": "...", "companyId": "org-3", "companyName": "..." },
    { "type": "not-published", "formId": "form-3", "formName": "OSA 2026", "companyId": "org-1", "companyName": "..." },
    { "type": "drafts", "drafts": [{ "id": "form-5", "name": "Hälsoprofil - IT", "wizardStep": 2 }] }
  ],
  "responseRates": [
    { "formId": "form-2", "formName": "...", "companyId": "org-5", "companyName": "...", "responseCount": 2, "employeeCount": 52 }
  ]
}
```

- `todos`: published forms with unpublished changes, then linked forms that aren't published, then
  one item for all drafts (left out when there are none).
- `responseRates`: one row per published form and company, lowest `responseCount / employeeCount` first.

### `GET /api/companies?search=`

`search` matches name or org number.

```json
[{ "id": "org-1", "name": "Nordbygg AB", "orgNumber": "556123-4567", "industry": "Bygg", "employeeCount": 240 }]
```

### `GET /api/companies/:id/forms`

```json
[
  {
    "formId": "form-1",
    "name": "Hälsoprofil med Arbetsplatsprofil - Bygg",
    "formTypeId": "health-profile-workplace",
    "formTypeName": "Hälsoprofil med Arbetsplatsprofil",
    "companyCount": 2,
    "formUpdatedAt": "...",
    "formUpdatedBy": "Eva Holm",
    "status": "published",
    "publishedVersion": 4,
    "publishedAt": "...",
    "hasUnpublishedChanges": false,
    "responseCount": 0,
    "linkedAt": "..."
  }
]
```

- `status`: `draft` (linked, not published) or `published`.
- `companyCount`: how many companies the form is linked to ("Används av 2 företag").
- `responseCount`: answers received from this company. Use it to decide how strongly to warn
  before removing the link.

### `POST /api/companies/:id/forms`

Body: `{ "formId": "form-3" }`. Returns `201` with the new link (status `draft`). Add
`"publish": true` to publish it right away ("Publicera nu").
`409 FORM_NOT_SAVED` for drafts, `409 ALREADY_LINKED` if it's already there.

### `DELETE /api/companies/:id/forms/:formId`

Removes the link only; the form is kept. Returns `204`. The API doesn't ask for confirmation,
so the frontend should.

### `POST /api/companies/:id/forms/:formId/publish`

No body. Publishes the form's current version at this company. `409 FORM_NOT_SAVED` if the form
is a draft, `409 ALREADY_PUBLISHED` if this version is already published there.

### `POST /api/companies/:id/forms/:formId/unpublish`

No body. Sets the link back to `draft`, so the employees can't answer any more. Answers already
given are kept. `409 NOT_PUBLISHED` if it isn't published.

## Seed data

- 5 companies, 28 bank questions in 5 areas, 9 form types.
- 5 forms: four saved ones from the designs and one draft ("Hälsoprofil - IT", by Jonas Eriksson).
- "Hälsoprofil med Arbetsplatsprofil - Bygg" is published at Västkustens Åkeri AB at an older
  version, so you can see `hasUnpublishedChanges` and a link with responses.
