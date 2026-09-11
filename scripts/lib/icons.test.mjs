import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const icons = JSON.parse(readFileSync(new URL('./icons.json', import.meta.url), 'utf8'));

const luminance = (hex) => {
  const h = hex.slice(1);
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

test('every vendored icon has something visible against the dark panel', () => {
  const invisible = Object.entries(icons)
    .map(([name, { body }]) => [name, [...body.matchAll(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)].map((m) => m[0])])
    .filter(([, fills]) => fills.length > 0 && Math.max(...fills.map(luminance)) < 0.25)
    .map(([name]) => name);
  assert.deepEqual(invisible, [], 'these icons are black on a near-black panel');
});

test('every icon in the stack list was vendored', () => {
  assert.ok(Object.keys(icons).length >= 50);
});

test('the vendored bundle stays small enough to ship in one image', () => {
  const bytes = readFileSync(new URL('./icons.json', import.meta.url)).length;
  assert.ok(bytes < 200_000, `icons.json is ${Math.round(bytes / 1024)}KB; paths need rounding`);
});

test('vendored path data is never rewritten', () => {
  const bodies = Object.values(icons).map((i) => i.body).join('');
  assert.match(bodies, /\d\.\d{2,}/, 'coordinates look rounded');
});

test('the embedded typeface carries both weights and no network reference', () => {
  const font = JSON.parse(readFileSync(new URL('./font.json', import.meta.url), 'utf8'));
  assert.ok(font.regular.length > 1000 && font.bold.length > 1000, 'a weight is missing');
  assert.ok(!/https?:/.test(font.regular + font.bold), 'the font points at a network resource');
});
