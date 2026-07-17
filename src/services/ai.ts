import { http, toApiError } from './http';
import {
  buildUserPrompt,
  buildReadingRequest,
  SYSTEM_PROMPT,
  type ReadingRequest,
} from '@/utils/prompt';
import type { TarotReading } from '@/types/reading';
import type { Spread, DrawnCard } from '@/types/tarot';

/**
 * AI service — wraps the chat completion endpoint and parses the
 * structured JSON response into a TarotReading.
 *
 * Falls back to a safe default if the API returns invalid data
 * or if the network is unavailable.
 */

const MODEL = import.meta.env.VITE_API_MODEL;

interface ChatChoice {
  index: number;
  message: { role: 'assistant'; content: string };
  finish_reason: string;
}

interface ChatResponse {
  id: string;
  choices: ChatChoice[];
  usage?: { total_tokens: number };
}

export interface AIResponse<T> {
  data: T | null;
  raw: string;
  isFallback: boolean;
  error?: string;
}

/**
 * Validate that an object matches the TarotReading shape.
 * Loose on string lengths — strict on required fields + types.
 */
function isTarotReading(x: unknown): x is TarotReading {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  if (o.schemaVersion !== '1.0') return false;
  const r = o.reading as Record<string, unknown> | undefined;
  if (!r || typeof r.overview !== 'string') return false;
  if (!Array.isArray(r.perCard)) return false;
  if (typeof r.advice !== 'string') return false;
  const l = o.lucky as Record<string, unknown> | undefined;
  if (!l) return false;
  const c = l.color as Record<string, unknown> | undefined;
  const n = l.number as Record<string, unknown> | undefined;
  if (!c || typeof c.hex !== 'string' || typeof c.name !== 'string') return false;
  if (!n || typeof n.value !== 'number') return false;
  if (typeof l.phrase !== 'string') return false;
  return true;
}

/**
 * Try to extract JSON from a model response that may have stray wrappers.
 */
function extractJson(text: string): unknown | null {
  const trimmed = text.trim();
  // Direct parse
  try {
    return JSON.parse(trimmed);
  } catch {
    /* fallthrough */
  }
  // Find first { ... last }
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first >= 0 && last > first) {
    const slice = trimmed.slice(first, last + 1);
    try {
      return JSON.parse(slice);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Build a safe fallback reading when the LLM fails.
 */
function buildFallback(question: string, drawn: DrawnCard[]): TarotReading {
  return {
    schemaVersion: '1.0',
    reading: {
      overview: `感谢你提出这个问题："${question.slice(0, 20)}…"。
      此刻宇宙的讯息暂时无法完整传达，但你的直觉已经为你指明方向。
      请在静默中聆听内心最深处的声音。`,
      perCard: drawn.map((d) => ({
        position: d.position,
        positionName: d.positionName,
        coreEnergy: '静待揭示',
        interpretation: '牌面讯息暂时无法解读，请稍后重试。',
        suggestion: '深呼吸，给自己一点时间。',
      })),
      advice: '一切答案都在你心中，再静一静，重试一次。',
    },
    lucky: {
      color: { name: '月白', hex: '#F5F0E8', meaning: '纯净与直觉' },
      number: { value: 7, meaning: '内省与灵性' },
      phrase: '星光不问赶路人，时光不负有心人。',
    },
  };
}

export interface CallReadingArgs {
  question: string;
  spread: Spread;
  drawnCards: DrawnCard[];
}

/**
 * Call the LLM and return a structured TarotReading.
 * On failure (network, parse, schema) returns a fallback with isFallback=true.
 */
export async function callReading({
  question,
  spread,
  drawnCards,
}: CallReadingArgs): Promise<AIResponse<TarotReading>> {
  const req: ReadingRequest = buildReadingRequest(
    question,
    spread.name,
    spread.nameEn,
    spread.positions,
    drawnCards
  );

  const userPrompt = buildUserPrompt(req);

  let raw = '';
  try {
    const { data } = await http.post<ChatResponse>('/chat/completions', {
      model: MODEL,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    });

    raw = data.choices?.[0]?.message?.content ?? '';
    if (!raw) throw new Error('Empty response from LLM');

    const parsed = extractJson(raw);
    if (!parsed) {
      throw new Error('Response is not valid JSON');
    }
    if (!isTarotReading(parsed)) {
      throw new Error('Response does not match TarotReading schema');
    }
    return { data: parsed, raw, isFallback: false };
  } catch (err) {
    const apiErr = toApiError(err);
    console.warn('[ai] callReading failed, using fallback:', apiErr.message);
    return {
      data: buildFallback(question, drawnCards),
      raw,
      isFallback: true,
      error: apiErr.message,
    };
  }
}

export default callReading;
