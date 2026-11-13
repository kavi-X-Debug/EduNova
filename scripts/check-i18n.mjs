// Verifies en/si/ta locale files:
//  1. identical key sets (incl. plural suffixes _one/_other)
//  2. no empty values
//  3. the same {{placeholders}} in every language
//  4. si/ta values that are identical to English (untranslated) unless allowlisted
//  5. si/ta values with leftover English words (Latin words of 2+ letters) unless allowlisted
//  6. no replacement characters / stray control characters
// Allowlist: scripts/i18n-allowlist.json (brand names, acronyms, units, native language names).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src', 'i18n', 'locales');
const langs = ['en', 'si', 'ta'];
const data = Object.fromEntries(
  langs.map((l) => [l, JSON.parse(readFileSync(join(dir, `${l}.json`), 'utf8'))]),
);
const allow = JSON.parse(readFileSync(join(root, 'scripts', 'i18n-allowlist.json'), 'utf8'));
const identicalOk = new Set(allow.identicalKeys ?? []);
const latinOk = new Set((allow.latinTokens ?? []).map((w) => w.toLowerCase()));
const latinKeyOk = allow.latinTokensByKey ?? {};

const placeholders = (s) => [...s.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).sort().join(',');
/** Latin words of 2+ letters outside {{placeholders}}. */
const latinWords = (s) => (s.replace(/\{\{[^}]*\}\}/g, ' ').match(/[A-Za-z][A-Za-z'-]*[A-Za-z]/g) ?? []);

const errors = [];
const base = new Set(Object.keys(data.en));
for (const l of langs) {
  const keys = new Set(Object.keys(data[l]));
  for (const k of base) if (!keys.has(k)) errors.push(`[${l}] missing key: ${k}`);
  for (const k of keys) if (!base.has(k)) errors.push(`[${l}] extra key: ${k}`);
  for (const [k, v] of Object.entries(data[l])) {
    if (typeof v !== 'string' || v.trim() === '') {
      errors.push(`[${l}] empty value: ${k}`);
      continue;
    }
    if (data.en[k] && placeholders(v) !== placeholders(data.en[k]))
      errors.push(`[${l}] placeholder mismatch: ${k} (en {${placeholders(data.en[k])}} vs {${placeholders(v)}})`);
    if (/[�\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(v)) errors.push(`[${l}] bad character: ${k}`);
    if (l === 'en') continue;
    const words = latinWords(v);
    if (v === data.en[k] && words.some((w) => !latinOk.has(w.toLowerCase())) && !identicalOk.has(k))
      errors.push(`[${l}] identical to English (untranslated?): ${k} = ${JSON.stringify(v)}`);
    else if (v !== data.en[k]) {
      const byKey = new Set((latinKeyOk[k] ?? []).map((w) => w.toLowerCase()));
      const bad = words.filter((w) => !latinOk.has(w.toLowerCase()) && !byKey.has(w.toLowerCase()));
      if (bad.length && !identicalOk.has(k)) errors.push(`[${l}] English words left in ${k}: ${[...new Set(bad)].join(', ')}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\ni18n:check failed (${errors.length} problems)`);
  process.exit(1);
}
console.log(`i18n:check ok: ${base.size} keys x ${langs.length} locales`);
