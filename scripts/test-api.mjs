/**
 * Standalone smoke test for the Qwen (OpenAI-compatible) API.
 *
 * Run with:  node --env-file=.env scripts/test-api.mjs
 *
 * Behavior:
 *   1. Validates the API key and BASE_URL are present and not placeholders.
 *   2. Tries the model named in VITE_API_MODEL first.
 *   3. If that fails with "model not found", iterates a list of
 *      commonly-available Qwen models and reports the first that works.
 *   4. Prints a clear "next step" instruction at the end.
 */

import process from 'node:process';

const API_KEY = process.env.VITE_API_KEY;
const API_BASE = process.env.VITE_API_BASE;
const PREFERRED_MODEL = process.env.VITE_API_MODEL;

if (!API_KEY || API_KEY === 'sk-your-qwen-api-key-here') {
  console.error('❌ VITE_API_KEY is missing or still a placeholder.');
  console.error('   Edit .env and set VITE_API_KEY=sk-your-real-key');
  process.exit(1);
}
if (!API_BASE) {
  console.error('❌ VITE_API_BASE is missing.');
  console.error('   Edit .env and set VITE_API_BASE=https://...compatible-mode/v1');
  process.exit(1);
}

const CANDIDATE_MODELS = [
  PREFERRED_MODEL,
  'qwen-turbo',
  'qwen-plus',
  'qwen-max',
  'qwen-long',
  'qwen3-max-preview',
  'qwen3-plus',
  'qwen3-72b',
].filter(Boolean);

const url = `${API_BASE}/chat/completions`;
console.log('▶ POST', url);
console.log('▶ trying models:', CANDIDATE_MODELS.join(', '));
console.log('');

async function tryModel(model) {
  const body = {
    model,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: '严格只输出 JSON：{"ok": true}' },
      { role: 'user', content: '回复 ok' },
    ],
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, text, model };
}

for (const model of CANDIDATE_MODELS) {
  process.stdout.write(`  ⏳ ${model} ... `);
  try {
    const { status, text } = await tryModel(model);
    if (status === 200) {
      console.log('✅ OK');
      const data = JSON.parse(text);
      const content = data?.choices?.[0]?.message?.content ?? '(empty)';
      console.log(`     reply: ${content}`);
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ Recommended model: ${model}`);
      console.log('');
      console.log('👉 Set in .env:');
      console.log(`   VITE_API_MODEL=${model}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      process.exit(0);
    } else {
      // Try to surface a useful error message
      let detail = text;
      try {
        const j = JSON.parse(text);
        detail = j?.error?.message || j?.message || text;
      } catch { /* keep raw */ }
      console.log(`❌ HTTP ${status} — ${detail.slice(0, 120)}`);
    }
  } catch (err) {
    console.log(`❌ network error — ${err.message}`);
  }
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('❌ No candidate model worked. Possible causes:');
console.log('   1. API key invalid or expired — re-check at');
console.log('      https://dashscope.console.aliyun.com/apiKey');
console.log('   2. BASE_URL wrong — it MUST be the OpenAI-compatible');
console.log('      URL, ending in /compatible-mode/v1');
console.log('   3. The model list above is from a different region/account.');
console.log('      Open https://dashscope.console.aliyun.com/ → "模型广场"');
console.log('      to find the exact model name you subscribed to.');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
process.exit(1);
