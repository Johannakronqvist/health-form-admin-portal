import { getJson } from './client';
import type { Overview } from './types';

/** Översikt: what's waiting on the user, and how the published surveys are going. */
export function fetchOverview(signal?: AbortSignal): Promise<Overview> {
  return getJson<Overview>('/api/overview', signal);
}
