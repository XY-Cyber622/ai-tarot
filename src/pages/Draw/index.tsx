import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Container, Loading, PageHeader, Progress } from '@/components';
import { ROUTES } from '@/constants/routes';
import { FAN_ARC_DEG, REVEAL_DELAY_MS } from '@/constants/app';
import { useSession } from '@/hooks/useSession';
import { MAJOR_ARCANA } from '@/data/major-arcana';
import { pickOne, shuffle } from '@/data/deck';
import { callReading } from '@/services/ai';
import styles from './Draw.module.css';

export default function Draw() {
  const navigate = useNavigate();
  const {
    drawnCards,
    spread,
    reset,
    question,
    setReading,
    setDrawnCards,
  } = useSession();
  const [revealedCount, setRevealedCount] = useState(0);
  const [aiPending, setAiPending] = useState(false);
  const triggeredRef = useRef(false);

  const total = spread.cardCount;
  const allPicked = drawnCards.length >= total;
  const allRevealed = revealedCount >= total;

  // Stable fan order — shuffled once on mount so the order is different
  // every visit (no entry determinism) but stable while the user picks.
  const fanOrder = useMemo(
    () => shuffle(MAJOR_ARCANA.map((c) => c.id)),
    []
  );

  // Remaining fan ids in their original order. Cards keep their slot
  // in the fan when neighbours are picked (gap stays where the pick was).
  const remainingFanIds = useMemo(() => {
    const picked = new Set(drawnCards.map((d) => d.cardId));
    return fanOrder.filter((id) => !picked.has(id));
  }, [fanOrder, drawnCards]);

  const handlePick = (cardId: string) => {
    if (drawnCards.length >= total) return;
    const next = pickOne(cardId, spread.positions[drawnCards.length]);
    setDrawnCards([...drawnCards, next]);
  };

  const handleReveal = () => {
    if (revealedCount >= total) return;
    setRevealedCount((n) => n + 1);
  };

  // Reveal a specific card by 1-based index. Used by both the keyboard
  // shortcut (1-9, 0) and any other "jump to card N" affordance.
  // No-op if the card isn't the next one in sequence — preserves the
  // ritual order (the user must reveal in the same order they picked).
  const handleRevealIndex = (idx: number) => {
    if (!allPicked) return;
    if (idx !== revealedCount) return; // only the next card is flippable
    handleReveal();
  };

  // Keyboard shortcuts during the reveal phase:
  //   1..9  → flip card N (next = revealedCount + 1)
  //   0     → flip card 10
  //   Space / Enter → flip the next card
  // Listening on window so it works whether or not a card has focus.
  useEffect(() => {
    if (!allPicked || allRevealed) return;
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack typing in inputs (defensive — there are none on
      // this page, but future-proof).
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleReveal();
        return;
      }
      // Map '0' → 9 (0-based), '1'..'9' → 0..8
      if (/^[0-9]$/.test(e.key)) {
        const n = e.key === '0' ? 9 : Number(e.key) - 1;
        handleRevealIndex(n);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [allPicked, allRevealed, revealedCount, total]);

  // Single-trigger AI call: only fires once after all cards are revealed.
  // Ref guards against StrictMode double-invocation in dev.
  useEffect(() => {
    if (!allRevealed || triggeredRef.current) return;
    triggeredRef.current = true;
    setAiPending(true);
    const pause = window.setTimeout(async () => {
      const res = await callReading({ question, spread, drawnCards });
      if (res.data) {
        setReading(res.data);
      }
      setAiPending(false);
      navigate(ROUTES.RESULT, { replace: true });
    }, REVEAL_DELAY_MS * 2);
    return () => window.clearTimeout(pause);
  }, [allRevealed, question, spread, drawnCards, setReading, navigate]);

  const handleRestart = () => {
    reset();
    navigate(ROUTES.LANDING, { replace: true });
  };

  // Compute position for any card given its state.
  // - In a slot: use the spread's own position definition (x/y on a
  //   0-100 canvas, remapped to the upper half of the stage so the
  //   fan at y=75 doesn't collide with low cards).
  //   - The `rotation` field on the position is honored so the
  //     celtic-cross "challenge" card lays crosswise over "present".
  //   - z-index: present is always on top of the overlaying challenge;
  //     right column cards stack below the center cross.
  // - In the fan: parabolic arc in the lower area, tilted by FAN_ARC_DEG
  const getPlacement = (cardId: string) => {
    const slotIdx = drawnCards.findIndex((d) => d.cardId === cardId);
    if (slotIdx >= 0) {
      const pos = spread.positions[slotIdx];
      if (!pos) {
        // Out-of-range fallback: stick it in the centre.
        return { type: 'slot' as const, idx: slotIdx, x: 50, y: 25, rot: 0, z: 100 + slotIdx };
      }
      // Remap spread y (0-100) → stage y (0-100) on the upper half.
      // 5 + y*0.42 → range [5, 47]. Keeps the fan area (y=75) clear.
      const yStage = 5 + pos.y * 0.42;
      // Celtic Cross layering:
      //   - present (idx 0) sits on top
      //   - challenge (idx 1) lays underneath present so present is visible
      //   - past/future/above/below (idx 2..5) under present
      //   - right column (idx 6..9) at z = 90 (well below the cross)
      let z: number;
      if (pos.key === 'present') z = 110;
      else if (pos.key === 'challenge') z = 95;
      else if (slotIdx >= 6) z = 90;
      else z = 100 + slotIdx;
      return {
        type: 'slot' as const,
        idx: slotIdx,
        x: pos.x,
        y: yStage,
        rot: pos.rotation ?? 0,
        z,
      };
    }
    const fanIdx = remainingFanIds.indexOf(cardId);
    const fanLen = remainingFanIds.length;
    const center = (fanLen - 1) / 2;
    const t = fanLen > 1 ? (fanIdx - center) / center : 0;
    const x = 5 + (90 * fanIdx) / Math.max(1, fanLen - 1);
    // Parabolic arc: edges lower (larger y), centre higher (smaller y)
    const yArc = -10 * (1 - t * t);
    const rot = t * (FAN_ARC_DEG / 2);
    return { type: 'fan' as const, idx: fanIdx, x, y: 75 + yArc, rot, z: 10 + fanIdx };
  };

  const lookupCard = (cardId: string) => MAJOR_ARCANA.find((c) => c.id === cardId);

  if (aiPending) {
    return <Loading fullPage />;
  }

  return (
    <main className={styles.page}>
      <Container size="wide" className={`${styles.container} fade-in-up`}>
        <PageHeader
          title={allPicked ? '翻开你的牌' : `展牌 · ${spread.name}`}
          subtitle={
            allPicked
              ? `逐一点击 ${total} 张牌以揭晓`
              : `请从下方扇形牌阵中按直觉选择 ${total} 张`
          }
          onBack={() => navigate(ROUTES.LANDING)}
        />

        <div className={styles.progress}>
          <Progress
            current={allPicked ? revealedCount : drawnCards.length}
            total={total}
            label={allPicked ? '已翻' : '已选'}
          />
        </div>

        <div className={styles.stage} data-spread={spread.id}>
          {/* Slot position labels — always visible so the user knows what
              each slot represents. Each label sits just above its card.
              After a card is revealed, append · 正位 / · 逆位 so the
              orientation is unambiguous (the 180° flip alone is easy to
              miss in a busy 10-card Celtic Cross). */}
          <div className={styles.labels} aria-hidden="true">
            {spread.positions.map((pos, idx) => {
              const yStage = 5 + pos.y * 0.42;
              // Label sits ~5% of stage height above the card.
              const labelY = Math.max(2, yStage - 6);
              const isRevealed = idx < revealedCount;
              const drawn = drawnCards[idx];
              const orientation = isRevealed
                ? drawn?.isReversed
                  ? ' · 逆位'
                  : ' · 正位'
                : '';
              return (
                <span
                  key={pos.key}
                  className={`${styles.slotLabel} ${
                    isRevealed && drawn?.isReversed ? styles.slotLabelReversed : ''
                  }`}
                  style={{ left: `${pos.x}%`, top: `${labelY}%` }}
                >
                  {pos.name}
                  <span className={styles.slotOrientation}>{orientation}</span>
                </span>
              );
            })}
          </div>

          {/* All cards live in one stage. Their position + transform is
              recomputed each render based on whether they're in the fan
              or in a slot. CSS transitions animate the change.
              onClick is on the wrapper (NOT the Card) so the Card's
              internal :hover transform doesn't fight with the 3D flip
              animation on the slot cards. */}
          {fanOrder.map((cardId) => {
            const card = lookupCard(cardId);
            if (!card) return null;
            const placement = getPlacement(cardId);
            const isSlot = placement.type === 'slot';
            const slotIdx = placement.idx;
            const isRevealed = isSlot && allPicked && slotIdx < revealedCount;
            const isRevealable = isSlot && allPicked && slotIdx === revealedCount;
            const canPick = !isSlot && drawnCards.length < total;
            const clickable = canPick || isRevealable;
            const onCardClick = canPick
              ? () => handlePick(cardId)
              : isRevealable
                ? handleReveal
                : undefined;

            return (
              <div
                key={cardId}
                className={[
                  styles.placed,
                  isSlot ? styles.slot : styles.fan,
                  isRevealable ? styles.revealable : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  left: `${placement.x}%`,
                  top: `${placement.y}%`,
                  transform: `translate(-50%, -50%) rotate(${placement.rot}deg)`,
                  zIndex: placement.z,
                  cursor: clickable ? 'pointer' : 'default',
                }}
                onClick={onCardClick}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                aria-label={
                  canPick
                    ? '点击抽这张牌'
                    : isRevealable
                      ? '点击翻开这张牌'
                      : undefined
                }
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onCardClick?.();
                        }
                      }
                    : undefined
                }
              >
                <div className={styles.cardInner}>
                  {isSlot ? (
                    <Card
                      card={{ ...card, ...drawnCards[slotIdx] }}
                      size="md"
                      revealed={isRevealed}
                    />
                  ) : (
                    <Card faceDown size="sm" />
                  )}
                </div>
              </div>
            );
          })}

          {/* When all picked, drop a subtle "spreading rays" decoration
              to signal the spread is complete. */}
          {allPicked && <div className={styles.completeHalo} aria-hidden="true" />}
        </div>

        {/* Big ceremonial "reveal next" button — always at the same
            spot, so the user never has to hunt for the bottom card.
            Keyboard shortcut: Space / Enter (also 1-9, 0 by index). */}
        {allPicked && !allRevealed && (
          <button
            type="button"
            className={styles.revealButton}
            onClick={handleReveal}
            aria-label={`翻开第 ${revealedCount + 1} 张牌`}
          >
            <span className={styles.revealButtonKey}>
              {revealedCount + 1 <= 9 ? revealedCount + 1 : 0}
            </span>
            <span className={styles.revealButtonLabel}>
              翻开第 {revealedCount + 1} 张 · {spread.positions[revealedCount]?.name ?? ''}
            </span>
          </button>
        )}

        <p className={styles.hint}>
          {allPicked
            ? allRevealed
              ? '正在解读…'
              : `点击下一张牌，或按 ${revealedCount + 1 <= 9 ? revealedCount + 1 : 0} / 空格 / 回车`
            : `已选 ${drawnCards.length} / ${total} 张 — 跟随直觉`}
        </p>

        <div className={styles.actions}>
          <Button variant="ghost" size="small" onClick={handleRestart}>
            重新开始
          </Button>
        </div>
      </Container>
    </main>
  );
}
