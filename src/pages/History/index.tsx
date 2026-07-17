import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, PageHeader } from '@/components';
import { ROUTES } from '@/constants/routes';
import { listRecords, deleteRecord, type RecordId } from '@/utils/storage';
import { SPREAD_BY_ID } from '@/data/spreads';
import { MAJOR_ARCANA } from '@/data/major-arcana';
import type { ReadingRecord } from '@/types/reading';
import styles from './History.module.css';

export default function History() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ReadingRecord[]>([]);
  const [confirmId, setConfirmId] = useState<RecordId | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    setRecords(listRecords());
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = (id: RecordId) => {
    deleteRecord(id);
    setConfirmId(null);
    refresh();
  };

  return (
    <main className={styles.page}>
      <Container size="medium">
        <PageHeader
          title="解读历史"
          subtitle="回顾你过往的塔罗咨询"
          badge={`${records.length} 条记录`}
          onBack={() => navigate(ROUTES.LANDING)}
        />

        {!loaded ? (
          <p className={styles.empty}>加载中…</p>
        ) : records.length === 0 ? (
          <EmptyState onStart={() => navigate(ROUTES.QUESTION)} />
        ) : (
          <>
            <ul className={styles.list}>
              {records.map((r) => (
                <RecordCard
                  key={r.id}
                  record={r}
                  confirming={confirmId === r.id}
                  onOpen={() => navigate(ROUTES.HISTORY_DETAIL.replace(':id', r.id))}
                  onAskDelete={() => setConfirmId(r.id)}
                  onCancelDelete={() => setConfirmId(null)}
                  onConfirmDelete={() => handleDelete(r.id)}
                />
              ))}
            </ul>

            <div className={styles.footerBar}>
              <Button variant="primary" onClick={() => navigate(ROUTES.QUESTION)}>
                ✦ 开始一次新的解读
              </Button>
            </div>
          </>
        )}
      </Container>
    </main>
  );
}

/* ============================================================== */
/* Sub-components                                                */
/* ============================================================== */

function RecordCard({
  record,
  confirming,
  onOpen,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  record: ReadingRecord;
  confirming: boolean;
  onOpen: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const spreadName = SPREAD_BY_ID[record.spreadId]?.name ?? record.spreadId;
  const preview = record.reading.overview.slice(0, 80) + (record.reading.overview.length > 80 ? '…' : '');

  return (
    <li className={styles.card}>
      <button
        type="button"
        className={styles.cardBody}
        onClick={onOpen}
        aria-label={`查看 ${formatDate(record.createdAt)} 的解读`}
      >
        <div className={styles.headRow}>
          <span className={styles.spreadBadge}>{spreadName}</span>
          <time className={styles.time} dateTime={new Date(record.createdAt).toISOString()}>
            {formatDate(record.createdAt)}
          </time>
        </div>

        <p className={styles.question}>"{record.question || '（未填写）'}"</p>

        <div className={styles.previewRow}>
          <p className={styles.preview}>{preview}</p>
          <div className={styles.luckyMini}>
            <span
              className={styles.colorDot}
              style={{ backgroundColor: record.lucky.color.hex }}
              aria-label={`幸运色 ${record.lucky.color.name}`}
            />
            <span className={styles.luckyNumber}>{record.lucky.number.value}</span>
            <CardsMini drawnCards={record.drawnCards} />
          </div>
        </div>
      </button>

      <div className={styles.cardActions}>
        {confirming ? (
          <>
            <span className={styles.confirmText}>确认删除？</span>
            <Button variant="primary" size="small" onClick={onConfirmDelete}>
              是，删除
            </Button>
            <Button variant="ghost" size="small" onClick={onCancelDelete}>
              取消
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="small" onClick={onAskDelete}>
            ✕ 删除
          </Button>
        )}
      </div>
    </li>
  );
}

function CardsMini({ drawnCards }: { drawnCards: ReadingRecord['drawnCards'] }) {
  const cardById = new Map(MAJOR_ARCANA.map((c) => [c.id, c]));
  return (
    <div className={styles.cardsMini}>
      {drawnCards.map((d, i) => {
        const card = cardById.get(d.cardId);
        return (
          <span key={i} className={styles.miniChip} title={card?.nameZh ?? d.cardId}>
            {card?.nameZh ?? '?'}
            {d.isReversed && <sup className={styles.revSup}>逆</sup>}
          </span>
        );
      })}
    </div>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon} aria-hidden="true">✦</div>
      <h2 className={styles.emptyTitle}>还没有任何记录</h2>
      <p className={styles.emptyText}>
        完成一次塔罗解读后，结果会自动保存在这里。
      </p>
      <Button variant="primary" onClick={onStart}>
        ✦ 开始你的第一次解读
      </Button>
    </div>
  );
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
}
