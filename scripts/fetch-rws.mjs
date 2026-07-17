#!/usr/bin/env node
/**
 * Download 22 RWS Major Arcana images directly from jsDelivr CDN,
 * which mirrors all npm packages and has CDN nodes in mainland China.
 *
 * Source:  https://cdn.jsdelivr.net/npm/@cometpisces/tarot-kit-images/images/
 * License: Public Domain (1909 Rider-Waite-Smith)
 *
 * Why jsDelivr instead of npm install:
 *   - npm registry connections can be slow / hang in mainland China
 *   - jsDelivr is a global CDN with nodes in CN, so direct URL fetch is fast
 *   - Same files as the npm package — no install step needed
 *
 * Output: public/cards/major-XX.png
 *
 * Usage:
 *   node scripts/fetch-rws.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';
import http from 'node:http';
import { Agent as HttpsAgent } from 'node:https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '..', 'public', 'cards');

// Maps our card id "major-XX" to the file in the npm package.
const FILES = [
  ['00', '00-TheFool.png'],
  ['01', '01-TheMagician.png'],
  ['02', '02-TheHighPriestess.png'],
  ['03', '03-TheEmpress.png'],
  ['04', '04-TheEmperor.png'],
  ['05', '05-TheHierophant.png'],
  ['06', '06-TheLovers.png'],
  ['07', '07-TheChariot.png'],
  ['08', '08-Strength.png'],
  ['09', '09-TheHermit.png'],
  ['10', '10-WheelOfFortune.png'],
  ['11', '11-Justice.png'],
  ['12', '12-TheHangedMan.png'],
  ['13', '13-Death.png'],
  ['14', '14-Temperance.png'],
  ['15', '15-TheDevil.png'],
  ['16', '16-TheTower.png'],
  ['17', '17-TheStar.png'],
  ['18', '18-TheMoon.png'],
  ['19', '19-TheSun.png'],
  ['20', '20-Judgement.png'],
  ['21', '21-TheWorld.png'],
];

const CDN_HOST = 'cdn.jsdelivr.net';
const CDN_PATH = '/npm/@cometpisces/tarot-kit-images/images/';
const UA = 'TarotApp/1.0 (Sprint3; educational)';
const MAX_RETRIES = 3;

// IPv4 only — fixes macOS fetch() "ETIMEDOUT" issue
const agent = new HttpsAgent({
  family: 4,
  keepAlive: true,
  minVersion: 'TLSv1.2',
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fetchBuffer(host, pathname) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      {
        host,
        path: pathname,
        agent,
        headers: { 'User-Agent': UA, Accept: 'image/png,image/*' },
      },
      (res) => {
        const { statusCode } = res;
        if (statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${statusCode}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }
    );
    req.on('error', reject);
    req.setTimeout(20000, () => req.destroy(new Error('Request timed out (20s)')));
  });
}

async function downloadOne(num, fname) {
  const url = `https://${CDN_HOST}${CDN_PATH}${fname}`;
  const out = path.join(OUT_DIR, `major-${num}.png`);

  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const buf = await fetchBuffer(CDN_HOST, CDN_PATH + fname);
      // PNG magic bytes: 89 50 4e 47
      if (buf.length < 1000) {
        throw new Error(`Suspiciously small (${buf.length} bytes)`);
      }
      if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) {
        throw new Error(`Not a PNG (got ${buf[0]?.toString(16)} ${buf[1]?.toString(16)} ${buf[2]?.toString(16)} ${buf[3]?.toString(16)})`);
      }
      await writeFile(out, buf);
      const kb = (buf.length / 1024).toFixed(1);
      return { num, fname, out, kb };
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES) {
        const backoff = 1000 * attempt;
        console.warn(`    ⟳ retry ${attempt + 1}/${MAX_RETRIES} after ${backoff}ms (${err.message})`);
        await sleep(backoff);
      }
    }
  }
  throw lastErr;
}

async function diagnose() {
  console.log('▶ Diagnostic: testing connectivity to cdn.jsdelivr.net…');
  try {
    const buf = await fetchBuffer(CDN_HOST, CDN_PATH + '00-TheFool.png');
    console.log(`  ✓ reachable — first 4 bytes: ${buf[0]?.toString(16)} ${buf[1]?.toString(16)} ${buf[2]?.toString(16)} ${buf[3]?.toString(16)} (${buf.length} bytes)`);
    return true;
  } catch (err) {
    console.error(`  ✗ UNREACHABLE: ${err.message}`);
    console.error(`    code: ${err.code ?? 'n/a'}`);
    return false;
  }
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    await mkdir(OUT_DIR, { recursive: true });
  }

  console.log(`Downloading ${FILES.length} RWS cards → ${OUT_DIR}\n`);

  const reachable = await diagnose();
  if (!reachable) {
    console.error('\nAborting: jsDelivr is unreachable from this network.');
    console.error('Possible fixes:');
    console.error('  1. Check if your VPN / proxy is blocking cdn.jsdelivr.net');
    console.error('  2. Try with a different DNS (8.8.8.8)');
    console.error('  3. If you have a working proxy, set HTTPS_PROXY env var');
    process.exit(1);
  }

  console.log('');
  let ok = 0;
  for (const [num, fname] of FILES) {
    try {
      const r = await downloadOne(num, fname);
      console.log(`  ✓ major-${num}.png  ${r.kb} KB  (${fname})`);
      ok++;
    } catch (err) {
      console.error(`  ✗ major-${num}.png  FAILED: ${err.message}`);
    }
    await sleep(200);
  }

  console.log(`\nDone: ${ok}/${FILES.length} downloaded.`);
  if (ok < FILES.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
