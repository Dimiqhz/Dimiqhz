import test from 'node:test';
import assert from 'node:assert/strict';

import { renderProjectCard } from './assets.mjs';
import { PANEL_W, cardShape, cardWidths } from './markup.mjs';

const one = { name: 'Excel2SQL', language: 'Python', languageColor: '#3572A5' };

test('the cards of one row add up to exactly the panel width', () => {
  for (const count of [1, 2, 3, 4]) {
    const widths = cardWidths(count);
    assert.equal(widths.length, count);
    assert.equal(widths.reduce((a, b) => a + b, 0), PANEL_W, `${count} cards do not fill the row`);
  }
});

test('the row is one window: rounded ends, square middles', () => {
  assert.deepEqual([0, 1, 2, 3].map((i) => cardShape(i, 4)), ['left', 'middle', 'middle', 'right']);
  assert.equal(cardShape(0, 1), 'full');
});

test('a middle card rounds nothing, so the window reads as continuous', () => {
  const svg = renderProjectCard(one, 205, { shape: 'middle' });
  assert.ok(!svg.includes('A12 12'), 'a middle card still has a rounded corner');
});

test('only the first card carries the command', () => {
  assert.match(renderProjectCard(one, 205, { shape: 'left', command: 'ls' }), />ls</);
  assert.ok(!renderProjectCard(one, 205, { shape: 'middle' }).includes('>ls<'));
});

test('every card in a row is the same height so the window does not step', () => {
  const height = (svg) => svg.match(/<svg[^>]*height="(\d+)"/)[1];
  assert.equal(
    height(renderProjectCard(one, 205, { shape: 'left', command: 'ls' })),
    height(renderProjectCard(one, 205, { shape: 'middle' })),
  );
});

test('a name too long for its column is cut with an ellipsis', () => {
  const svg = renderProjectCard({ ...one, name: 'Shannon-Fano-Compression' }, 205, { shape: 'middle' });
  assert.match(svg, /…/);
});

test('a card escapes a repository name that contains markup', () => {
  const svg = renderProjectCard({ name: '<script>a()</script>', language: 'x' }, 205, { shape: 'middle' });
  assert.ok(!/<script[ >]/.test(svg), 'live markup reached the card');
});

test('a card marks its language in that language colour', () => {
  const svg = renderProjectCard({ name: 'One', language: 'Python', languageColor: '#3572A5' }, 205, { shape: 'middle' });
  assert.match(svg, /<circle[^>]*fill="#3572A5"/);
});
