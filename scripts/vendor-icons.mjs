import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ICON_SLUGS } from './lib/stack-data.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEVICON = 'https://raw.githubusercontent.com/devicons/devicon/master';

const hexes = () => /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g;
const ON_DARK = 'var(--fg)';
const BUDGET = 4500;

const luminance = (hex) => {
  const raw = hex.slice(1);
  const full = raw.length === 3 ? [...raw].map((c) => c + c).join('') : raw;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

async function main() {
  const catalogue = await (await fetch(`${DEVICON}/devicon.json`)).json();
  const byName = new Map(catalogue.map((icon) => [icon.name, icon]));

  const icons = {};
  for (const [label, name] of Object.entries(ICON_SLUGS)) {
    const entry = byName.get(name);
    if (!entry) throw new Error(`Devicon has no icon named "${name}" (for ${label})`);

    const order = ['original', 'plain', 'original-wordmark', 'plain-wordmark'];
    const available = order.filter((v) => entry.versions.svg.includes(v));
    if (available.length === 0) throw new Error(`"${name}" has no usable variant`);

    let svg = null;
    for (const variant of available) {
      const response = await fetch(`${DEVICON}/icons/${name}/${name}-${variant}.svg`);
      if (!response.ok) throw new Error(`${name}-${variant}.svg responded ${response.status}`);
      const candidate = await response.text();
      if (svg === null || candidate.length < svg.length) svg = candidate;
      if (candidate.length <= BUDGET) break;
    }

    const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 128 128';
    const body = svg
      .replace(/^[\s\S]*?<svg[^>]*>/, '')
      .replace(/<\/svg>\s*$/, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const ns = name.replace(/[^a-z0-9]/g, '');
    const scoped = body
      .replace(/xlink:href/g, 'href')
      .replace(/\sid="([^"]+)"/g, (_, id) => ` id="${ns}-${id}"`)
      .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${ns}-${id})`)
      .replace(/href="#([^"]+)"/g, (_, id) => `href="#${ns}-${id}"`);

    const fills = [...scoped.matchAll(hexes())].map((m) => m[0]);
    const readable = fills.length === 0 || Math.max(...fills.map(luminance)) >= 0.25;

    icons[label] = { viewBox, body: readable ? scoped : scoped.replace(hexes(), ON_DARK) };
  }

  const out = path.join(ROOT, 'scripts/lib/icons.json');
  await writeFile(out, `${JSON.stringify(icons, null, 0)}\n`);
  console.log(`vendored ${Object.keys(icons).length} icons into scripts/lib/icons.json`);
}

main().catch((error) => {
  console.error(`vendor-icons failed: ${error.message}`);
  process.exit(1);
});
