import { Suspense, useEffect } from 'react';
import { AppRouter } from './router';
import { SessionProvider } from './context/SessionContext';
import { Background } from './components/Background';
import { preloadCardImages } from './utils/preload';

export default function App() {
  // Warm up the browser's image cache as early as possible — by the
  // time the user reaches the Draw page, every Major Arcana image is
  // already decoded and an <img src> in the DOM is an instant hit.
  // Non-blocking: failures are silently ignored (the Card component
  // has its own onError fallback).
  // #region debug-point ip1
  useEffect(() => {
    const t0 = performance.now();
    void fetch('http://127.0.0.1:7777/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'card-image-load-fail',
        runId: 'pre-fix',
        hypothesisId: 'H1',
        msg: `[ip1] preload start`,
        ts: Date.now(),
      }),
    }).catch(() => {});
    void preloadCardImages().then((r) => {
      void fetch('http://127.0.0.1:7777/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'card-image-load-fail',
          runId: 'pre-fix',
          hypothesisId: 'H1',
          msg: `[ip1] preload done ok=${r.ok.length} failed=${r.failed.length} dt=${Math.round(performance.now() - t0)}ms`,
          failed: r.failed,
          ts: Date.now(),
        }),
      }).catch(() => {});
    });
  }, []);
  // #endregion debug-point ip1

  return (
    <SessionProvider>
      <Background />
      <Suspense fallback={null}>
        <AppRouter />
      </Suspense>
    </SessionProvider>
  );
}
