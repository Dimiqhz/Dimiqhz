import test from 'node:test';
import assert from 'node:assert/strict';

import { renderProjectCard } from './assets.mjs';
import { PANEL_W, cardCorners, cardWidths } from './markup.mjs';

const one = { name: 'Excel2SQL', description: 'A tool for things', language: 'Python', languageColor: '#3572A5' };

test('the cards sit in one row that fills the panel', () => {
  // One row is the only seamless arrangement: two stacked images are always
  // separated by the line box, and that 6px cannot be closed without CSS.
  for (const count of [1, 2, 3, 4]) {
    const widths = cardWidths(count);
    assert.equal(widths.length, count);
    assert.equal(widths.reduce((a, b) => a + b, 0), PANEL_W, `${count} cards do not fill the row`);
  }
});

test('only the two ends of the row are rounded', () => {
  assert.deepEqual(cardCorners(0, 4), { tl: true, bl: true, tr: false, br: false });
  assert.deepEqual(cardCorners(1, 4), { tl: false, bl: false, tr: false, br: false });
  assert.deepEqual(cardCorners(3, 4), { tl: false, bl: false, tr: true, br: true });
});

test('a lone card is rounded all round', () => {
  assert.deepEqual(cardCorners(0, 1), { tl: true, bl: true, tr: true, br: true });
});

test('every card in the row is the same height so the block does not step', () => {
  const height = (svg) => svg.match(/<svg[^>]*height="(\d+)"/)[1];
  assert.equal(
    height(renderProjectCard(one, 205, { corners: cardCorners(0, 4) })),
    height(renderProjectCard(one, 205, { corners: cardCorners(2, 4) })),
  );
});

test('a card keeps its description', () => {
  assert.match(renderProjectCard(one, 205, {}), />A tool for things</);
});

test('a description too long for the column is cut with an ellipsis', () => {
  const long = 'An intuitive tool for converting Excel spreadsheets into SQL scripts, designed to streamline every migration anyone could want';
  assert.match(renderProjectCard({ ...one, description: long }, 205, {}), /…/);
});

test('a card escapes a repository name that contains markup', () => {
  assert.ok(!/<script[ >]/.test(renderProjectCard({ ...one, name: '<script>a()</script>' }, 205, {})));
});

test('a card marks its language in that language colour', () => {
  assert.match(renderProjectCard(one, 205, {}), /<circle[^>]*fill="#3572A5"/);
});

test('a name too long for its column is cut, not clipped by the card edge', () => {
  const svg = renderProjectCard({ ...one, name: 'Shannon-Fano-Compression' }, 205, {});
  const shown = svg.match(/font-size="14" font-weight="600"[^>]*>([^<]+)</)[1];
  assert.ok(shown.endsWith('…'), `"${shown}" was not cut`);
  assert.ok(shown.length * 8.4 <= 205 - 28 - 16, `"${shown}" still overflows the column`);
});
