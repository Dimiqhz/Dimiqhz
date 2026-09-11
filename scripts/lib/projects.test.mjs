import test from 'node:test';
import assert from 'node:assert/strict';

import { renderProjectCard } from './assets.mjs';
import { cardShape } from './markup.mjs';

const one = { name: 'Excel2SQL', description: 'A tool', language: 'Python', languageColor: '#3572A5' };

test('a pair of projects is two halves of one window', () => {
  assert.equal(cardShape(0, 2), 'left');
  assert.equal(cardShape(1, 2), 'right');
});

test('a lone trailing project is a window of its own', () => {
  assert.equal(cardShape(2, 3), 'full');
});

test('the left half rounds only its left corners', () => {
  const svg = renderProjectCard(one, 440, { shape: 'left' });
  assert.ok(!/H4\d\d\.5 A12/.test(svg), 'the seam edge is rounded');
  assert.match(svg, /A12 12 0 0 0/, 'the left corners are not rounded');
});

test('only the first half carries the command', () => {
  assert.match(renderProjectCard(one, 440, { shape: 'left', command: 'ls ./projects' }), />ls \.\/projects</);
  assert.ok(!renderProjectCard(one, 440, { shape: 'right' }).includes('ls ./projects'));
});

test('both halves are the same height so the window does not step', () => {
  const left = renderProjectCard(one, 440, { shape: 'left', command: 'ls ./projects' });
  const right = renderProjectCard(one, 440, { shape: 'right' });
  const height = (svg) => svg.match(/<svg[^>]*height="(\d+)"/)[1];
  assert.equal(height(left), height(right));
});
