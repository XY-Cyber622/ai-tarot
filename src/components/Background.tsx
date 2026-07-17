import { useMemo } from 'react';
import styles from './Background.module.css';

/**
 * Layered cosmic background:
 * L0 — pure cosmic black
 * L1 — radial gradient
 * L2 — violet/gold halos
 * L3 — drifting star trails
 * L4 — twinkling star particles
 */
export function Background() {
  const stars = useMemo(() => generateStars(60), []);
  const halos = useMemo(
    () => [
      { top: '15%', left: '20%', color: 'var(--color-violet-glow)' },
      { top: '60%', left: '75%', color: 'var(--color-gold-glow)' },
      { top: '80%', left: '30%', color: 'var(--color-violet-glow)' },
    ],
    []
  );

  return (
    <div className={styles.bg} aria-hidden="true">
      <div className={styles.radial} />
      {halos.map((h, i) => (
        <div
          key={`halo-${i}`}
          className={styles.halo}
          style={{ top: h.top, left: h.left, background: h.color }}
        />
      ))}
      <div className={styles.starTrails} />
      <div className={styles.stars}>
        {stars.map((s) => (
          <span
            key={s.id}
            className={`${styles.star} twinkle`}
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
              background: s.color,
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface Star {
  id: number;
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  color: string;
}

function generateStars(n: number): Star[] {
  const palette = ['#FFFFFF', '#F5F0E8', '#D4AF37', '#E8C66A', '#9B7FE0'];
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 4,
    opacity: 0.3 + Math.random() * 0.7,
    color: palette[Math.floor(Math.random() * palette.length)],
  }));
}

export default Background;
