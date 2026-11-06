import { getJson } from './client';
import type { FormType } from './types';

export function fetchFormTypes(signal?: AbortSignal): Promise<FormType[]> {
  return getJson<FormType[]>('/api/form-types', signal);
}
