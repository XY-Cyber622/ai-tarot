/**
 * Core Tarot domain types
 * MVP: only 22 Major Arcana supported.
 * Image for reversed: same as upright, rotated 180° via CSS.
 */

export type Arcana = 'major' | 'minor';
export type Element = 'fire' | 'water' | 'air' | 'earth';

export interface TarotCard {
  /** Unique ID, e.g. 'major-00' */
  id: string;
  /** English name, e.g. 'The Fool' */
  name: string;
  /** Chinese name, e.g. '愚者' */
  nameZh: string;
  /** Arcana type — MVP: always 'major' */
  arcana: Arcana;
  /** 0-21 for major arcana */
  number: number;
  /** Upright keywords (4-5 items) */
  keywords: string[];
  /** Reversed keywords (4-5 items) */
  reversedKeywords: string[];
  /** Upright meaning, ~30-50 chars */
  uprightMeaning: string;
  /** Reversed meaning, ~30-50 chars */
  reversedMeaning: string;
  /** Upright advice, ~15-30 chars */
  uprightAdvice: string;
  /** Reversed advice, ~15-30 chars */
  reversedAdvice: string;
  /** Symbolism description */
  symbolism: string;
  element: Element;
  /** Numerological value (0-21 for major) */
  numerology: number;
  /** Hebrew letter correspondence */
  hebrewLetter: string;
  /** Kabbalistic Tree of Life path number (11-32) */
  treeOfLifePath: number;
  /** Public asset path, e.g. '/cards/major-00.webp' */
  imageUrl: string;
}

/**
 * A card that has been drawn in a session.
 * Includes position and orientation.
 */
export interface DrawnCard {
  /** Reference to TarotCard.id */
  cardId: string;
  /** Position key in the spread, e.g. 'past' | 'present' | 'future' */
  position: string;
  /** Localized position name */
  positionName: string;
  /** True if reversed (upside-down) */
  isReversed: boolean;
}

export interface SpreadPosition {
  /** Stable key, e.g. 'past' */
  key: string;
  /** Localized name, e.g. '过去' */
  name: string;
  /** CSS percent x (0-100) on the layout canvas */
  x: number;
  /** CSS percent y (0-100) on the layout canvas */
  y: number;
  /** Optional rotation in degrees */
  rotation?: number;
}

export interface Spread {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
  /** When false, selectable in UI but disabled */
  enabled: boolean;
}
