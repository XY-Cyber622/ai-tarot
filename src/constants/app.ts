/**
 * Tarot reading session constants
 */
export const QUESTION_MAX_LENGTH = 100;
export const QUESTION_MIN_LENGTH = 2;
export const REVERSED_PROBABILITY = 0.3;
export const SHUFFLE_DURATION_MS = 2500;
export const REVEAL_DELAY_MS = 300;
export const DEFAULT_HISTORY_LIMIT = 50;

/** Fan spread (Sprint 4 ritual enhancement) */
export const FAN_CARDS_TOTAL = 22;            // 22 Major Arcana
export const FAN_ARC_DEG = 60;                // total angular span of the fan
export const FLY_DURATION_MS = 700;           // card flying from fan → slot
export const FAN_HOVER_LIFT_PX = 14;          // hover lift on PC

/** localStorage keys */
export const STORAGE_KEYS = {
  HISTORY: 'ai-tarot:history',
  SESSION: 'ai-tarot:session',
  SETTINGS: 'ai-tarot:settings',
} as const;
