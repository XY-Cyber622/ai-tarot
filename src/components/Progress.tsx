import styles from './Progress.module.css';

export interface ProgressProps {
  current: number;
  total: number;
  label?: string;
  className?: string;
}

export function Progress({ current, total, label, className }: ProgressProps) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(0, current), safeTotal);
  const percent = (safeCurrent / safeTotal) * 100;

  return (
    <div className={[styles.wrap, className ?? ''].filter(Boolean).join(' ')}>
      <div className={styles.text}>
        <span className={styles.label}>{label ?? '进度'}</span>
        <span className={styles.count} aria-live="polite">
          {safeCurrent} / {safeTotal}
        </span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={safeCurrent}
        aria-valuemin={0}
        aria-valuemax={safeTotal}
      >
        <div
          className={styles.fill}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default Progress;
