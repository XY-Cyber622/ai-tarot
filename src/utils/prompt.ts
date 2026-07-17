import type { DrawnCard, TarotCard } from '@/types/tarot';
import { MAJOR_ARCANA } from '@/data/major-arcana';

/**
 * System prompt — the AI's "personality" and output contract.
 * Spread-agnostic: it only defines the JSON shape. The actual position
 * names are sent per-request in the user prompt so the model can use
 * them for any spread (三牌阵, 凯尔特十字, etc.).
 */
export const SYSTEM_PROMPT = `你是一位温柔、神秘而富有洞察力的塔罗占卜师。
你能精准结合用户的问题、所选牌阵、每张牌的正/逆位、牌面象征、卡巴拉与数字命理，
为用户呈现一段有深度、有温度、有诗意的解读。

# 输出格式（严格 JSON，禁止任何额外文字）
{
  "schemaVersion": "1.0",
  "reading": {
    "overview": "（100~200 字）整体概述",
    "perCard": [
      {
        "position": "（牌阵 position.key，例如 past / present / challenge / above …）",
        "positionName": "（牌位中文名，必须与用户问题中给出的牌位名称完全一致）",
        "coreEnergy": "（20~40 字）该位置的核心能量",
        "interpretation": "（60~120 字）结合问题的具体启示",
        "suggestion": "（20~40 字）简短建议"
      }
    ],
    "advice": "（60~100 字）整体行动建议"
  },
  "lucky": {
    "color": {
      "name": "（中文颜色名）",
      "hex": "（#RRGGBB 格式）",
      "meaning": "（10~20 字）颜色含义"
    },
    "number": {
      "value": "（1~99 整数）",
      "meaning": "（10~20 字）数字含义"
    },
    "phrase": "（15~30 字）治愈金句"
  }
}

# 规则
1. perCard 数组长度必须等于抽到的牌数，按用户抽到的顺序逐张解读。
2. position 字段使用牌阵定义中的 key，positionName 字段使用牌阵的中文位名，必须与用户问题里给出的【牌位列表】完全一致，不允许自创。
3. 只输出合法 JSON，不要任何解释、Markdown、注释或前后缀。
4. 当某张牌为逆位时，必须在 interpretation 中明确说明，并指出能量受阻的方向。
5. 多张牌时注意牌与牌之间的呼应与递进：例如凯尔特十字的"现在"与"挑战"应交叉解读，"过去 / 未来"形成时间线，"最终结果"应综合前九张牌得出整体走向。
6. 语言：简体中文。
`;

/**
 * Build a request description for the user prompt.
 */
export interface ReadingRequest {
  question: string;
  spreadName: string;
  spreadNameEn: string;
  cards: Array<{
    position: string;
    positionName: string;
    isReversed: boolean;
    card: TarotCard;
  }>;
}

function cardLine(c: ReadingRequest['cards'][number]): string {
  const reversedTag = c.isReversed ? '（逆位）' : '（正位）';
  const meaning = c.isReversed ? c.card.reversedMeaning : c.card.uprightMeaning;
  const advice = c.isReversed ? c.card.reversedAdvice : c.card.uprightAdvice;
  return `- 位置: ${c.position} (${c.positionName})
  牌名: ${c.card.nameZh} (${c.card.name}) ${reversedTag}
  象征: ${c.card.symbolism}
  元素: ${c.card.element}
  数字: ${c.card.numerology}
  关键词: ${(c.isReversed ? c.card.reversedKeywords : c.card.keywords).join('、')}
  含义: ${meaning}
  建议: ${advice}`;
}

export function buildUserPrompt(req: ReadingRequest): string {
  const cardsBlock = req.cards.map(cardLine).join('\n\n');
  return `【用户问题】
${req.question}

【牌阵】
${req.spreadName} (${req.spreadNameEn})，共 ${req.cards.length} 张牌

【牌位列表（请在 perCard[i].positionName 中逐字使用）】
${req.cards.map((c) => `- ${c.position} → ${c.positionName}`).join('\n')}

【抽到的牌（按用户抽取顺序）】
${cardsBlock}

请按 system prompt 中定义的 JSON 格式输出解读。`;
}

/**
 * Helper: resolve DrawnCard[] (cardId-only) into fully-hydrated ReadingRequest.
 */
export function buildReadingRequest(
  question: string,
  spreadName: string,
  spreadNameEn: string,
  positions: ReadonlyArray<{ key: string; name: string }>,
  drawnCards: DrawnCard[]
): ReadingRequest {
  const cards = drawnCards.map((d) => {
    const card = MAJOR_ARCANA.find((c) => c.id === d.cardId);
    if (!card) {
      throw new Error(`[prompt] unknown cardId: ${d.cardId}`);
    }
    const position = positions.find((p) => p.key === d.position) ?? {
      key: d.position,
      name: d.positionName,
    };
    return {
      position: position.key,
      positionName: position.name,
      isReversed: d.isReversed,
      card,
    };
  });
  return { question, spreadName, spreadNameEn, cards };
}
