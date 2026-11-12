// Fails when code uses a literal t('key') that does not exist in en.json.
// (check-i18n.mjs only compares the three locale files with each other.)
import fs from 'node:fs';
import path from 'node:path';

const en = JSON.parse(fs.readFileSync('src/i18n/locales/en.json', 'utf8'));
const missing = new Map();
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(f)) {
      const s = fs.readFileSync(p, 'utf8');
      for (const m of s.matchAll(/\b(?:t|tk)\(\s*['"]([a-z][A-Za-z0-9_.-]+)['"]/g)) {
        const k = m[1];
        if (!(k in en) && !(`${k}_one` in en) && !(`${k}_other` in en)) {
          if (!missing.has(k)) missing.set(k, p.split(path.sep).join('/'));
        }
      }
    }
  }
})('src');
for (const [k, p] of missing) console.log(`missing: ${k}  <- ${p}`);
if (missing.size) process.exit(1);
console.log('i18n usage ok');
