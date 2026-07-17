import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, PageHeader } from '@/components';
import { ROUTES } from '@/constants/routes';
import { SHUFFLE_DURATION_MS } from '@/constants/app';
import { useSession } from '@/hooks/useSession';
import styles from './Shuffle.module.css';

const CUT_PHASES = [
  { at: 0, label: '呼吸…' },
  { at: 700, label: '切牌' },
  { at: 1400, label: '再切一次' },
  { at: 2100, label: '即将展牌' },
];

export default function Shuffle() {
  const navigate = useNavigate();
  const { spread, drawnCards, setDrawnCards } = useSession();
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Trigger cut phases
  useEffect(() => {
    const timers: number[] = [];
    CUT_PHASES.forEach((p, idx) => {
      if (idx === 0) return;
      const id = window.setTimeout(() => setPhaseIdx(idx), p.at);
      timers.push(id);
    });
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  // If user navigated back to Shuffle with leftover picks, clear them
  // so they get a fresh fan to choose from.
  useEffect(() => {
    if (drawnCards.length > 0) {
      setDrawnCards([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigate to /draw after animation
  useEffect(() => {
    timerRef.current = window.setTimeout(() => {
      setDone(true);
    }, SHUFFLE_DURATION_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleSkip = () => {
    setDone(true);
  };

  useEffect(() => {
    if (done) navigate(ROUTES.DRAW);
  }, [done, navigate]);

  return (
    <main className={styles.page}>
      <Container size="narrow" className={`${styles.container} fade-in-up`}>
        <PageHeader
          title="洗牌中"
          subtitle="在心中默念你的问题"
          onBack={() => navigate(ROUTES.SPREAD)}
        />

        <div className={styles.deckArea}>
          <div className={styles.deck}>
            {Array.from({ length: 22 }).map((_, i) => {
              const seed = (i * 9301 + 49297) % 233280;
              const r = seed / 233280;
              const rot = (r - 0.5) * 12;
              const y = -i * 1.2;
              return (
                <div
                  key={i}
                  className={styles.layer}
                  style={{
                    zIndex: i + 1,
                    transform: `translateY(${y}px) rotate(${rot}deg)`,
                    ['--rot' as string]: `${rot}deg`,
                    animationDelay: `${(i % 5) * 80}ms`,
                  }}
                />
              );
            })}
          </div>
          <div className={styles.halo} aria-hidden="true" />
        </div>

        <p key={phaseIdx} className={`${styles.phase} ${styles.phaseFade}`}>
          {CUT_PHASES[phaseIdx].label}
        </p>

        <div className={styles.actions}>
          <Button variant="ghost" size="small" onClick={handleSkip}>
            跳过 →
          </Button>
        </div>
      </Container>
    </main>
  );
}
