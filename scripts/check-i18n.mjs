// Verifies en/si/ta locale files share identical key sets, have no empty values,
// and use the same {{placeholders}} in every language.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'i18n', 'locales');
const langs = ['en', 'si', 'ta'];
const data = Object.fromEntries(
  langs.map((l) => [l, JSON.parse(readFileSync(join(dir, `${l}.json`), 'utf8'))]),
);
const placeholders = (s) => [...s.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).sort().join(',');

const errors = [];
const base = new Set(Object.keys(data.en));
for (const l of langs) {
  const keys = new Set(Object.keys(data[l]));
  for (const k of base) if (!keys.has(k)) errors.push(`[${l}] missing key: ${k}`);
  for (const k of keys) if (!base.has(k)) errors.push(`[${l}] extra key: ${k}`);
  for (const [k, v] of Object.entries(data[l])) {
    if (typeof v !== 'string' || v.trim() === '') errors.push(`[${l}] empty value: ${k}`);
    else if (data.en[k] && placeholders(v) !== placeholders(data.en[k]))
      errors.push(`[${l}] placeholder mismatch: ${k}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\ni18n:check failed (${errors.length} problems)`);
  process.exit(1);
}
console.log(`i18n:check ok: ${base.size} keys x ${langs.length} locales`);
