// Fails if fr.json and en.json key sets differ. Run: node scripts/check-locales.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../messages/', import.meta.url));

const keysOf = (locale) => {
  const json = JSON.parse(readFileSync(`${dir}${locale}.json`, 'utf8'));
  return Object.keys(json).filter((k) => k !== '$schema').sort();
};

const fr = keysOf('fr');
const en = keysOf('en');

const onlyFr = fr.filter((k) => !en.includes(k));
const onlyEn = en.filter((k) => !fr.includes(k));

if (onlyFr.length || onlyEn.length) {
  console.error('Locale key mismatch:');
  if (onlyFr.length) console.error(`  missing in en.json: ${onlyFr.join(', ')}`);
  if (onlyEn.length) console.error(`  missing in fr.json: ${onlyEn.join(', ')}`);
  process.exit(1);
}

console.log(`check-locales: ${fr.length} keys match in fr.json and en.json`);
