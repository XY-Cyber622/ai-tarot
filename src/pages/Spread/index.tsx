import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, PageHeader, SpreadCard } from '@/components';
import { ROUTES } from '@/constants/routes';
import { SPREADS } from '@/data/spreads';
import { useSession } from '@/hooks/useSession';
import styles from './Spread.module.css';

export default function Spread() {
  const navigate = useNavigate();
  const { spread, setSpread } = useSession();
  const [selectedId, setSelectedId] = useState<string>(spread.id);

  // If a draft question is missing, send user back
  useEffect(() => {
    // (Could read from session if needed; here we just trust navigation)
  }, []);

  const handleConfirm = () => {
    setSpread(selectedId);
    navigate(ROUTES.SHUFFLE);
  };

  return (
    <main className={styles.page}>
      <Container size="medium" className={`${styles.container} fade-in-up`}>
        <PageHeader
          title="选择牌阵"
          subtitle="不同的牌阵，讲述不同的故事"
          onBack={() => navigate(ROUTES.QUESTION)}
        />

        <div className={styles.list}>
          {SPREADS.map((s) => (
            <SpreadCard
              key={s.id}
              spread={s}
              selected={selectedId === s.id}
              onClick={() => s.enabled && setSelectedId(s.id)}
            />
          ))}
        </div>

        <div className={styles.actions}>
          <Button
            variant="primary"
            size="large"
            fullWidth
            onClick={handleConfirm}
            disabled={!SPREADS.find((s) => s.id === selectedId)?.enabled}
          >
            下一步 · 开始洗牌
          </Button>
        </div>
      </Container>
    </main>
  );
}
