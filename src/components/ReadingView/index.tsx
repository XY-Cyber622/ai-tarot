import type { TarotReading, ReadingRecord } from '@/types/reading';
import type { DrawnCard } from '@/types/tarot';
import { MAJOR_ARCANA } from '@/data/major-arcana';
import type { TarotCard } from '@/types/tarot';
import styles from './ReadingView.module.css';

export interface ReadingViewProps {
  /** The structured reading. Pass either a TarotReading or full ReadingRecord. */
  reading: TarotReading | ReadingRecord;
  /** Original user question (stored separately on the record). */
  question?: string;
  /** Spread display name (only on full record). */
  spreadName?: string;
  /** Drawn cards (only on full record). */
  drawnCards?: DrawnCard[];
  /** ISO / unix ms timestamp (only on full record). */
  createdAt?: number;
  /** Optional saved indicator (e.g. auto-saved tag). */
  showSavedTag?: boolean;
}

/**
 * Read-only display of a Tarot reading. Used by both the live Result page
 * and the History detail page.
 */
export function ReadingView({
  reading,
  question,
  spreadName,
  drawnCards,
  createdAt,
  showSavedTag = false,
}: ReadingViewProps) {
  const cardById = new Map<string, TarotCard>(MAJOR_ARCANA.map((c) => [c.id, c]));

  // ReadingRecord extends TarotReading with extra metadata; we may receive either.
  const record = 'drawnCards' in reading ? (reading as ReadingRecord) : null;
  const cardsForLookup: DrawnCard[] = drawnCards ?? record?.drawnCards ?? [];
  const questionToShow = question ?? record?.question ?? '';
  const spreadToShow = spreadName ?? record?.spreadId;
  const dateToShow = createdAt ?? record?.createdAt;

  return (
    <article className={styles.view}>
      {questionToShow && (
        <section className={styles.questionBlock} aria-label="你的问题">
          <span className={styles.label}>你的问题</span>
          <p className={styles.questionText}>"{questionToShow || '（未填写）'}"</p>
          <div className={styles.metaRow}>
            {spreadToShow && <span className={styles.metaTag}>{spreadToShow}</span>}
            {dateToShow && (
              <time className={styles.metaTime} dateTime={new Date(dateToShow).toISOString()}>
                {formatDate(dateToShow)}
              </time>
            )}
            {showSavedTag && (
              <span className={styles.savedTag} aria-live="polite">
                ✓ 已保存到历史
              </span>
            )}
          </div>
        </section>
      )}

      <OverviewSection overview={reading.reading.overview} />
      <CardsSection perCard={reading.reading.perCard} cardsForLookup={cardsForLookup} cardById={cardById} />
      <AdviceSection advice={reading.reading.advice} />
      <LuckySection lucky={reading.lucky} />
    </article>
  );
}

/* ============================================================== */
/* Sub-sections                                                  */
/* ============================================================== */

function OverviewSection({ overview }: { overview: string }) {
  return (
    <section className={styles.section} aria-labelledby="overview-h">
      <h2 id="overview-h" className={styles.sectionTitle}>
        <span className={styles.sectionIcon} aria-hidden="true">✦</span>
        整体概述
      </h2>
      <p className={styles.overviewText}>{overview}</p>
    </section>
  );
}

function CardsSection({
  perCard,
  cardsForLookup,
  cardById,
}: {
  perCard: TarotReading['reading']['perCard'];
  cardsForLookup: DrawnCard[];
  cardById: Map<string, TarotCard>;
}) {
  return (
    <section className={styles.section} aria-labelledby="cards-h">
      <h2 id="cards-h" className={styles.sectionTitle}>
        <span className={styles.sectionIcon} aria-hidden="true">☸</span>
        牌面解读
      </h2>
      <div className={styles.cardsList}>
        {perCard.map((p, i) => {
          const drawn = cardsForLookup[i];
          const card = drawn ? cardById.get(drawn.cardId) : undefined;
          return (
            <article key={i} className={styles.cardItem}>
              <header className={styles.cardHeader}>
                <span className={styles.positionBadge}>{p.positionName || p.position}</span>
                <div className={styles.cardName}>
                  {card ? (
                    <>
                      <span className={styles.nameZh}>{card.nameZh}</span>
                      {drawn?.isReversed && (
                        <span className={styles.reversedTag}>逆位</span>
                      )}
                    </>
                  ) : (
                    <span className={styles.nameZh}>—</span>
                  )}
                </div>
              </header>

              <div className={styles.coreEnergy}>
                <span className={styles.coreLabel}>核心能量</span>
                <span className={styles.coreValue}>{p.coreEnergy}</span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.subhead}>牌面启示</h3>
                <p>{p.interpretation}</p>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.subhead}>行动建议</h3>
                <p>{p.suggestion}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AdviceSection({ advice }: { advice: string }) {
  return (
    <section className={`${styles.section} ${styles.adviceSection}`} aria-labelledby="advice-h">
      <h2 id="advice-h" className={styles.sectionTitle}>
        <span className={styles.sectionIcon} aria-hidden="true">✺</span>
        整体行动建议
      </h2>
      <p className={styles.adviceText}>{advice}</p>
    </section>
  );
}

function LuckySection({ lucky }: { lucky: TarotReading['lucky'] }) {
  return (
    <section className={styles.section} aria-labelledby="lucky-h">
      <h2 id="lucky-h" className={styles.sectionTitle}>
        <span className={styles.sectionIcon} aria-hidden="true">❀</span>
        今日能量
      </h2>
      <div className={styles.luckyGrid}>
        <div className={`${styles.luckyCard} ${styles.luckyColor}`}>
          <span className={styles.luckyLabel}>幸运色</span>
          <div className={styles.colorRow}>
            <span
              className={styles.colorSwatch}
              style={{ backgroundColor: lucky.color.hex }}
              aria-label={`${lucky.color.name} 颜色色块`}
            />
            <span className={styles.colorName}>{lucky.color.name}</span>
          </div>
          <p className={styles.luckyMeaning}>{lucky.color.meaning}</p>
        </div>

        <div className={`${styles.luckyCard} ${styles.luckyNumber}`}>
          <span className={styles.luckyLabel}>幸运数字</span>
          <span className={styles.numberValue}>{lucky.number.value}</span>
          <p className={styles.luckyMeaning}>{lucky.number.meaning}</p>
        </div>

        <div className={`${styles.luckyCard} ${styles.luckyPhrase}`}>
          <span className={styles.luckyLabel}>治愈金句</span>
          <p className={styles.phraseText}>"{lucky.phrase}"</p>
        </div>
      </div>
    </section>
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

export default ReadingView;
