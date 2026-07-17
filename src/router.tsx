import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './constants/routes';

// Lazy-loaded pages
const Landing = lazy(() => import('@/pages/Landing'));
const Question = lazy(() => import('@/pages/Question'));
const Spread = lazy(() => import('@/pages/Spread'));
const Shuffle = lazy(() => import('@/pages/Shuffle'));
const Draw = lazy(() => import('@/pages/Draw'));

// Sprint 3: Real Result, History list, History detail
const Result = lazy(() => import('@/pages/Result'));
const History = lazy(() => import('@/pages/History'));
const HistoryDetail = lazy(() => import('@/pages/HistoryDetail'));
const NotFound = lazy(() => import('@/pages/NotFoundPage'));

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.LANDING} element={<Landing />} />
      <Route path={ROUTES.QUESTION} element={<Question />} />
      <Route path={ROUTES.SPREAD} element={<Spread />} />
      <Route path={ROUTES.SHUFFLE} element={<Shuffle />} />
      <Route path={ROUTES.DRAW} element={<Draw />} />
      <Route path={ROUTES.RESULT} element={<Result />} />
      <Route path={ROUTES.HISTORY} element={<History />} />
      <Route path={ROUTES.HISTORY_DETAIL} element={<HistoryDetail />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
