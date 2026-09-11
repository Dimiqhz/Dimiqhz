import test from 'node:test';
import assert from 'node:assert/strict';

import { renderProjectRow } from './assets.mjs';
import { PANEL_W } from './markup.mjs';

const one = { name: 'Excel2SQL', description: 'A tool for things', language: 'Python', languageColor: '#3572A5', stars: 3 };

const height = (svg) => Number(svg.match(/<svg[^>]*height="(\d+)"/)[1]);

test('a project is one full-width row, which is the only shape that stacks seamlessly', () => {
  // Floated images keep 20px of padding to their right, so a row of cards can
  // never close up; stacked full-width slices meet at exactly 0px.
  assert.match(renderProjectRow(one), new RegExp(`<svg[^>]*width="${PANEL_W}"`));
});

test('every row is the same height so the block does not step', () => {
  assert.equal(height(renderProjectRow(one)), height(renderProjectRow({ ...one, name: 'A', description: 'b' })));
});

test('a row keeps its description', () => {
  assert.match(renderProjectRow(one), />A tool for things</);
});

test('a description too long for the row is cut with an ellipsis', () => {
  const long = 'An intuitive tool for converting Excel spreadsheets into SQL scripts, designed to streamline every single migration that anyone anywhere could ever want to run';
  assert.match(renderProjectRow({ ...one, description: long }), /…/);
});

test('a row escapes a repository name that contains markup', () => {
  assert.ok(!/<script[ >]/.test(renderProjectRow({ ...one, name: '<script>a()</script>' })));
});

test('a row marks its language in that language colour', () => {
  assert.match(renderProjectRow(one), /<circle[^>]*fill="#3572A5"/);
});

test('a row states its stars, and says nothing when there are none', () => {
  assert.match(renderProjectRow(one), /★ 3/);
  assert.ok(!renderProjectRow({ ...one, stars: 0 }).includes('★'));
});

test('a row with no language still renders', () => {
  const svg = renderProjectRow({ ...one, language: null, languageColor: null });
  assert.ok(!svg.includes('NaN'), 'row contains NaN');
  assert.ok(!svg.includes('<circle'), 'a language dot with no language');
});

test('a row keeps its description inside the window padding', () => {
  // JetBrains Mono advances exactly 0.6em, so 13px text is 7.8px a character.
  const long = 'x'.repeat(400);
  const svg = renderProjectRow({ ...one, description: long });
  const shown = svg.match(/font-size="13"[^>]*>([^<]+)</)[1];
  assert.ok(28 + shown.length * 7.8 <= PANEL_W - 36, `${shown.length} characters run past the padding`);
});

test('a long name is cut before it reaches the language column', () => {
  const svg = renderProjectRow({ ...one, name: 'Shannon-Fano-Compression'.repeat(4) });
  const shown = svg.match(/font-size="15"[^>]*>([^<]+)</)[1];
  const dot = Number(svg.match(/<circle cx="(\d+)"/)[1]);
  assert.ok(shown.endsWith('…'), `"${shown}" was not cut`);
  assert.ok(28 + shown.length * 9 <= dot - 8, `"${shown}" reaches the language column`);
});

test('the language column sits at the same place in every row', () => {
  const dotOf = (svg) => svg.match(/<circle cx="(\d+)"/)[1];
  const withStars = renderProjectRow({ ...one, language: 'C++', stars: 12 });
  const without = renderProjectRow({ ...one, language: 'Python', stars: 0 });
  assert.equal(dotOf(withStars), dotOf(without), 'stars push the language column sideways');
});
