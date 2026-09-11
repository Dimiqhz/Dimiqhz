import test from 'node:test';
import assert from 'node:assert/strict';

import { PANEL_W, projectMarkup, stackMarkup } from './markup.mjs';
import { STACK_GROUPS } from './stack-data.mjs';

const project = (name) => ({ name, url: `https://github.com/Dimiqhz/${name}`, description: 'A tool', language: 'Python' });

test('every slice of the projects block floats, so the window has no seam', () => {
  // An inline image sits on a text baseline and leaves 5px of page showing
  // under it; align="left" takes it out of the line box entirely.
  const markup = projectMarkup([project('One'), project('Two')]);
  const images = [...markup.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
  assert.equal(images.length, 3, 'expected the command line and one row per project');
  for (const img of images) assert.match(img, /align="left"/, `${img} would cut the window`);
});



test('projectMarkup links every card to its repository', () => {
  const html = projectMarkup([project('One')]);
  assert.match(html, /<a href="https:\/\/github\.com\/Dimiqhz\/One">/);
});

test('projectMarkup describes each card for screen readers', () => {
  assert.match(projectMarkup([project('One')]), /alt="One — A tool"/);
});


test('projectMarkup emits nothing at all when nothing is pinned', () => {
  assert.equal(projectMarkup([]), '');
});

test('stackMarkup describes the panel from the same list the panel is drawn from', () => {
  const html = stackMarkup();
  assert.match(html, /src="dist\/panels\/stack\.svg"/);
  for (const [label] of STACK_GROUPS) {
    const spoken = label.toLowerCase().replace('&', '&amp;');
    assert.ok(html.includes(spoken), `alt text omits ${label}`);
  }
  assert.ok(!html.includes('Unreal'), 'alt text still lists a removed tool');
});

test('every project card is a link; only the prompt line is not', () => {
  const html = projectMarkup([project('One'), project('Two')]);
  const linked = [...html.matchAll(/<a href="[^"]*"><img/g)].length;
  const total = [...html.matchAll(/<img/g)].length;
  assert.equal(total - linked, 1, 'exactly one unlinked image is expected: the prompt line');
  assert.match(html, /prompt-projects\.svg/);
});

test('projectMarkup refuses a link that is not http or https', () => {
  // GitHub's sanitiser strips javascript: itself, so this is defence in depth —
  // the generator should not be the thing that emits it in the first place.
  assert.throws(
    () => projectMarkup([{ name: 'x', url: 'javascript:alert(1)', description: 'd' }]),
    /javascript:/,
  );
});

test('projectMarkup accepts an ordinary repository link', () => {
  assert.match(projectMarkup([project('One')]), /href="https:\/\/github\.com\/Dimiqhz\/One"/);
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
