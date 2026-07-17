import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { DrawnCard, Spread } from '@/types/tarot';
import type { TarotReading } from '@/types/reading';
import { DEFAULT_SPREAD_ID, SPREAD_BY_ID } from '@/data/spreads';

export interface SessionState {
  question: string;
  spread: Spread;
  drawnCards: DrawnCard[];
  reading: TarotReading | null;
  recordId: string | null;
}

export interface SessionContextValue extends SessionState {
  setQuestion: (q: string) => void;
  setSpread: (spreadId: string) => void;
  setDrawnCards: (cards: DrawnCard[]) => void;
  setReading: (reading: TarotReading | null) => void;
  setRecordId: (id: string | null) => void;
  reset: () => void;
}

const INITIAL_STATE: SessionState = {
  question: '',
  spread: SPREAD_BY_ID[DEFAULT_SPREAD_ID]!,
  drawnCards: [],
  reading: null,
  recordId: null,
};

export const SessionContext = createContext<SessionContextValue | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [question, setQuestion] = useState('');
  const [spread, setSpreadState] = useState<Spread>(INITIAL_STATE.spread);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [reading, setReading] = useState<TarotReading | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);

  const setSpread = useCallback((spreadId: string) => {
    const next = SPREAD_BY_ID[spreadId];
    if (!next) {
      console.warn(`[Session] unknown spreadId: ${spreadId}`);
      return;
    }
    setSpreadState(next);
  }, []);

  const reset = useCallback(() => {
    setQuestion('');
    setSpreadState(INITIAL_STATE.spread);
    setDrawnCards([]);
    setReading(null);
    setRecordId(null);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      question,
      spread,
      drawnCards,
      reading,
      recordId,
      setQuestion,
      setSpread,
      setDrawnCards,
      setReading,
      setRecordId,
      reset,
    }),
    [question, spread, drawnCards, reading, recordId, setSpread, reset]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
