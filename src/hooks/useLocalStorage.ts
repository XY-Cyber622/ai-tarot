import { useCallback, useEffect, useState } from 'react';

/**
 * Reactively persist a state value to localStorage.
 * SSR-safe: gracefully no-ops on the server.
 *
 * The stored JSON must be a primitive, plain object, or array —
 * values are `JSON.parse`/`stringify` round-tripped.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [stored, setStored] = useState<T>(() => readStorage<T>(key, initialValue));

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        writeStorage(key, next);
        return next;
      });
    },
    [key]
  );

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[useLocalStorage] remove failed for key "${key}"`, err);
    }
    setStored(initialValue);
  }, [key, initialValue]);

  // Sync state across tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== key || e.newValue === null) return;
      try {
        setStored(JSON.parse(e.newValue) as T);
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [stored, setValue, remove];
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[useLocalStorage] parse failed for key "${key}"`, err);
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[useLocalStorage] write failed for key "${key}"`, err);
  }
}
