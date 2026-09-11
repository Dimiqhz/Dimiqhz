import test from 'node:test';
import assert from 'node:assert/strict';

import { clampLines, escapeAttr, escapeXml, groupThousands, lighten, share, truncate, wrapText } from './format.mjs';

test('escapeXml escapes the ampersand before the angle brackets', () => {
  assert.equal(escapeXml('Tools & <utils>'), 'Tools &amp; &lt;utils&gt;');
});

test('escapeXml renders a missing repository description as an empty string', () => {
  assert.equal(escapeXml(undefined), '');
});

test('groupThousands separates every three digits with a comma', () => {
  assert.equal(groupThousands(1344), '1,344');
  assert.equal(groupThousands(1234567), '1,234,567');
});

test('groupThousands leaves a number below a thousand alone', () => {
  assert.equal(groupThousands(26), '26');
});

test('wrapText breaks a sentence on word boundaries', () => {
  assert.deepEqual(wrapText('one two three four', 9), ['one two', 'three', 'four']);
});

test('wrapText keeps a word longer than the limit on its own line', () => {
  assert.deepEqual(wrapText('supercalifragilistic', 5), ['supercalifragilistic']);
});

test('clampLines marks a description that did not fit', () => {
  assert.deepEqual(clampLines(['one two', 'three four', 'five'], 2), ['one two', 'three…']);
});

test('clampLines leaves a description that fits untouched', () => {
  assert.deepEqual(clampLines(['one two', 'three'], 2), ['one two', 'three']);
});

test('share formats a language slice to one decimal place', () => {
  assert.equal(share(842, 1000), '84.2%');
});

test('share reports zero rather than NaN when nothing was measured', () => {
  assert.equal(share(5, 0), '0.0%');
});

test('escapeAttr escapes the quote that would end an attribute early', () => {
  assert.equal(escapeAttr('say "hi" & <go>'), 'say &quot;hi&quot; &amp; &lt;go&gt;');
});

test('lighten mixes a colour towards white by the given amount', () => {
  assert.equal(lighten('#3fb950', 0.4), '#8cd596');
});

test('lighten leaves a colour alone at zero', () => {
  assert.equal(lighten('#3fb950', 0), '#3fb950');
});

test('truncate marks a name it had to cut', () => {
  assert.equal(truncate('Shannon-Fano-Compression', 12), 'Shannon-Fan…');
});

test('truncate leaves a name that fits alone', () => {
  assert.equal(truncate('Excel2SQL', 12), 'Excel2SQL');
});
