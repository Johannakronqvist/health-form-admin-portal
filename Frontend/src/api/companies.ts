import { getJson, sendJson } from './client';
import type { Company, CompanyForm } from './types';

export function fetchCompanies(signal?: AbortSignal): Promise<Company[]> {
  return getJson<Company[]>('/api/companies', signal);
}

export function fetchCompany(id: string, signal?: AbortSignal): Promise<Company> {
  return getJson<Company>(`/api/companies/${id}`, signal);
}

/** The forms linked to a company, with their status there. */
export function fetchCompanyForms(id: string, signal?: AbortSignal): Promise<CompanyForm[]> {
  return getJson<CompanyForm[]>(`/api/companies/${id}/forms`, signal);
}

/** "Koppla formulär": links a saved form to the company, published right away or as Utkast. */
export function linkForm(companyId: string, formId: string, publish: boolean): Promise<CompanyForm> {
  return sendJson<CompanyForm>(`/api/companies/${companyId}/forms`, 'POST', { formId, publish });
}

/** "Publicera": the employees can answer the form. */
export function publishForm(companyId: string, formId: string): Promise<CompanyForm> {
  return sendJson<CompanyForm>(`/api/companies/${companyId}/forms/${formId}/publish`, 'POST', {});
}

/** "Avpublicera": the employees can't answer any more. Answers already given are kept. */
export function unpublishForm(companyId: string, formId: string): Promise<CompanyForm> {
  return sendJson<CompanyForm>(`/api/companies/${companyId}/forms/${formId}/unpublish`, 'POST');
}

/** Removes the link. The form itself is kept. */
export function unlinkForm(companyId: string, formId: string): Promise<void> {
  return sendJson<void>(`/api/companies/${companyId}/forms/${formId}`, 'DELETE');
}
