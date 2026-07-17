import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  rightSlot?: ReactNode;
  onBack?: () => void;
}

export function PageHeader({ title, subtitle, badge, rightSlot, onBack }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      {onBack && (
        <button
          type="button"
          className={styles.back}
          onClick={onBack}
          aria-label="返回上一页"
        >
          ←
        </button>
      )}
      <div className={styles.center}>
        {badge && <span className={styles.badge}>{badge}</span>}
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {rightSlot && <div className={styles.right}>{rightSlot}</div>}
    </header>
  );
}

export default PageHeader;
