import test from 'node:test';
import assert from 'node:assert/strict';

import { renderProjectCard } from './assets.mjs';
import { PANEL_W, cardCorners, cardWidths } from './markup.mjs';

const one = { name: 'Excel2SQL', description: 'A tool for things', language: 'Python', languageColor: '#3572A5' };

test('cards are laid out two to a row and each row fills the panel', () => {
  for (const count of [1, 2, 3, 4]) {
    const widths = cardWidths(count);
    assert.equal(widths.length, count);
    for (let i = 0; i < count; i += 2) {
      const row = widths.slice(i, i + 2).reduce((a, b) => a + b, 0);
      assert.equal(row, PANEL_W, `row starting at ${i} does not fill the panel`);
    }
  }
});

test('only the outer corners of the block are rounded', () => {
  assert.deepEqual(cardCorners(0, 4), { tl: true, tr: false, bl: false, br: false });
  assert.deepEqual(cardCorners(1, 4), { tl: false, tr: true, bl: false, br: false });
  assert.deepEqual(cardCorners(2, 4), { tl: false, tr: false, bl: true, br: false });
  assert.deepEqual(cardCorners(3, 4), { tl: false, tr: false, bl: false, br: true });
});

test('a single project is a rounded block on its own', () => {
  assert.deepEqual(cardCorners(0, 1), { tl: true, tr: true, bl: true, br: true });
});

test('the first row is taller, because it carries the command', () => {
  const height = (svg) => Number(svg.match(/<svg[^>]*height="(\d+)"/)[1]);
  const first = renderProjectCard(one, 410, { corners: cardCorners(0, 4), command: 'ls ./projects' });
  const second = renderProjectCard(one, 410, { corners: cardCorners(1, 4), topRow: true });
  const third = renderProjectCard(one, 410, { corners: cardCorners(2, 4) });
  assert.equal(height(first), height(second), 'a row must not step');
  assert.ok(height(first) > height(third), 'the command needs room the other rows do not');
});

test('only the first card carries the command', () => {
  assert.match(renderProjectCard(one, 410, { command: 'ls ./projects' }), />ls \.\/projects</);
  assert.ok(!renderProjectCard(one, 410, {}).includes('ls ./projects'));
});

test('a card keeps its description', () => {
  assert.match(renderProjectCard(one, 410, {}), />A tool for things</);
});

test('a card escapes a repository name that contains markup', () => {
  assert.ok(!/<script[ >]/.test(renderProjectCard({ ...one, name: '<script>a()</script>' }, 410, {})));
});
