import test from 'node:test';
import assert from 'node:assert/strict';

import {
  GUTTER, renderAbout, renderGraph, renderHeader, renderProjectCell,
  renderPromptStrip, renderStack, renderStats,
} from './assets.mjs';
import { IMAGE_W, PANEL_W } from './markup.mjs';

const profile = { contributions: 1, repositories: 1, languages: [{ name: 'Shell', color: '#89e051', size: 1 }] };
const calendar = Array.from({ length: 53 }, () => Array.from({ length: 7 }, () => ({ date: 'x', count: 1 })));
const project = { name: 'Excel2SQL', description: 'A tool', language: 'Python', languageColor: '#3572A5', stars: 3 };

const terminal = () => renderHeader();
const opensBlock = () => renderPromptStrip('neofetch', null, { top: true });
const closesBlock = () => renderStack({ bottom: true });

const middle = () => ({
  'prompt strip': renderPromptStrip('gh stats'),
  about: renderAbout(),
  stats: renderStats(profile),
  graph: renderGraph(calendar),
});

const edges = (svg) => {
  const match = svg.match(/<path class="edge"[^>]*\sd="([^"]+)"/);
  assert.ok(match, 'the slice draws no edge');
  return match[1];
};

const size = (svg) => {
  const m = svg.match(/<svg[^>]*width="(\d+)" height="(\d+)"/);
  return { width: Number(m[1]), height: Number(m[2]) };
};

test('every slice is drawn on the full column, with the block centred in it', () => {
  const inset = (IMAGE_W - PANEL_W) / 2;
  const all = { terminal: terminal(), opens: opensBlock(), ...middle(), closes: closesBlock() };
  for (const [name, svg] of Object.entries(all)) {
    assert.equal(size(svg).width, IMAGE_W, `${name} is not the column width`);
    assert.ok(svg.includes(`<g transform="translate(${inset} 0)"`), `${name} does not centre itself`);
  }
});

test('the block leaves the same margin on both sides', () => {
  assert.equal(IMAGE_W, 846, 'the canvas has to match the widest column GitHub gives');
  assert.equal((IMAGE_W - PANEL_W) % 2, 0, 'an odd margin cannot be split evenly');
});

test('a middle slice draws both side edges and neither end', () => {
  for (const [name, svg] of Object.entries(middle())) {
    const d = edges(svg);
    const { height } = size(svg);
    assert.equal(d, `M.5 0V${height}M${PANEL_W - 0.5} 0V${height}`, `${name} does not run the edges past both ends`);
  }
});

test('a middle slice fills to its own top and bottom so no page shows through', () => {
  for (const [name, svg] of Object.entries(middle())) {
    const fill = svg.match(/<path class="frame"[^>]*\sd="([^"]+)"/);
    assert.ok(fill, `${name} paints no background`);
    assert.ok(!fill[1].includes('A'), `${name} rounds its background away from the edge`);
  }
});

test('the terminal is a window; the block below it is not a second one', () => {
  assert.match(terminal(), /class="light"/, 'the terminal lost its chrome');
  assert.match(terminal(), /class="title"/, 'the terminal lost its name');
  for (const [name, svg] of Object.entries({ opens: opensBlock(), ...middle(), closes: closesBlock() })) {
    assert.ok(!svg.includes('class="light"'), `${name} wears chrome and reads as another terminal`);
    assert.ok(!svg.includes('class="title"'), `${name} repeats the window name`);
  }
});

test('the terminal is a closed window, rounded at both ends', () => {
  const d = edges(terminal());
  assert.match(d, /^M\.5 \d+V12A12 12 0 0 1 12\.5 \.5/, 'the terminal does not round its top');
  assert.ok(d.endsWith('Z'), 'the terminal is left open at the bottom');
});

test('the gap between the two blocks is drawn, not left to the page', () => {
  const withGap = renderAbout({ bottom: true, gutter: GUTTER });
  const flush = renderAbout({ bottom: true });
  assert.equal(size(withGap).height - size(flush).height, GUTTER);
  assert.equal(edges(withGap), edges(flush), 'the gutter moved the frame instead of sitting under it');
});

test('the block opens on its first command and closes on its last panel', () => {
  assert.match(edges(opensBlock()), /^M\.5 \d+V12A12 12 0 0 1 12\.5 \.5/, 'the block has no rounded top');
  assert.match(edges(closesBlock()), /V0$/, 'the block is never closed');
  assert.ok(edges(closesBlock()).includes('A12 12'), 'the block is not rounded off at the bottom');
});

test('only the terminal moves; the block is complete the moment it paints', () => {
  assert.match(terminal(), /class="cur"/, 'the terminal has no prompt to come back to');
  for (const [name, svg] of Object.entries({ opens: opensBlock(), ...middle(), closes: closesBlock() })) {
    assert.ok(!svg.includes('class="cur"'), `${name} blinks a cursor outside the terminal`);
    assert.ok(!/steps\(\d+\)/.test(svg), `${name} types a command that sits above output already printed`);
  }
});

test('a project cell is half a slice, so two of them make up one row', () => {
  assert.equal(size(renderProjectCell(project, 'left')).width * 2, IMAGE_W);
});
