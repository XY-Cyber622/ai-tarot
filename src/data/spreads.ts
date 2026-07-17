import type { Spread } from '@/types/tarot';

/**
 * MVP spread definitions.
 * Three Card is enabled; Celtic Cross is reserved for v1.1.
 *
 * Layout coordinates are percentages on a 100x100 canvas,
 * resolved by the Draw page into pixel positions.
 */
export const SPREADS: Spread[] = [
  {
    id: 'three-card',
    name: '三牌阵',
    nameEn: 'Three Card',
    description: '过去 · 现在 · 未来，最经典的时间线牌阵',
    cardCount: 3,
    enabled: true,
    positions: [
      { key: 'past', name: '过去', x: 20, y: 50 },
      { key: 'present', name: '现在', x: 45, y: 50 },
      { key: 'future', name: '未来', x: 70, y: 50 },
    ],
  },
  {
    id: 'celtic-cross',
    name: '凯尔特十字',
    nameEn: 'Celtic Cross',
    description: '10 张牌，传统深度全面分析，覆盖现状、挑战、过去、未来与可能的结果',
    cardCount: 10,
    enabled: true,
    positions: [
      // 中央十字：1 号为"现在"，2 号"挑战"叠在 1 号上横置
      { key: 'present', name: '现在', x: 45, y: 50 },
      { key: 'challenge', name: '挑战', x: 45, y: 50, rotation: 90 },
      { key: 'past', name: '过去', x: 45, y: 32 },
      { key: 'future', name: '未来', x: 45, y: 68 },
      { key: 'above', name: '意识 / 目标', x: 45, y: 14 },
      { key: 'below', name: '潜意识 / 根基', x: 45, y: 78 },
      // 右侧四张斜列堆叠（自上而下：自我 → 环境 → 希望/恐惧 → 结果）
      { key: 'self', name: '自我', x: 75, y: 20 },
      { key: 'environment', name: '外界环境', x: 80, y: 38 },
      { key: 'hopes', name: '希望与恐惧', x: 85, y: 56 },
      { key: 'outcome', name: '最终结果', x: 90, y: 74 },
    ],
  },
];

/** Default spread used when user skips selection. */
export const DEFAULT_SPREAD_ID = 'three-card';

/** Fast lookup. */
export const SPREAD_BY_ID: Record<string, Spread> = Object.fromEntries(
  SPREADS.map((s) => [s.id, s])
);

/** Only spreads available to users right now. */
export const AVAILABLE_SPREADS: Spread[] = SPREADS.filter((s) => s.enabled);
