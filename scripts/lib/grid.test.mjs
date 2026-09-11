import test from 'node:test';
import assert from 'node:assert/strict';

import { renderAbout, renderBottom, renderGraph, renderHeader, renderProjectRow, renderPromptStrip, renderStack, renderStats } from './assets.mjs';
import { PANEL_W } from './markup.mjs';

const profile = {
  contributions: 1344,
  repositories: 26,
  languages: [{ name: 'TypeScript', color: '#3178c6', size: 842 }],
};

test('the grid fits the profile README column', () => {
  // Measured on the live profile page with headless Edge: the column is 844px
  // at both 1280 and 1440 viewports — GitHub caps it. A pair of half-width
  // cards must fit inside it too, or the browser wraps them onto two lines,
  // which is exactly how they ended up stacked in production.
  assert.ok(PANEL_W <= 844, `${PANEL_W}px is wider than the 844px column`);
  assert.equal(PANEL_W % 2, 0, 'halves have to be whole pixels');
});

test('every panel is drawn at the shared grid width', () => {
  for (const [name, svg] of Object.entries({
    header: renderHeader(),
    about: renderAbout(),
    stats: renderStats(profile),
    prompt: renderPromptStrip('ls ./projects'),
  })) {
    assert.match(svg, new RegExp(`<svg[^>]*width="${PANEL_W}"`), `${name} is off the grid`);
  }
});

test('the prompt strip shows the command it was given', () => {
  assert.match(renderPromptStrip('ls ./projects'), />ls \.\/projects</);
});

test('the prompt strip is a bare command line, not another window', () => {
  assert.ok(!renderPromptStrip('ls ./projects').includes('#ff5f57'), 'the strip has window chrome');
});

test('the prompt strip escapes whatever command it is handed', () => {
  assert.ok(!/&(?!(amp|lt|gt|quot|apos|#\d+);)/.test(renderPromptStrip('grep a & b')));
});




test('every asset adapts to a light page', () => {
  const profile = { contributions: 1, repositories: 1, languages: [{ name: 'Shell', color: '#89e051', size: 1 }] };
  const assets = {
    header: renderHeader(),
    about: renderAbout(),
    stats: renderStats(profile),
    stack: renderStack(),
    prompt: renderPromptStrip('ls'),
    row: renderProjectRow({ name: 'a', description: 'b', language: 'Shell' }),
    bottom: renderBottom(),
  };
  for (const [name, svg] of Object.entries(assets)) {
    assert.match(svg, /@media \(prefers-color-scheme: light\)/, `${name} is dark-only`);
  }
});

test('no text is painted a colour that disappears on a white page', () => {
  const luminance = (hex) => {
    const raw = hex.slice(1);
    const full = raw.length === 3 ? [...raw].map((c) => c + c).join('') : raw;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  };
  const pale = [];
  for (const [name, svg] of Object.entries({ header: renderHeader(), about: renderAbout() })) {
    for (const m of svg.matchAll(/<tspan[^>]*fill="(#[0-9a-fA-F]{3,6})"/g)) {
      if (luminance(m[1]) > 0.72) pale.push(`${name}: ${m[1]}`);
    }
  }
  assert.deepEqual(pale, [], 'these fills are too light to read on white');
});

test('every panel carries the typeface with it', () => {
  const profile = { contributions: 1, repositories: 1, languages: [{ name: 'Shell', color: '#89e051', size: 1 }] };
  for (const [name, svg] of Object.entries({
    header: renderHeader(), about: renderAbout(), stats: renderStats(profile), stack: renderStack(),
  })) {
    assert.match(svg, /@font-face/, `${name} would fall back to whatever the viewer has`);
    assert.match(svg, /font-family:JetBrains Mono|'JetBrains Mono'/, `${name} does not ask for the face`);
  }
});

test('the prompt line is a slice of the window, so it seams into the panels', () => {
  const svg = renderPromptStrip('ls ./projects');
  assert.match(svg, /<path class="frame"[^>]*fill="var\(--card\)"/, 'the command floats on the page again');
  assert.match(svg, /fill="var\(--fg\)"/, 'the command would vanish on a light page');
});

test('only the header wears window chrome; the rest are output', () => {
  const profile = { contributions: 1, repositories: 1, languages: [{ name: 'Shell', color: '#89e051', size: 1 }] };
  const calendar = Array.from({ length: 53 }, () => Array.from({ length: 7 }, () => ({ date: 'x', count: 1 })));
  assert.match(renderHeader(), /class="light"/, 'the session has to start somewhere');
  for (const [name, svg] of Object.entries({
    about: renderAbout(), stats: renderStats(profile), stack: renderStack(), graph: renderGraph(calendar),
  })) {
    assert.ok(!svg.includes('class="light"'), `${name} still opens its own window`);
    assert.ok(!svg.includes('class="title"'), `${name} still repeats the window title`);
  }
});

test('a panel no longer states its own command; the prompt line above it does', () => {
  const calendar = Array.from({ length: 53 }, () => Array.from({ length: 7 }, () => ({ date: 'x', count: 1 })));
  assert.ok(!renderGraph(calendar).includes('git log --graph'));
  assert.ok(!renderStack().includes('cat stack.txt'));
});

test('a prompt line can carry a note on its right', () => {
  const svg = renderPromptStrip('cat stack.txt', '71 tools');
  assert.match(svg, />71 tools</);
  assert.match(svg, /text-anchor="end"/, 'the note has to sit at the right edge');
});

test('every prompt line is the full window width, indented like the panels', () => {
  // The drawer used to shrink this strip to buy back a <summary> indent. There
  // is no drawer now, so every command starts on the one content edge.
  for (const command of ['ls ./projects', 'cat stack.txt', 'gh stats']) {
    const svg = renderPromptStrip(command);
    assert.match(svg, new RegExp(`<svg[^>]*width="${PANEL_W}"`), `${command} is off the grid`);
  }
});
