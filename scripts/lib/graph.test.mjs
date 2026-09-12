import test from 'node:test';
import assert from 'node:assert/strict';

import { renderGraph } from './assets.mjs';
import { IMAGE_W, PANEL_W } from './markup.mjs';

const calendar = Array.from({ length: 53 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => ({ date: `2026-01-${w}-${d}`, count: (w + d) % 5 })));

test('the graph is drawn on the shared grid width', () => {
  assert.match(renderGraph(calendar), new RegExp(`<svg[^>]*width="${IMAGE_W}"`));
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



const spread = (svg) => {
  const counts = [0, 0, 0, 0, 0];
  for (const m of gridOf(svg).matchAll(/class="d(\d)"/g)) counts[Number(m[1])] += 1;
  return counts;
};

test('one busy day does not flatten every other day to the palest shade', () => {
  // The real calendar has 121 active days, a median of 12 and one day of 74.
  // Scaling levels against that maximum painted 94 of the 121 at level 1.
  const weeks = [];
  for (let w = 0; w < 20; w += 1) {
    weeks.push(Array.from({ length: 7 }, (_, d) => ({ date: `w${w}d${d}`, count: (w * 7 + d) % 6 === 0 ? 0 : 4 + ((w + d) % 20) })));
  }
  weeks[0][0] = { date: 'spike', count: 74 };

  const levels = spread(renderGraph(weeks));
  const active = levels[1] + levels[2] + levels[3] + levels[4];
  assert.ok(levels[1] <= active * 0.45, `${levels[1]} of ${active} active days are the palest shade`);
  for (const l of [1, 2, 3, 4]) assert.ok(levels[l] > 0, `no day reached level ${l}`);
});

test('a day with more work is never painted lighter than a quieter one', () => {
  const weeks = [Array.from({ length: 7 }, (_, d) => ({ date: `d${d}`, count: d * 3 }))];
  const levels = [...gridOf(renderGraph(weeks)).matchAll(/class="d(\d)"/g)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i += 1) {
    assert.ok(levels[i] >= levels[i - 1], 'the ramp is not monotonic');
  }
});
