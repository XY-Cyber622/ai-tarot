import { useNavigate } from 'react-router-dom';
import { Button, Logo, Container } from '@/components';
import { ROUTES } from '@/constants/routes';
import { useSession } from '@/hooks/useSession';
import styles from './Landing.module.css';

export default function Landing() {
  const navigate = useNavigate();
  const { reset } = useSession();

  const handleStart = () => {
    reset();
    navigate(ROUTES.QUESTION);
  };

  const handleHistory = () => {
    navigate(ROUTES.HISTORY);
  };

  return (
    <main className={styles.page}>
      <Container size="narrow" className={`${styles.container} fade-in-up`}>
        <div className={styles.logo}>
          <Logo size="lg" />
        </div>

        <span className={`${styles.badge} shimmer`}>AI · 塔罗</span>

        <h1 className={styles.title}>AI Tarot</h1>
        <p className={styles.subtitle}>
          在星光与沉默之间，<br />
          听见内心真正想问的
        </p>

        <div className={styles.actions}>
          <Button variant="primary" size="large" onClick={handleStart} fullWidth>
            开始一次占卜
          </Button>
          <Button variant="ghost" size="medium" onClick={handleHistory}>
            查看历史
          </Button>
        </div>

        <p className={styles.hint}>
          三牌阵 · 凯尔特十字，随心选
        </p>
      </Container>
    </main>
  );
}
