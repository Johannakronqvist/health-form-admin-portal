import { getJson } from './client';
import type { BankQuestion, QuestionArea } from './types';

export function fetchQuestionBank(signal?: AbortSignal): Promise<BankQuestion[]> {
  return getJson<BankQuestion[]>('/api/question-bank', signal);
}

export function fetchQuestionAreas(signal?: AbortSignal): Promise<QuestionArea[]> {
  return getJson<QuestionArea[]>('/api/question-areas', signal);
}
