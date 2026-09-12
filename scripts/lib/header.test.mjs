import test from 'node:test';
import assert from 'node:assert/strict';

import { renderHeader } from './assets.mjs';

test('the header window carries the GNOME Terminal title', () => {
  assert.match(renderHeader(), /dimiqhz@github: ~/);
});

test('the header prompt matches the shell named in its title', () => {
  const svg = renderHeader();
  assert.ok(svg.includes('> $ <'), 'bash prompts with $');
  assert.ok(!svg.includes('> % <'), 'the zsh % prompt is gone');
});

test('the title bar is set in a UI face, as a real title bar is', () => {
  assert.match(renderHeader(), /class="title"/);
});

test('the title bar is flat, the way an Adwaita header bar is', () => {
  assert.ok(!renderHeader().includes('linearGradient id="bar"'), 'the macOS gradient is gone');
});

test('the header terminal is the one place uptime and focus are stated', () => {
  const svg = renderHeader();
  assert.match(svg, /uptime/, 'the uptime command is gone');
  assert.match(svg, /focus\.txt/, 'the focus command is gone');
  assert.match(svg, /fill="#3fb950">8 years/, 'the years lost their highlight');
});

test('the animation is gated on the viewer having asked for motion', () => {
  assert.match(renderHeader(), /@media \(prefers-reduced-motion: no-preference\)/);
});

test('only the cursor loops — the typing plays once', () => {
  assert.equal((renderHeader().match(/infinite/g) || []).length, 1,
    'exactly one perpetual animation is allowed: the cursor');
});

test('the typed lines are authored complete, so a still render shows a finished terminal', () => {
  const widths = [...renderHeader().matchAll(/<clipPath[^>]*><rect[^>]*width="(\d+)"/g)].map((m) => Number(m[1]));
  assert.equal(widths.length, 7, 'expected one clip per line');
  assert.ok(widths.every((w) => w === widths[0]), 'a clip was authored short and would cut its line');
});

test('the header states the current role', () => {
  assert.match(renderHeader(), /Senior DevOps/);
});
