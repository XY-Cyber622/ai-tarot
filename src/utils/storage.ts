import type { ReadingRecord } from '@/types/reading';

/** Type alias for a saved reading's id. */
export type RecordId = ReadingRecord['id'];

/**
 * LocalStorage helpers for reading history.
 * Sprint 3: persist past readings so users can revisit them.
 */

const STORAGE_KEY = 'tarot:history:v1';

function readRaw(): ReadingRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as ReadingRecord[];
  } catch (err) {
    console.warn('[storage] failed to read history:', err);
    return [];
  }
}

function writeRaw(records: ReadingRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.warn('[storage] failed to write history:', err);
  }
}

/** Add or replace a record (by id). Newest first.
 *  Content-based dedup: if an identical record (same question+spread+cards)
 *  already exists within the last 10 seconds, return its id without writing
 *  a new entry. This is a safety net for any double-save (StrictMode, etc.). */
export function saveRecord(record: ReadingRecord): string {
  const all = readRaw();
  const idx = all.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    all[idx] = record;
    writeRaw(all);
    return record.id;
  }

  // Look for a near-duplicate
  const now = record.createdAt;
  const dup = all.find(
    (r) =>
      now - r.createdAt < 10_000 &&
      r.question === record.question &&
      r.spreadId === record.spreadId &&
      sameCards(r.drawnCards, record.drawnCards)
  );
  if (dup) return dup.id;

  all.unshift(record);
  writeRaw(all);
  return record.id;
}

function sameCards(
  a: ReadingRecord['drawnCards'],
  b: ReadingRecord['drawnCards']
): boolean {
  if (a.length !== b.length) return false;
  const sig = (c: { cardId: string; isReversed: boolean }) =>
    `${c.cardId}:${c.isReversed ? 1 : 0}`;
  const sa = a.map(sig).sort().join('|');
  const sb = b.map(sig).sort().join('|');
  return sa === sb;
}

export function listRecords(): ReadingRecord[] {
  return readRaw();
}

export function getRecord(id: string): ReadingRecord | null {
  return readRaw().find((r) => r.id === id) ?? null;
}

export function deleteRecord(id: string): void {
  writeRaw(readRaw().filter((r) => r.id !== id));
}

export function clearRecords(): void {
  writeRaw([]);
}

/** Generate a short, readable id (uuid-ish, no deps). */
export function makeRecordId(): string {
  const a = Math.random().toString(36).slice(2, 8);
  const b = Date.now().toString(36);
  return `r-${b}-${a}`;
}
