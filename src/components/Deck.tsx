import { useMemo } from 'react';
import Card from './Card';
import styles from './Deck.module.css';

export interface DeckProps {
  /** Number of cards in the stack (visual only — no card data needed) */
  count: number;
  /** Maximum visible offset between cards (in px). */
  spread?: number;
  /** Subtle rotation jitter, e.g. 8 = -8° ~ +8° */
  jitter?: number;
  /** Show as a clickable stack (used on Draw page). */
  onClick?: () => void;
  /** Disable interaction visually. */
  disabled?: boolean;
  /** Show the topmost card slightly raised (used during shuffle). */
  topHighlighted?: boolean;
  className?: string;
}

interface PlacedCard {
  id: number;
  zIndex: number;
  y: number;
  rot: number;
}

/**
 * Visual deck — N cards stacked with subtle offset + random rotation.
 * Pure visual: no TarotCard data is bound; uses Card in faceDown mode.
 */
export function Deck({
  count,
  spread = 1.2,
  jitter = 6,
  onClick,
  disabled = false,
  topHighlighted = false,
  className,
}: DeckProps) {
  const cards = useMemo<PlacedCard[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      // Deterministic per-mount pseudo-random for stable hydration & screenshots
      const seed = (i * 9301 + 49297) % 233280;
      const r = seed / 233280;
      return {
        id: i,
        zIndex: i + 1,
        y: -i * spread,
        rot: (r - 0.5) * 2 * jitter,
      };
    });
  }, [count, spread, jitter]);

  const classes = [
    styles.deck,
    onClick && !disabled ? styles.interactive : '',
    disabled ? styles.disabled : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      onClick={!disabled ? onClick : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-disabled={disabled || undefined}
      aria-label={onClick ? '点击牌堆抽牌' : '牌堆'}
    >
      {cards.map((c, idx) => {
        const isTop = idx === cards.length - 1;
        return (
          <div
            key={c.id}
            className={[
              styles.layer,
              isTop && topHighlighted ? styles.top : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              zIndex: c.zIndex,
              transform: `translateY(${c.y}px) rotate(${c.rot}deg)`,
            }}
          >
            <Card faceDown size="md" />
          </div>
        );
      })}
      {onClick && !disabled && (
        <div className={styles.glow} aria-hidden="true" />
      )}
    </div>
  );
}

export default Deck;
