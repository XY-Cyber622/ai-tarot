import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Container, PageHeader } from '@/components';
import { ReadingView } from '@/components/ReadingView';
import { ROUTES } from '@/constants/routes';
import { getRecord } from '@/utils/storage';
import { SPREAD_BY_ID } from '@/data/spreads';
import type { ReadingRecord } from '@/types/reading';
import styles from './HistoryDetail.module.css';

export default function HistoryDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<ReadingRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    const r = getRecord(id);
    setRecord(r);
    setLoaded(true);
  }, [id]);

  if (!loaded) {
    return (
      <main className={styles.page}>
        <Container size="medium">
          <p className={styles.message}>加载中…</p>
        </Container>
      </main>
    );
  }

  if (!record) {
    return (
      <main className={styles.page}>
        <Container size="medium">
          <PageHeader
            title="找不到这条记录"
            subtitle="可能已被删除或链接已失效"
            onBack={() => navigate(ROUTES.HISTORY)}
          />
          <div className={styles.notFound}>
            <p className={styles.message}>该解读记录不存在。</p>
            <Button variant="primary" onClick={() => navigate(ROUTES.HISTORY)}>
              返回历史列表
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  const spreadName = SPREAD_BY_ID[record.spreadId]?.name ?? record.spreadId;

  return (
    <main className={styles.page}>
      <Container size="medium">
        <PageHeader
          title="解读详情"
          subtitle={spreadName}
          badge="历史记录"
          onBack={() => navigate(ROUTES.HISTORY)}
        />

        <ReadingView
          reading={record}
          question={record.question}
          spreadName={spreadName}
          drawnCards={record.drawnCards}
          createdAt={record.createdAt}
        />

        <div className={styles.actionBar}>
          <Button variant="primary" onClick={() => navigate(ROUTES.QUESTION)}>
            ✦ 再问一次
          </Button>
          <Button variant="secondary" onClick={() => navigate(ROUTES.HISTORY)}>
            ☰ 返回列表
          </Button>
        </div>
      </Container>
    </main>
  );
}
