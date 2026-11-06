import { getJson, sendJson } from './client';
import type { Form, FormListItem, SaveFormInput } from './types';

/** All forms, last changed first. */
export function fetchForms(signal?: AbortSignal): Promise<FormListItem[]> {
  return getJson<FormListItem[]>('/api/forms', signal);
}

export function fetchForm(id: string, signal?: AbortSignal): Promise<Form> {
  return getJson<Form>(`/api/forms/${id}`, signal);
}

/** Creates a draft with the form type's standard questions. */
export function createForm(formTypeId: string): Promise<Form> {
  return sendJson<Form>('/api/forms', 'POST', { formTypeId });
}

/** Saves the whole form. Fails with 409 if `version` is out of date. */
export function saveForm(id: string, input: SaveFormInput): Promise<Form> {
  return sendJson<Form>(`/api/forms/${id}`, 'PUT', input);
}

/** "Spara formulär": the draft becomes a saved form that can be linked to companies. */
export function completeForm(id: string, version: number): Promise<Form> {
  return sendJson<Form>(`/api/forms/${id}/complete`, 'POST', { version });
}

/** Throws away the pending changes to a saved form ("Avbryt" while editing). */
export function discardEdit(id: string, version: number): Promise<Form> {
  return sendJson<Form>(`/api/forms/${id}/discard-edit`, 'POST', { version });
}

/** "Kopiera formulär": a new draft named "Kopia av ...". */
export function copyForm(id: string): Promise<Form> {
  return sendJson<Form>(`/api/forms/${id}/copy`, 'POST', {});
}

/** Deletes a form. Fails with 409 FORM_LINKED while it's linked to a company. */
export function deleteForm(id: string): Promise<void> {
  return sendJson<void>(`/api/forms/${id}`, 'DELETE');
}
