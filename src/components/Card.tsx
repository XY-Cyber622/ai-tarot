import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEventHandler } from 'react';
import type { TarotCard, DrawnCard } from '@/types/tarot';
import { MAJOR_ARCANA } from '@/data/major-arcana';
import {
  generateCardSvgDataUrl,
  versioned,
} from '@/utils/preload';
import styles from './Card.module.css';

export type CardSize = 'sm' | 'md' | 'lg';

export interface CardProps {
  /** TarotCard or DrawnCard. Required when faceDown is false. */
  card?: TarotCard | DrawnCard;
  /** True for reversed (rotates 180°). Overrides card.isReversed if provided. */
  reversed?: boolean;
  /** Show back side instead of front. */
  faceDown?: boolean;
  size?: CardSize;
  /** Click handler — only attached when provided. */
  onClick?: MouseEventHandler<HTMLDivElement>;
  /** Force the "revealed" state for entrance animation. */
  revealed?: boolean;
  className?: string;
  style?: CSSProperties;
}

const SIZE_CLASS: Record<CardSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

/**
 * Hard timeout (ms) for any single image attempt.
 *
 * The browser caps concurrent image fetches at ~6 per host. In a
 * Celtic Cross (10 slot cards) the last 4 sit in the queue and may
 * NEVER fire onError/onLoad — they just stall. After this timeout
 * we give up on the network and switch to the inline data-URL SVG
 * so the user is guaranteed to see *something* within 5s.
 *
 * Three-card (3 slots) never hits this path — all 3 fit under the
 * 6-connection ceiling and load in well under a second.
 */
const IMAGE_LOAD_TIMEOUT_MS = 5000;

function resolveCard(card: TarotCard | DrawnCard): TarotCard {
  if ('cardId' in card) {
    const found = MAJOR_ARCANA.find((c) => c.id === card.cardId);
    if (!found) {
      throw new Error(`[Card] cannot resolve cardId: ${card.cardId}`);
    }
    return found;
  }
  return card;
}

function resolveReversed(card: TarotCard | DrawnCard, reversed?: boolean): boolean {
  if (typeof reversed === 'boolean') return reversed;
  return 'isReversed' in card ? card.isReversed : false;
}

export function Card({
  card,
  reversed,
  faceDown = false,
  size = 'md',
  onClick,
  revealed = true,
  className,
  style,
}: CardProps) {
  // Placeholder for faceDown mode without a real card
  const placeholder: TarotCard = {
    id: 'placeholder',
    name: 'Card Back',
    nameZh: '牌背',
    arcana: 'major',
    number: 0,
    keywords: [],
    reversedKeywords: [],
    uprightMeaning: '',
    reversedMeaning: '',
    uprightAdvice: '',
    reversedAdvice: '',
    symbolism: '',
    element: 'air',
    numerology: 0,
    hebrewLetter: '',
    treeOfLifePath: 0,
    imageUrl: '',
  };

  const resolved = faceDown || !card ? placeholder : resolveCard(card);
  const isReversed = !faceDown && card ? resolveReversed(card, reversed) : false;
  // Image-loading state machine. See `onLoad` / `onError` below.
  //
  //   retryCount = 0,  networkFailed = false  → first try (versioned URL)
  //   retryCount = 1..3                          → retry with cache-busted URL
  //   retryCount = 3,  networkFailed = true   → give up, switch to data-URL SVG
  //
  // The data-URL SVG (generateCardSvgDataUrl) is the *guarantee* — it
  // is inline, has no network request, and cannot be evicted from
  // cache, so the user always sees *something* that identifies the
  // card even if the network image is permanently broken.
  const [retryCount, setRetryCount] = useState(0);
  const [networkFailed, setNetworkFailed] = useState(false);
  // Mirror networkFailed in a ref so that the data-URL's onLoad
  // (which always fires) doesn't bounce us back to the network URL.
  const networkFailedRef = useRef(false);
  // Tracks whether ANY attempt (network or data-URL) has finished loading.
  // The 5s hard timeout checks this — if RWS already loaded, don't
  // switch to the SVG placeholder. Without this, a fast-loading card
  // would get clobbered to SVG at the 5s mark, which the user
  // would perceive as "the card disappeared".
  const loadedRef = useRef(false);

  const imageSrc = useMemo(() => {
    if (networkFailed) {
      return generateCardSvgDataUrl(resolved, isReversed);
    }
    if (retryCount === 0) {
      return versioned(resolved.imageUrl);
    }
    // Cache-bust: each retry uses a unique query string so the
    // browser is forced to actually re-fetch (instead of returning
    // a cached failure).
    return `${resolved.imageUrl}?r=${retryCount}`;
  }, [resolved, isReversed, retryCount, networkFailed]);

  // Hard timeout fallback. Celtic Cross fires 10 simultaneous
  // <img> requests — the browser queues 4 of them past its
  // 6-connection ceiling and those queued requests can stall
  // indefinitely (no onError, no onLoad, just... nothing). After
  // IMAGE_LOAD_TIMEOUT_MS we give up on the network and switch to
  // the inline data-URL SVG so the user is guaranteed to see
  // *something* within 5s.
  //
  // Critical: if a previous attempt already loaded (loadedRef=true),
  // we DON'T switch — the RWS image is on screen, switching to SVG
  // would be a regression. The timer is reset on every retry so
  // each fresh attempt gets its own 5s window.
  useEffect(() => {
    loadedRef.current = false; // new card / new attempt → reset
    if (networkFailed) return;
    const timer = window.setTimeout(() => {
      if (loadedRef.current) return; // RWS already on screen — keep it
      networkFailedRef.current = true;
      setNetworkFailed(true);
    }, IMAGE_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [retryCount, networkFailed, resolved.id]);

  const classes = [
    styles.card,
    SIZE_CLASS[size],
    isReversed ? styles.reversed : '',
    revealed ? styles.revealed : styles.hidden,
    onClick ? styles.interactive : '',
    faceDown ? styles.faceDown : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e as unknown as Parameters<MouseEventHandler<HTMLDivElement>>[0]);
              }
            }
          : undefined
      }
      style={style}
      aria-label={faceDown ? '未翻开的牌' : `${resolved.nameZh} ${isReversed ? '(逆位)' : ''}`}
    >
      <div className={styles.inner}>
        <div className={styles.front}>
          <div className={styles.frame}>
            <div
              className={`${styles.imageWrap} ${networkFailed ? styles.imageFailed : ''}`}
            >
              <img
                // key includes retryCount + networkFailed so React
                // remounts the element (and the browser re-fetches)
                // on every state transition.
                key={`${resolved.id}-${retryCount}-${networkFailed}`}
                className={styles.image}
                src={imageSrc}
                alt={resolved.nameZh}
                loading="eager"
                decoding="async"
                // #region debug-point ip3
                onLoad={() => {
                  // Mark "loaded" FIRST so the 5s timeout sees it
                  // and doesn't clobber this successfully-loaded
                  // image with the SVG placeholder.
                  loadedRef.current = true;
                  // The data-URL SVG always "loads" — if we've
                  // already given up on the network, ignore the
                  // event so we don't bounce back to retrying.
                  if (networkFailedRef.current) {
                    // #region debug-point ip3
                    void fetch('http://127.0.0.1:7777/event', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        sessionId: 'card-image-load-fail',
                        runId: 'pre-fix',
                        hypothesisId: 'H3',
                        msg: `[ip3] data-url loaded id=${resolved.id}`,
                        ts: Date.now(),
                      }),
                    }).catch(() => {});
                    // #endregion debug-point ip3
                    return;
                  }
                  // #region debug-point ip3
                  void fetch('http://127.0.0.1:7777/event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      sessionId: 'card-image-load-fail',
                      runId: 'pre-fix',
                      hypothesisId: 'H2',
                      msg: `[ip3] card onLoad id=${resolved.id} src=${imageSrc} retry=${retryCount}`,
                      ts: Date.now(),
                    }),
                  }).catch(() => {});
                  // #endregion debug-point ip3
                }}
                // #endregion debug-point ip3
                onError={() => {
                  // #region debug-point ip3e
                  void fetch('http://127.0.0.1:7777/event', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      sessionId: 'card-image-load-fail',
                      runId: 'pre-fix',
                      hypothesisId: 'H3',
                      msg: `[ip3e] card onError id=${resolved.id} attemptNonce=${retryCount} src=${imageSrc} networkFailed=${networkFailed}`,
                      ts: Date.now(),
                    }),
                  }).catch(() => {});
                  // #endregion debug-point ip3e
                  if (networkFailedRef.current) return; // safety
                  if (retryCount < 3) {
                    setRetryCount((n) => n + 1);
                  } else {
                    // All 3 network attempts failed. Switch to the
                    // inline data-URL SVG so the card is *always*
                    // visible. This is the user's "ensure all cards
                    // can be loaded" guarantee.
                    networkFailedRef.current = true;
                    setNetworkFailed(true);
                  }
                }}
              />
              <div className={styles.imageFallback} aria-hidden="true">
                <span className={styles.fallbackNumber}>{resolved.number}</span>
                <span className={styles.fallbackName}>{resolved.nameZh}</span>
              </div>
            </div>
            <div className={styles.label}>
              <span className={styles.labelName}>{resolved.nameZh}</span>
              <span className={styles.labelEn}>{resolved.name}</span>
            </div>
          </div>
        </div>
        <div className={styles.back}>
          <div className={styles.backPattern} />
          <div className={styles.backEmblem}>✦</div>
        </div>
      </div>
    </div>
  );
}

export default Card;
