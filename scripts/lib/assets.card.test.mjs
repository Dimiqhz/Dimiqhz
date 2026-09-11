import test from 'node:test';
import assert from 'node:assert/strict';

import { renderAbout, renderProjectCard } from './assets.mjs';

const UNESCAPED = /&(?!(amp|lt|gt|quot|apos|#\d+);)/;

test('renderProjectCard escapes a repository name containing markup', () => {
  const svg = renderProjectCard({ name: 'A & B', description: '<x>', language: 'Python' }, 380);
  assert.ok(!UNESCAPED.test(svg), 'SVG contains an unescaped ampersand');
});




test('renderAbout keeps the contact handle in the panel', () => {
  assert.match(renderAbout(), /DIMIQHZ/);
});

test('renderAbout produces parseable markup', () => {
  assert.ok(!UNESCAPED.test(renderAbout()), 'SVG contains an unescaped ampersand');
});


test('renderAbout states the current role', () => {
  assert.match(renderAbout(), /Senior DevOps/);
});

test('renderAbout lists the operating systems from the profile', () => {
  assert.match(renderAbout(), /Windows/);
});

test('renderAbout keeps every language of the stack', () => {
  const svg = renderAbout();
  for (const language of ['TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'JavaScript', 'Bash']) {
    assert.ok(svg.includes(language), `stack is missing ${language}`);
  }
});

test('renderAbout lists Go as the only language being learned', () => {
  const svg = renderAbout();
  assert.match(svg, /LEARNING/);
  assert.ok(!svg.includes('Rust'), 'Rust is no longer on the learning list');
});

test('the about panel does not repeat what the header terminal already ran', () => {
  const about = renderAbout();
  assert.ok(!about.includes('UPTIME'), 'the header already runs uptime');
  assert.ok(!about.includes('FOCUS'), 'the header already runs cat focus.txt');
});

test('renderAbout draws no decorative colour strip', () => {

  assert.ok(!/width="24" height="8"/.test(renderAbout()), 'the swatch strip is still drawn');
});

test('the about panel is titled the way GNOME Terminal titles a window', () => {

  assert.match(renderAbout(), /dimiqhz@github: ~/);
});

test('the info column keeps a gutter clear of the mark', () => {
  const svg = renderAbout();

  const markRight = Math.max(...[...svg.matchAll(/<rect x="(\d+)" y="\d+" width="(\d+)"/g)]
    .map((m) => Number(m[1]) + Number(m[2])));
  const textLeft = Math.min(...[...svg.matchAll(/<text x="(\d+)"/g)].map((m) => Number(m[1])));
  assert.ok(textLeft - markRight >= 40, `the gutter is only ${textLeft - markRight}px wide`);
});

test('the panel does not repeat what the window title already says', () => {
  const occurrences = (renderAbout().match(/dimiqhz@github/g) || []).length;
  assert.equal(occurrences, 1, 'the handle appears in the title bar and again in the body');
});

test('the mark is centred in the window body', () => {
  const svg = renderAbout();
  const height = Number(svg.match(/<svg[^>]*height="(\d+)"/)[1]);
  const blocks = [...svg.matchAll(/<rect x="\d+" y="(\d+)" width="12"/g)].map((m) => Number(m[1]));
  const markCentre = (Math.min(...blocks) + Math.max(...blocks) + 12) / 2;
  const bodyCentre = (40 + height) / 2;
  assert.ok(Math.abs(markCentre - bodyCentre) <= 1, `mark at ${markCentre}, body centre at ${bodyCentre}`);
});

