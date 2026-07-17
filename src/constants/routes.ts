/**
 * Application route constants
 * 9 main pages + 404
 */
export const ROUTES = {
  LANDING: '/',
  QUESTION: '/question',
  SPREAD: '/spread',
  SHUFFLE: '/shuffle',
  DRAW: '/draw',
  READING: '/reading',
  RESULT: '/result',
  HISTORY: '/history',
  HISTORY_DETAIL: '/history/:id',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
