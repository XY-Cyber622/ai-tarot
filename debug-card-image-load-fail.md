# Debug: card-image-load-fail

**Status**: [OPEN]
**Session**: card-image-load-fail
**Reporter**: user
**Symptom**: After applying preload + versioned URL + retry mechanism, some cards (e.g. 战车 / The Chariot, major-07) still fail to render the image — user sees the fallback (number + name) instead of the RWS illustration.

## Hypotheses (3-5 falsifiable)

1. **H1 — Preload never runs**: `useEffect(() => void preloadCardImages(), [])` in App.tsx is not firing (import error, strict-mode double-invoke, or some lifecycle issue) — so the cache stays cold and the first `<img onError>` on a card triggers before the fetch settles.
2. **H2 — Chariot PNG is genuinely un-decodable in browser**: `file` says valid PNG, but the actual bytes may carry an unsupported color profile / chunk / encoding that Chrome refuses. The fallback shows up because the decoder throws.
3. **H3 — Retry logic is broken**: The new `onError` handler in Card.tsx either never re-fires on the retry, or the `key={...-retryNonce}` remount strategy is being defeated by React's reconciliation (the parent re-mounts, but the same failed network response comes back).
4. **H4 — Versioned URL `?v=2` is the problem**: Vite dev server may strip or mishandle the query param; the request actually goes to `/cards/major-07.png` (no `?v=2`), the browser uses the *original* (no-version) URL it cached before, and that cache slot is poisoned.
5. **H5 — The Card is in slot pre-reveal, image is hidden, browser never finishes decoding**: When the slot is `rotateY(180deg)` (hidden), the front-face image is technically off-screen; some browsers deprioritize / abort the decode. When revealed, the image element is in the DOM but the network/decode was already aborted.

## Evidence Collected

### E1 — Preload runs and succeeds for ALL 22 cards

```
[ip1] preload start
[ip2] preload ok id=major-00 src=/cards/major-00.png?v=2
... (22 entries, all ok)
[ip1] preload done ok=22 failed=0 dt=17ms
```

→ **H1 REJECTED**: preload definitely runs (logs show it). All 22 succeed.
→ **H2 REJECTED**: every PNG is fetchable, 287–373 KB, valid magic bytes.
→ **H4 REJECTED**: `?v=2` URLs work — preloaded versioned URLs all return 200.

> Note: each [ip2] entry appears TWICE — that's React 18 StrictMode double-invoking the useEffect. Not a bug, just dev-mode noise.

### E2 — Server returns 200 for every image

Curl test: all 22 (including Chariot `major-07.png` 299,250 bytes) return `HTTP/1.1 200 OK` with `Content-Type: image/png` and a valid Last-Modified.

### E3 — ROOT CAUSE: sticky `.imageFailed` class

Looking at `Card.tsx:onError`:
```tsx
if (!wrap.classList.contains(styles.imageFailed)) {
  wrap.classList.add(styles.imageFailed);  // ← ADDED on first error
  setRetryNonce((n) => n + 1);
  setTimeout(() => { img.src = resolved.imageUrl; }, 250);  // ← stale closure!
} else {
  img.style.display = 'none';
}
```

**Two bugs:**
- **(a) `.imageFailed` is never removed on successful load.** The CSS:
  ```css
  .imageWrap.imageFailed .imageFallback { display: flex; }
  .imageFallback { background: radial-gradient(...); /* opaque */ }
  ```
  The fallback has an **opaque** radial gradient background, so it sits on top of the image and **completely hides it**. Even when the image *did* successfully load, the user still sees only the number + name.
- **(b) `setTimeout` operates on a stale DOM element.** `setRetryNonce` triggers a re-render which unmounts the old `<img>` (key change). The setTimeout then runs on the *garbage-collected* element. The "retry" never actually fetches a different URL.

**Reproduction**: any transient network blip on the first fetch → `.imageFailed` added → fallback covers image forever, even after image loads successfully.

→ **H3 CONFIRMED** (with refinement — it's not the remount that fails, it's the sticky class).

## Fix Plan (minimal)

1. **In `onLoad`**: remove `.imageFailed` from wrap, reset retryNonce.
2. **In `onError`**: use a different URL strategy on retry (`?r=N` cache buster), limit to 3 retries.
3. **Ultimate guarantee**: when all retries fail, switch `src` to a data-URL SVG generated from the card's number + name. This **cannot** fail (no network, no decode race) — the user always sees *something* that identifies the card.
4. Keep the CSS fallback as a defense-in-depth layer (should never be needed once data-URL kicks in).

## User feedback round 2 — fix still incomplete

User reports cards 20 (Judgement), Sun (19) etc. *still* don't show their face in
Celtic Cross, but **three-card works perfectly**. This is the critical clue.

### New hypothesis (H6) — queued images stall indefinitely

Browsers cap concurrent image fetches at ~6 per host (Chrome/Firefox). In a
Celtic Cross, `fanOrder.map(...)` mounts 10 slot `<img>` elements in the same
render tick, each firing its own request. The first 6 start, the remaining
4 are **queued** by the browser's network stack.

A queued request is *not* the same as a failed one — it just hasn't started.
Neither `onLoad` nor `onError` fire until the request is actually dispatched
and the response arrives. If the queue moves slowly (or stalls under load),
the user sees an empty gold box indefinitely. The data-URL fallback in
`onError` never triggers because the request never errors.

Three-card (3 slot cards) is below the 6-connection ceiling → all 3 dispatch
immediately → all 3 load in <1s → no stall → no empty card.

### Fix v2 — hard timeout (5s)

`useEffect` with `setTimeout(..., IMAGE_LOAD_TIMEOUT_MS)` that fires
`setNetworkFailed(true)` regardless of `onLoad`/`onError`. The timer resets
on every retry (`retryCount` is in the dep array) so each fresh attempt
gets its own 5s window. After 5s the inline data-URL SVG takes over — the
user is guaranteed to see *something* within 5s, even if the browser is
still chewing through its connection queue.

**Caveat to be honest with the user about**: the 5s fallback is a styled
SVG placeholder (number + name + 逆位 badge), NOT the original RWS
illustration. To guarantee the actual RWS image, we'd need to preload as
blobs (`URL.createObjectURL(fetch(...).blob())`) and use the synchronous
blob URL in `<img src>` — that's a v3 if the user wants it.

## User feedback round 3 — regression: ALL cards blank

User reports: *"after your update, every Celtic Cross card is blank."*
This is a **regression** introduced by the v2 fix.

### Root cause (H7) — v2 clobbered already-loaded images

`useEffect(() => { ... setTimeout(() => setNetworkFailed(true), 5000) ... })`
fired unconditionally at the 5s mark. Even if `onLoad` had already fired
on the 1st second and the RWS image was happily on screen, the 5s timer
still ran and yanked `networkFailed` to true → `imageSrc` switched to
data-URL SVG → `<img>` remounted (key includes `networkFailed`) → the
**RWS image got replaced with the placeholder SVG**. To the user it
looked like "the cards just disappeared at the 5s mark".

This hit all 10 Celtic Cross cards simultaneously because all 10
useEffect timers start in the same render tick.

### Fix v3 — only switch if the card hasn't loaded yet

Added `loadedRef` (mirrors "any attempt finished loading"). `onLoad` sets
it to `true` (for both RWS and the data-URL fallback). The 5s timer's
callback now checks `if (loadedRef.current) return;` before switching to
the SVG fallback. The ref is reset to `false` at the top of every effect
run (new card / new retry attempt).

Result: fast-loading cards keep their RWS image. Only the genuinely
stalled (queued-beyond-6-connection-ceiling) cards get the SVG after 5s.

**Caveat to be honest with the user about**: the 5s fallback is a styled
SVG placeholder (number + name + 逆位 badge), NOT the original RWS
illustration. To guarantee the actual RWS image, we'd need to preload as
blobs (`URL.createObjectURL(fetch(...).blob())`) and use the synchronous
blob URL in `<img src>` — that's a v3 if the user wants it.

## Plan

- Step 1-2: Hypotheses + instrumentation points (this file)
- Step 3-4: Add minimal instrumentation logs in preload, Card onError, and image load handlers — POST to debug server
- Step 5-6: Collect evidence → narrow hypothesis → minimal fix
- Step 7+: Verify, compare, cleanup

## Instrumentation Points

| Point | Location | What to log |
|---|---|---|
| IP1 | `App.tsx` useEffect | Did preload start? How many tasks? How many ok / failed? |
| IP2 | `Card.tsx` onLoad | Which card id loaded successfully? |
| IP3 | `Card.tsx` onError | Which card id failed? What was the src at error time? Was this 1st or 2nd attempt? |
| IP4 | `Card.tsx` retryNonce bump | Show nonce transition; prove the React key remount actually happens |

## Evidence Log

_(populated as instrumentation runs — see `trae-debug-log-card-image-load-fail.ndjson`)_

## Resolution

_(TBD)_
