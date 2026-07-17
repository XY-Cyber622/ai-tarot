import type { ReactNode, CSSProperties } from 'react';
import styles from './Container.module.css';

interface ContainerProps {
  children: ReactNode;
  size?: 'narrow' | 'medium' | 'wide';
  className?: string;
  as?: 'div' | 'main' | 'section' | 'article';
  style?: CSSProperties;
}

const SIZE_CLASS = {
  narrow: styles.narrow,
  medium: styles.medium,
  wide: styles.wide,
};

export function Container({
  children,
  size = 'narrow',
  className,
  as: Tag = 'div',
  style,
}: ContainerProps) {
  return (
    <Tag
      className={[styles.container, SIZE_CLASS[size], className ?? ''].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </Tag>
  );
}

export default Container;
