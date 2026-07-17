import { useNavigate } from 'react-router-dom';
import { Button, Container, PageHeader } from '@/components';
import { ROUTES } from '@/constants/routes';
import styles from './StubPage.module.css';

export interface StubPageProps {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  onBackPath?: string;
}

/**
 * Lightweight placeholder for pages not yet implemented (Sprint 3+).
 */
export default function StubPage({
  title,
  subtitle,
  description,
  badge = '即将推出',
  onBackPath = ROUTES.LANDING,
}: StubPageProps) {
  const navigate = useNavigate();
  return (
    <main className={styles.page}>
      <Container size="narrow" className={`${styles.container} fade-in-up`}>
        <PageHeader
          title={title}
          subtitle={subtitle}
          onBack={() => navigate(onBackPath)}
        />
        <p className={styles.description}>{description ?? '此页面将在 Sprint 3 完成。'}</p>
        <div className={styles.actions}>
          <span className={styles.badge}>{badge}</span>
          <Button variant="ghost" size="small" onClick={() => navigate(onBackPath)}>
            返回
          </Button>
        </div>
      </Container>
    </main>
  );
}
