import { useContext } from 'react';
import { SessionContext, type SessionContextValue } from '@/context/SessionContext';

/**
 * Access the global session state.
 * Throws if used outside of a <SessionProvider>.
 */
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a <SessionProvider>');
  }
  return ctx;
}
