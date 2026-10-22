// Downloads Switzer (regular and medium) from Fontshare into public/fonts.
// The ITF Free Font License allows self-hosting on our own site but not redistributing the
// files through a public repository, so the files are fetched at build time and never committed.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'fonts');
const weights = [400, 500];
const targets = weights.map((w) => join(outDir, `switzer-${w}.woff2`));

if (targets.every((t) => existsSync(t))) {
  console.log('fonts: Switzer already present');
  process.exit(0);
}

const css = await fetch(`https://api.fontshare.com/v2/css?f[]=switzer@${weights.join(',')}&display=swap`).then((r) => {
  if (!r.ok) throw new Error(`Fontshare CSS request failed: ${r.status}`);
  return r.text();
});

// One @font-face block per weight; take the woff2 source from each.
const faces = [...css.matchAll(/@font-face\s*{([^}]*)}/g)].map((m) => m[1]);
mkdirSync(outDir, { recursive: true });

for (const w of weights) {
  const face = faces.find((f) => new RegExp(`font-weight:\\s*${w};`).test(f));
  const src = face?.match(/url\('([^']+\.woff2)'\)/)?.[1];
  if (!src) throw new Error(`No woff2 source for Switzer ${w}`);
  const res = await fetch(src.startsWith('//') ? `https:${src}` : src);
  if (!res.ok) throw new Error(`Font download failed for weight ${w}: ${res.status}`);
  const file = join(outDir, `switzer-${w}.woff2`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log(`fonts: saved ${file}`);
}
