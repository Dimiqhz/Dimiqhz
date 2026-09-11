import test from 'node:test';
import assert from 'node:assert/strict';

import { renderGraph } from './assets.mjs';
import { PANEL_W } from './markup.mjs';

const calendar = Array.from({ length: 53 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => ({ date: `2026-01-${w}-${d}`, count: (w + d) % 5 })));

test('the graph is drawn on the shared grid width', () => {
  assert.match(renderGraph(calendar), new RegExp(`<svg[^>]*width="${PANEL_W}"`));
});

const gridOf = (svg) => svg.match(/<g clip-path="url\(#wipe\)">([\s\S]*?)<\/g>/)[1];

test('the graph draws one cell per day', () => {
  const cells = [...gridOf(renderGraph(calendar)).matchAll(/class="d\d"/g)].length;
  assert.equal(cells, 53 * 7);
});

test('a day with no contributions gets the empty level', () => {
  const quiet = [[{ date: '2026-01-01', count: 0 }]];
  assert.match(renderGraph(quiet), /class="d0"/);
});

test('the graph survives a year with no contributions at all', () => {
  const empty = Array.from({ length: 3 }, () => Array.from({ length: 7 }, () => ({ date: 'x', count: 0 })));
  const svg = renderGraph(empty);
  assert.ok(!svg.includes('NaN'), 'the level maths divided by zero');
});

test('no cell is drawn outside the panel', () => {
  const xs = [...renderGraph(calendar).matchAll(/<rect class="d\d" x="(\d+)"/g)].map((m) => Number(m[1]));
  assert.ok(Math.max(...xs) + 12 <= PANEL_W - 20, 'the grid overflows its box');
});

test('the graph adapts to a light page and honours reduced motion', () => {
  const svg = renderGraph(calendar);
  assert.match(svg, /@media \(prefers-color-scheme: light\)/);
  assert.match(svg, /@media \(prefers-reduced-motion: no-preference\)/);
});


