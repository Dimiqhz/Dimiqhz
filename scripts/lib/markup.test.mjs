import test from 'node:test';
import assert from 'node:assert/strict';

import { PANEL_W, projectMarkup, stackMarkup } from './markup.mjs';
import { STACK_GROUPS } from './stack-data.mjs';

const project = (name) => ({ name, url: `https://github.com/Dimiqhz/${name}`, description: 'A tool', language: 'Python' });




test('projectMarkup lays the projects out two to a row', () => {
  const html = projectMarkup([project('One'), project('Two'), project('Three')]);
  const images = [...html.matchAll(/<img [^>]*src="dist\/projects\/(\d)\.svg"/g)].map((m) => m[1]);
  assert.deepEqual(images, ['1', '2'], 'three projects should fill one full row and one half');
});

test('a row carries no link, because one anchor cannot point at two repositories', () => {
  // Two floated images can never close up — GitHub keeps 20px to the right of
  // every one of them — so a pair shares a single image and gives up its links.
  assert.ok(!projectMarkup([project('One'), project('Two')]).includes('<a '));
});

test('every slice of the projects block floats, so the block has no seam', () => {
  const images = [...projectMarkup([project('One'), project('Two')]).matchAll(/<img [^>]*>/g)].map((m) => m[0]);
  assert.equal(images.length, 2, 'expected the command line and one row');
  for (const img of images) assert.match(img, /align="left"/, `${img} would cut the block`);
});

test('projectMarkup describes both projects of a row for screen readers', () => {
  const html = projectMarkup([project('One'), project('Two')]);
  assert.match(html, /alt="One[^"]*Two[^"]*"/);
});

test('the stack section states how much is inside it', () => {
  const html = stackMarkup();
  const total = STACK_GROUPS.reduce((n, [, items]) => n + items.length, 0);
  assert.match(html, new RegExp(`${total} tools`), 'the count is missing or stale');
});

test('the stack section is two slices of the window, not a drawer', () => {
  // <details> puts its disclosure triangle on a line of its own, which opens a
  // 21px band of page background across the middle of the window frame.
  const html = stackMarkup();
  assert.ok(!html.includes('<details'), 'a drawer would cut the window open');
  assert.ok(!html.includes('<summary'), 'a drawer would cut the window open');
  assert.match(html, /prompt-stack\.svg[\s\S]*panels\/stack\.svg/, 'the command should come before its output');
});
