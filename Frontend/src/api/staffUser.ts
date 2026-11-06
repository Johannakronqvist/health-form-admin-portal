import { getJson } from './client';
import type { StaffUser } from './types';

/** The logged-in staff member (GET /api/me): name and title for the sidebar and Översikt. */
export function fetchStaffUser(signal?: AbortSignal): Promise<StaffUser> {
  return getJson<StaffUser>('/api/me', signal);
}
