import type { DrawnCard } from './tarot';

/**
 * Per-card interpretation produced by the AI.
 * Mirrors PROMPT_SPEC perCard output.
 */
export interface PerCardReading {
  position: string;
  positionName: string;
  coreEnergy: string;
  interpretation: string;
  suggestion: string;
}

/**
 * Lucky items for the day.
 * Mirrors PROMPT_SPEC lucky output (nested structure).
 */
export interface LuckyItems {
  color: {
    name: string;
    hex: string;
    meaning: string;
  };
  number: {
    value: number;
    meaning: string;
  };
  phrase: string;
}

/**
 * AI reading response. Validated by prompt-engineering guard.
 */
export interface TarotReading {
  schemaVersion: string;
  reading: {
    overview: string;
    perCard: PerCardReading[];
    advice: string;
  };
  lucky: LuckyItems;
}

/**
 * Persisted reading record (one session of consultation).
 */
export interface ReadingRecord extends TarotReading {
  /** Unique record id (uuid) */
  id: string;
  /** Unix ms timestamp */
  createdAt: number;
  /** User question */
  question: string;
  /** Spread id used */
  spreadId: string;
  /** Drawn cards (in order) */
  drawnCards: DrawnCard[];
  /** Free-form tag (e.g. 'love', 'career') */
  tag?: string;
}

/**
 * Minimal session data shared across pages.
 * Persisted to sessionStorage (Sprint 1: in-memory only).
 */
export interface SessionData {
  question: string;
  spreadId: string;
  drawnCards: DrawnCard[];
  reading: TarotReading | null;
  recordId: string | null;
}
