import test from 'node:test';
import assert from 'node:assert/strict';

import { PANEL_W, projectMarkup, stackMarkup } from './markup.mjs';
import { STACK_GROUPS } from './stack-data.mjs';

const project = (name) => ({ name, url: `https://github.com/Dimiqhz/${name}`, description: 'A tool', language: 'Python' });


test('every project is its own linked cell', () => {
  const html = projectMarkup([project('One'), project('Two'), project('Three'), project('Four')]);
  const linked = [...html.matchAll(/<a href="([^"]+)"><img [^>]*width="50%"/g)].map((m) => m[1]);
  assert.equal(linked.length, 4, 'expected one link per project');
  assert.match(linked[0], /github\.com\/Dimiqhz\/One$/);
});

test('two cells at half the column fill one row, whatever the column is', () => {
  // The README column is 846px at 1440 but 642px at 1100, so a cell measured in
  // pixels would stop fitting two to a row. A percentage always splits in half.
  const html = projectMarkup([project('One'), project('Two')]);
  for (const img of [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0]).slice(1)) {
    assert.match(img, /width="50%"/, `${img} is measured in pixels`);
  }
});

test('nothing in the block floats; every image is top-aligned instead', () => {
  // align="left" floats the image and GitHub then keeps 20px to its right,
  // which would open a gap the panel background cannot cross. align="top"
  // carries no such rule and stacks flush in both directions.
  const html = projectMarkup([project('One'), project('Two')]);
  for (const img of [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0])) {
    assert.match(img, /align="top"/, `${img} would open a seam`);
    assert.ok(!img.includes('align="left"'));
  }
});

test('the cells of a row are joined with nothing between them', () => {
  // Whitespace between two inline images renders as a space and pushes the
  // second one onto a line of its own.
  assert.ok(!/<\/a>\s+<a/.test(projectMarkup([project('One'), project('Two')])));
});

test('projectMarkup describes each cell for screen readers', () => {
  assert.match(projectMarkup([project('One')]), /alt="One[^"]*"/);
});

test('projectMarkup refuses a link that is not http or https', () => {
  assert.throws(
    () => projectMarkup([{ name: 'x', url: 'javascript:alert(1)', description: 'd' }]),
    /javascript:/,
  );
});

test('the stack section states how much is inside it', () => {
  const html = stackMarkup();
  const total = STACK_GROUPS.reduce((n, [, items]) => n + items.length, 0);
  assert.match(html, new RegExp(`${total} tools`), 'the count is missing or stale');
});

test('the stack section is two slices of the window, not a drawer', () => {
  const html = stackMarkup();
  assert.ok(!html.includes('<details'), 'a drawer would cut the window open');
  assert.ok(!html.includes('<summary'), 'a drawer would cut the window open');
  assert.match(html, /prompt-stack\.svg[\s\S]*panels\/stack\.svg/, 'the command should come before its output');
});
