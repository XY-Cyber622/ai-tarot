import { MAJOR_ARCANA } from '@/data/major-arcana';
import type { TarotCard } from '@/types/tarot';

/**
 * Asset version — bumped whenever the on-disk card images change.
 * Appended as `?v=N` to every image URL so the browser cache is
 * busted when assets are updated (otherwise an old cached 404 /
 * stale image can stick around across deploys).
 */
export const ASSET_VERSION = 2;

export interface PreloadResult {
  ok: string[];
  failed: string[];
}

/**
 * Preload every Major Arcana image into the browser's HTTP cache.
 * Uses `new Image()` which forces the browser to fetch + decode
 * the resource up front, so by the time the user starts drawing
 * the cards, every <img> in the DOM is an instant cache hit.
 *
 * Safe to call multiple times — the browser dedupes by URL.
 * Non-blocking: returns a promise that resolves when the slowest
 * image finishes (or all fail).
 */
export function preloadCardImages(): Promise<PreloadResult> {
  const ok: string[] = [];
  const failed: string[] = [];

  const tasks = MAJOR_ARCANA.map(
    (card) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          ok.push(card.id);
          // #region debug-point ip2
          void fetch('http://127.0.0.1:7777/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: 'card-image-load-fail',
              runId: 'pre-fix',
              hypothesisId: 'H2',
              msg: `[ip2] preload ok id=${card.id} src=${versioned(card.imageUrl)}`,
              ts: Date.now(),
            }),
          }).catch(() => {});
          // #endregion debug-point ip2
          resolve();
        };
        img.onerror = (e) => {
          failed.push(card.id);
          // #region debug-point ip2e
          void fetch('http://127.0.0.1:7777/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: 'card-image-load-fail',
              runId: 'pre-fix',
              hypothesisId: 'H2',
              msg: `[ip2e] preload FAIL id=${card.id} src=${versioned(card.imageUrl)} naturalWidth=${img.naturalWidth} naturalHeight=${img.naturalHeight} complete=${img.complete}`,
              ts: Date.now(),
            }),
          }).catch(() => {});
          // #endregion debug-point ip2e
          resolve(); // resolve anyway so the promise chain doesn't hang
        };
        img.src = versioned(card.imageUrl);
      })
  );

  return Promise.all(tasks).then(() => ({ ok, failed }));
}

/**
 * Append the asset version to an image URL. Works for absolute
 * (/cards/x.png) paths; leaves external URLs untouched.
 */
export function versioned(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  // Strip any existing ?v= before appending ours.
  const base = url.split('?')[0];
  return `${base}?v=${ASSET_VERSION}`;
}

/**
 * Last-resort fallback: build a data: URL containing a stylised SVG
 * with the card's number + name. Returned as the `<img src>` when
 * the network image has failed 3 times. This cannot fail (no
 * network, no decode race, no cache lookup) — the user always sees
 * *something* that identifies the card.
 *
 * Unicode-safe base64: the SVG string is UTF-8 → binary → btoa.
 * Chinese characters (nameZh) survive the round-trip.
 */
export function generateCardSvgDataUrl(
  card: TarotCard,
  isReversed: boolean
): string {
  const escapedNameZh = card.nameZh.replace(/[<>&]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;'
  );
  const escapedName = card.name.replace(/[<>&]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;'
  );
  const reversedBadge = isReversed
    ? `<text x="150" y="388" font-family="Georgia, serif" font-size="18" fill="#d4a04a" text-anchor="middle" letter-spacing="2">逆位</text>`
    : '';

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 527" preserveAspectRatio="xMidYMid meet">` +
    `<defs>` +
    `<radialGradient id="bg" cx="50%" cy="50%" r="75%">` +
    `<stop offset="0%" stop-color="#2a1850"/>` +
    `<stop offset="100%" stop-color="#0a0418"/>` +
    `</radialGradient>` +
    `</defs>` +
    `<rect width="300" height="527" fill="url(#bg)"/>` +
    `<rect x="8" y="8" width="284" height="511" fill="none" stroke="#d4af37" stroke-width="2" opacity="0.6"/>` +
    `<text x="150" y="60" font-family="Georgia, serif" font-size="14" fill="#d4af37" text-anchor="middle" opacity="0.6" letter-spacing="3">MAJOR ARCANA</text>` +
    `<text x="150" y="240" font-family="Georgia, serif" font-size="120" font-weight="700" fill="#d4af37" text-anchor="middle">${card.number}</text>` +
    `<text x="150" y="330" font-family="Georgia, serif" font-size="30" fill="#d4af37" text-anchor="middle" letter-spacing="3">${escapedNameZh}</text>` +
    `<text x="150" y="362" font-family="Georgia, serif" font-size="13" font-style="italic" fill="#d4af37" text-anchor="middle" opacity="0.75">${escapedName}</text>` +
    reversedBadge +
    `<text x="150" y="490" font-family="Georgia, serif" font-size="10" fill="#d4af37" text-anchor="middle" opacity="0.5" letter-spacing="2">— placeholder —</text>` +
    `</svg>`;

  // UTF-8 safe base64: encodeURIComponent → unescape → btoa.
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}
