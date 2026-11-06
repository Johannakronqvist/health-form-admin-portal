import type { ApiErrorBody, FieldError } from './types';

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: FieldError[];

  constructor(status: number, code: string, message: string, fieldErrors: FieldError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiErrorBody).error?.message === 'string'
  );
}

/** Fetches JSON. Throws ApiError for non-2xx responses. */
async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (isApiErrorBody(body)) {
      throw new ApiError(response.status, body.error.code, body.error.message, body.error.fieldErrors);
    }
    throw new ApiError(response.status, 'UNKNOWN', 'Något gick fel. Försök igen.');
  }

  return body as T;
}

/** GET a JSON resource. Throws ApiError for non-2xx responses. */
export function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  return request<T>(path, { signal, headers: { Accept: 'application/json' } });
}

/** POST, PUT or DELETE, with an optional JSON body. Throws ApiError for non-2xx responses. */
export function sendJson<T>(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<T> {
  return request<T>(path, {
    method,
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
