import test from 'node:test';
import assert from 'node:assert/strict';

import { renderProjectPair } from './assets.mjs';
import { IMAGE_W, PANEL_W } from './markup.mjs';

const one = { name: 'Excel2SQL', description: 'A tool for things', language: 'Python', languageColor: '#3572A5', stars: 3 };
const two = { name: 'SQL2Excel', description: 'The other way round', language: 'C++', languageColor: '#f34b7d', stars: 0 };

const xs = (svg, re) => [...svg.matchAll(re)].map((m) => Number(m[1]));
const height = (svg) => Number(svg.match(/<svg[^>]*height="(\d+)"/)[1]);

test('a pair is one image, because two floated ones can never close up', () => {
  // GitHub wedges 20px of padding to the right of every align="left" image, so
  // a column gap drawn between two of them would cut the panel open.
  assert.match(renderProjectPair([one, two]), new RegExp(`<svg[^>]*width="${IMAGE_W}"`));
});

test('the two columns are the same width and sit inside the panel padding', () => {
  const svg = renderProjectPair([one, two]);
  const names = xs(svg, /<text x="(\d+)"[^>]*font-size="15"/g);
  assert.equal(names.length, 2, 'expected one name per column');
  const [left, right] = names;
  assert.equal(left, 28, 'the left column is off the content edge');
  assert.equal(right - left, PANEL_W / 2 - 14, 'the columns are not evenly split');
  assert.ok(right + (PANEL_W / 2 - 42) <= PANEL_W - 28, 'the right column runs past the padding');
});

test('a lone project keeps the left column and leaves the right one empty', () => {
  const svg = renderProjectPair([one]);
  assert.equal(xs(svg, /<text x="(\d+)"[^>]*font-size="15"/g).length, 1);
  assert.equal(height(svg), height(renderProjectPair([one, two])), 'a short row would step the block');
});

test('a description too long for its column is cut with an ellipsis', () => {
  const long = 'An intuitive tool for converting Excel spreadsheets into SQL scripts, designed to streamline every migration anyone could ever want to run anywhere';
  assert.match(renderProjectPair([{ ...one, description: long }]), /…/);
});

test('a description wraps rather than running out of the column', () => {
  const svg = renderProjectPair([{ ...one, description: 'one two three four five six seven eight nine ten eleven twelve' }]);
  const lines = [...svg.matchAll(/font-size="13"[^>]*>([^<]+)</g)].map((m) => m[1]);
  assert.ok(lines.length >= 2, 'the description was not wrapped');
  for (const line of lines) {
    assert.ok(line.length * 7.8 <= PANEL_W / 2 - 42, `"${line}" runs past its column`);
  }
});

test('each column marks its own language colour', () => {
  const svg = renderProjectPair([one, two]);
  assert.match(svg, /<circle[^>]*fill="#3572A5"/);
  assert.match(svg, /<circle[^>]*fill="#f34b7d"/);
});

test('a project states its stars, and says nothing when it has none', () => {
  const svg = renderProjectPair([one, two]);
  assert.equal([...svg.matchAll(/★/g)].length, 1, 'only the starred project should show a count');
});

test('a pair escapes a repository name that contains markup', () => {
  assert.ok(!/<script[ >]/.test(renderProjectPair([{ ...one, name: '<script>a()</script>' }])));
});
