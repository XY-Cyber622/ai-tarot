/**
 * Lightweight string validation helpers.
 */

import { QUESTION_MAX_LENGTH, QUESTION_MIN_LENGTH } from '@/constants/app';

export function isNonEmptyString(s: unknown): s is string {
  return typeof s === 'string' && s.trim().length > 0;
}

/**
 * Validate a user question.
 * Returns an error key (string) or null when valid.
 */
export function validateQuestion(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < QUESTION_MIN_LENGTH) {
    return '问题太短了，请至少输入两个字';
  }
  if (trimmed.length > QUESTION_MAX_LENGTH) {
    return `问题不能超过 ${QUESTION_MAX_LENGTH} 个字`;
  }
  return null;
}

/** Truncate and append ellipsis if needed. */
export function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1))}…`;
}
