import type { TarotCard, DrawnCard } from '@/types/tarot';
import { MAJOR_ARCANA } from './major-arcana';
import { REVERSED_PROBABILITY } from '@/constants/app';

/**
 * Fisher-Yates shuffle (in-place). Returns the same array.
 */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Draw N cards from the deck without replacement.
 * Each card has a 30% chance to be reversed (per PROMPT_SPEC / PRD).
 */
export function drawCards(
  count: number,
  source: TarotCard[] = MAJOR_ARCANA
): TarotCard[] {
  if (count > source.length) {
    throw new Error(
      `drawCards: cannot draw ${count} cards from a deck of ${source.length}`
    );
  }
  const copy = [...source];
  shuffle(copy);
  return copy.slice(0, count);
}

/**
 * Build DrawnCard[] by assigning positions and orientations.
 */
export function buildDrawnCards(
  cards: TarotCard[],
  positions: ReadonlyArray<{ key: string; name: string }>,
  reversedProbability: number = REVERSED_PROBABILITY
): DrawnCard[] {
  if (cards.length !== positions.length) {
    throw new Error(
      `buildDrawnCards: cards (${cards.length}) and positions (${positions.length}) length mismatch`
    );
  }
  return cards.map((card, idx) => ({
    cardId: card.id,
    position: positions[idx].key,
    positionName: positions[idx].name,
    isReversed: Math.random() < reversedProbability,
  }));
}

/**
 * One-shot: shuffle deck + draw + assign positions.
 */
export function performDraw(
  positions: ReadonlyArray<{ key: string; name: string }>,
  source: TarotCard[] = MAJOR_ARCANA
): DrawnCard[] {
  return buildDrawnCards(drawCards(positions.length, source), positions);
}

/**
 * Build a single DrawnCard for a card the user has just picked from the fan.
 * Caller supplies the cardId (already chosen by user) and the position it
 * should occupy (in order of picks: past → present → future).
 * isReversed is randomized per pick.
 */
export function pickOne(
  cardId: string,
  position: { key: string; name: string },
  reversedProbability: number = REVERSED_PROBABILITY
): DrawnCard {
  return {
    cardId,
    position: position.key,
    positionName: position.name,
    isReversed: Math.random() < reversedProbability,
  };
}
