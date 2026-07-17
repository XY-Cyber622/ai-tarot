import { useEffect, useState } from 'react';
import styles from './Loading.module.css';

const PHRASES = [
  '正在接收能量…',
  '解读中…',
  '即将揭晓…',
];

export interface LoadingProps {
  phrases?: string[];
  fullPage?: boolean;
}

export function Loading({ phrases = PHRASES, fullPage = true }: LoadingProps) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % phrases.length);
    }, 1800);
    return () => window.clearInterval(t);
  }, [phrases.length]);

  const star = (
    <div className={styles.sigil} aria-hidden="true">
      <svg viewBox="0 0 100 100" width="120" height="120">
        <defs>
          <radialGradient id="loading-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8C66A" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="url(#loading-glow)" />
        <g className={styles.spinner}>
          <path
            d="M 50 8 L 54 30 L 70 14 L 58 38 L 88 38 L 62 50 L 88 62 L 58 62 L 70 86 L 54 70 L 50 92 L 46 70 L 30 86 L 42 62 L 12 62 L 38 50 L 12 38 L 42 38 L 30 14 L 46 30 Z"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );

  const phrase = (
    <div
      className={styles.phraseWrap}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      <span className={styles.phrase}>{phrases[idx]}</span>
    </div>
  );

  const dots = (
    <div className={styles.dots} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );

  const content = (
    <div className={styles.container}>
      {star}
      {phrase}
      {dots}
    </div>
  );

  if (fullPage) {
    return <main className={styles.page}>{content}</main>;
  }
  return content;
}

export default Loading;
