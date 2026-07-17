import styles from './Logo.module.css';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const SIZE_PX: Record<NonNullable<LogoProps['size']>, number> = {
  sm: 48,
  md: 96,
  lg: 144,
};

export function Logo({ size = 'md', animated = true }: LogoProps) {
  const px = SIZE_PX[size];
  const className = [styles.logo, animated ? styles.animated : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      style={{ width: px, height: px }}
      aria-label="AI Tarot Logo"
      role="img"
    >
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        width={px}
        height={px}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="logo-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E8C66A" stopOpacity="1" />
            <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#B8941F" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="logo-star" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8C66A" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>

        {/* Outer ring */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="url(#logo-glow)" strokeWidth="1" opacity="0.5" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.4" />

        {/* Center glow */}
        <circle cx="50" cy="50" r="28" fill="url(#logo-glow)" opacity="0.15" />

        {/* 8-point star */}
        <g className={styles.starGroup} transform="translate(50 50)">
          <path
            d="M 0 -30 L 5 -5 L 30 0 L 5 5 L 0 30 L -5 5 L -30 0 L -5 -5 Z"
            fill="url(#logo-star)"
            opacity="0.95"
          />
          <path
            d="M 0 -18 L 3 -3 L 18 0 L 3 3 L 0 18 L -3 3 L -18 0 L -3 -3 Z"
            fill="#E8C66A"
            opacity="0.9"
          />
        </g>

        {/* Tiny stars around */}
        <g opacity="0.7">
          <circle cx="20" cy="20" r="1" fill="#D4AF37" />
          <circle cx="80" cy="20" r="1" fill="#D4AF37" />
          <circle cx="20" cy="80" r="1" fill="#D4AF37" />
          <circle cx="80" cy="80" r="1" fill="#D4AF37" />
        </g>
      </svg>
    </div>
  );
}

export default Logo;
