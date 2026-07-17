import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, PageHeader } from '@/components';
import { ReadingView } from '@/components/ReadingView';
import { ROUTES } from '@/constants/routes';
import { useSession } from '@/hooks/useSession';
import { saveRecord, makeRecordId } from '@/utils/storage';
import type { ReadingRecord } from '@/types/reading';
import styles from './Result.module.css';

export default function Result() {
  const navigate = useNavigate();
  const { question, spread, drawnCards, reading, reset } = useSession();
  // Use a ref, NOT useState, to track "already saved". Refs mutate
  // synchronously, so the second StrictMode double-invocation of the
  // effect below sees the flag and bails out.
  const savedRef = useRef<string | null>(null);
  const [saved, setSaved] = useState<{ saved: boolean; recordId: string | null }>({
    saved: false,
    recordId: null,
  });

  // Guard: no reading → bounce to home
  useEffect(() => {
    if (!reading) {
      navigate(ROUTES.LANDING, { replace: true });
    }
  }, [reading, navigate]);

  // Auto-save the reading to localStorage once. Ref guards against
  // StrictMode's double-invocation in dev and any re-render storm.
  useEffect(() => {
    if (!reading || savedRef.current) return;
    const record: ReadingRecord = {
      ...reading,
      id: makeRecordId(),
      createdAt: Date.now(),
      question,
      spreadId: spread.id,
      drawnCards,
    };
    saveRecord(record);
    savedRef.current = record.id;   // synchronous — visible to next call
    setSaved({ saved: true, recordId: record.id });
  }, [reading, question, spread.id, drawnCards]);

  if (!reading) return null;

  const handleAgain = () => {
    reset();
    navigate(ROUTES.LANDING, { replace: true });
  };

  const handleHistory = () => {
    navigate(ROUTES.HISTORY);
  };

  return (
    <main className={styles.page}>
      <Container size="medium">
        <PageHeader
          title="你的塔罗解读"
          subtitle={spread.name}
          badge="Sprint 3 · AI 解读"
          onBack={() => navigate(ROUTES.LANDING)}
        />

        <ReadingView
          reading={reading}
          question={question}
          spreadName={spread.name}
          drawnCards={drawnCards}
          showSavedTag={saved.saved}
        />

        <div className={styles.actionBar}>
          <Button variant="primary" onClick={handleAgain} aria-label="再来一次">
            ✦ 再问一次
          </Button>
          <Button variant="secondary" onClick={handleHistory} aria-label="查看历史">
            ☰ 查看历史
          </Button>
        </div>
      </Container>
    </main>
  );
}
