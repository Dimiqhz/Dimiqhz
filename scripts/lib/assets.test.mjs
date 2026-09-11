import test from 'node:test';
import assert from 'node:assert/strict';

import { BAR_W, renderStats } from './assets.mjs';

const profile = {
  contributions: 1344,
  repositories: 26,
  languages: [
    { name: 'TypeScript', color: '#3178c6', size: 842 },
    { name: 'Python', color: '#3572A5', size: 158 },
  ],
};


const UNESCAPED = /&(?!(amp|lt|gt|quot|apos|#\d+);)/;

test('renderStats escapes a language name that contains markup', () => {
  const svg = renderStats({ ...profile, languages: [{ name: 'A & B <x>', color: '#fff', size: 10 }] });
  assert.ok(!UNESCAPED.test(svg), 'SVG contains an unescaped ampersand');
});

test('renderStats groups the commit count', () => {
  assert.match(renderStats(profile), /1,344/);
});

test('renderStats fills the whole track for a language at one hundred percent', () => {
  const svg = renderStats({ ...profile, languages: [{ name: 'TypeScript', color: '#3178c6', size: 10 }] });
  const widths = [...svg.matchAll(/<rect[^>]*class="bar"[^>]*width="(\d+)"/g)].map((m) => Number(m[1]));
  assert.deepEqual(widths, [BAR_W]);
});

test('renderStats survives a profile with no code in it', () => {
  const svg = renderStats({ contributions: 0, repositories: 0, languages: [] });
  assert.ok(!svg.includes('NaN'), 'SVG contains NaN');
});

test('renderStats charts at most five languages', () => {
  const languages = Array.from({ length: 9 }, (_, i) => ({ name: `L${i}`, color: '#ffffff', size: 10 - i }));
  const svg = renderStats({ contributions: 1, repositories: 1, languages });
  assert.equal([...svg.matchAll(/class="bar"/g)].length, 5);
});


test('the growing bars are gated on reduced motion too', () => {
  assert.match(renderStats(profile), /@media \(prefers-reduced-motion: no-preference\)/);
});

test('no bar animation loops', () => {
  assert.ok(!renderStats(profile).includes('infinite'), 'a bar animation loops forever');
});

test('each headline number is painted with its own gradient', () => {
  const svg = renderStats(profile);
  const refs = [...svg.matchAll(/font-size="34"[^>]*fill="url\(#([^)]+)\)"/g)].map((m) => m[1]);
  assert.equal(refs.length, 3, 'expected three headline numbers');
  assert.equal(new Set(refs).size, 3, 'the numbers share a gradient id');
});

test('the headline counter says what it counts and over what window', () => {
  assert.match(renderStats(profile), /contributions, last 12 months/);
});

test('the stats panel is no taller than its content needs', () => {
  const svg = renderStats(profile);
  const height = Number(svg.match(/<svg[^>]*height="(\d+)"/)[1]);
  const lowest = Math.max(...[...svg.matchAll(/<(?:text|rect)[^>]* y="(\d+)"/g)].map((m) => Number(m[1])));
  assert.ok(height - lowest <= 48, `${height - lowest}px of dead space under the last row`);
});
