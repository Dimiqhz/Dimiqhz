import test from 'node:test';
import assert from 'node:assert/strict';

import { renderAbout, renderDivider, renderHeader, renderProjectCard, renderPromptStrip, renderStack, renderStats } from './assets.mjs';
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

test('the divider is drawn on the shared grid width', () => {
  assert.match(renderDivider(), new RegExp(`<svg[^>]*width="${PANEL_W}"`));
});

test('the divider is a rule, not a third window', () => {
  const svg = renderDivider();
  assert.ok(!svg.includes('#ff5f57'), 'the divider grew window chrome');
  assert.ok(!svg.includes('<text'), 'a rule carries no text');
});

test('the prompt strip carries its own background', () => {

  assert.match(renderPromptStrip('ls ./projects'), /<rect[^>]*fill="var\(--bg\)"/);
});

test('every asset adapts to a light page', () => {
  const profile = { contributions: 1, repositories: 1, languages: [{ name: 'Shell', color: '#89e051', size: 1 }] };
  const assets = {
    header: renderHeader(),
    about: renderAbout(),
    stats: renderStats(profile),
    stack: renderStack(),
    divider: renderDivider(),
    prompt: renderPromptStrip('ls'),
    card: renderProjectCard({ name: 'a', description: 'b', language: 'Shell' }, 440),
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
