import type { Spread } from '@/types/tarot';
import styles from './SpreadCard.module.css';

export interface SpreadCardProps {
  spread: Spread;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function SpreadCard({ spread, selected = false, onClick, disabled = false }: SpreadCardProps) {
  const isDisabled = disabled || !spread.enabled;
  const classes = [
    styles.card,
    selected ? styles.selected : '',
    isDisabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-pressed={selected}
    >
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.header}>
        <span className={styles.name}>{spread.name}</span>
        <span className={styles.nameEn}>{spread.nameEn}</span>
      </div>
      <p className={styles.desc}>{spread.description}</p>
      <div className={styles.meta}>
        <span className={styles.count}>{spread.cardCount} 张牌</span>
        {!spread.enabled && <span className={styles.tag}>敬请期待</span>}
        {spread.enabled && selected && <span className={styles.tagSelected}>已选择</span>}
      </div>
      <div className={styles.positions}>
        {spread.positions.map((p) => (
          <span key={p.key} className={styles.position}>
            {p.name}
          </span>
        ))}
      </div>
    </button>
  );
}

export default SpreadCard;
