import test from 'node:test';
import assert from 'node:assert/strict';

import {
  renderAbout, renderBottom, renderGraph, renderHeader, renderProjectRow,
  renderPromptStrip, renderStack, renderStats,
} from './assets.mjs';
import { PANEL_W } from './markup.mjs';

const profile = { contributions: 1, repositories: 1, languages: [{ name: 'Shell', color: '#89e051', size: 1 }] };
const calendar = Array.from({ length: 53 }, () => Array.from({ length: 7 }, () => ({ date: 'x', count: 1 })));
const project = { name: 'Excel2SQL', description: 'A tool', language: 'Python', languageColor: '#3572A5', stars: 3 };

// The profile is one terminal window sliced across stacked images. Every slice
// draws the two side edges; only the first and the last close the window.
const middle = () => ({
  'prompt strip': renderPromptStrip('neofetch'),
  about: renderAbout(),
  'project row': renderProjectRow(project),
  stats: renderStats(profile),
  graph: renderGraph(calendar),
  stack: renderStack(),
});

const edges = (svg) => {
  const match = svg.match(/<path class="edge"[^>]*\sd="([^"]+)"/);
  assert.ok(match, 'the slice draws no window edge');
  return match[1];
};

const size = (svg) => {
  const m = svg.match(/<svg[^>]*width="(\d+)" height="(\d+)"/);
  return { width: Number(m[1]), height: Number(m[2]) };
};

test('every slice is exactly as wide as the window', () => {
  for (const [name, svg] of Object.entries({ header: renderHeader(), ...middle(), bottom: renderBottom() })) {
    assert.equal(size(svg).width, PANEL_W, `${name} is not the window width`);
  }
});

test('a middle slice draws both side edges and neither end', () => {
  for (const [name, svg] of Object.entries(middle())) {
    const d = edges(svg);
    const { height } = size(svg);
    assert.equal(d, `M.5 0V${height}M${PANEL_W - 0.5} 0V${height}`, `${name} does not run the window edges past both ends`);
  }
});

test('only the header closes the window at the top', () => {
  assert.match(edges(renderHeader()), /^M\.5 \d+V12A12 12 0 0 1 12\.5 \.5/);
  for (const [name, svg] of Object.entries(middle())) {
    assert.ok(!edges(svg).includes('A'), `${name} rounds a corner in the middle of the window`);
  }
});

test('only the last slice closes the window at the bottom', () => {
  assert.match(edges(renderBottom()), /V0$/);
  assert.ok(edges(renderBottom()).includes('A12 12'), 'the window is not rounded off at the bottom');
});

test('a middle slice fills to its own top and bottom so no page shows through', () => {
  for (const [name, svg] of Object.entries(middle())) {
    const fill = svg.match(/<path class="frame"[^>]*\sd="([^"]+)"/);
    assert.ok(fill, `${name} paints no window background`);
    assert.ok(!fill[1].includes('A'), `${name} rounds its background away from the edge`);
  }
});

test('the title bar belongs to the header alone', () => {
  assert.match(renderHeader(), /class="light"/);
  for (const [name, svg] of Object.entries({ ...middle(), bottom: renderBottom() })) {
    assert.ok(!svg.includes('class="light"'), `${name} carries a second title bar`);
  }
});

test('the session ends with one blinking cursor, in the last slice', () => {
  assert.match(renderBottom(), /class="cur"/);
  assert.ok(!renderHeader().includes('class="cur"'), 'the header still ends the session early');
});

test('a project row spans the window so four of them stack seamlessly', () => {
  assert.equal(size(renderProjectRow(project)).width, PANEL_W);
});
