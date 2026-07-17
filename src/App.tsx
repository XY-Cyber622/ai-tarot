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
  useEffect(() => {
    void preloadCardImages();
  }, []);

  return (
    <SessionProvider>
      <Background />
      <Suspense fallback={null}>
        <AppRouter />
      </Suspense>
    </SessionProvider>
  );
}
