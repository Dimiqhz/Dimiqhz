import test from 'node:test';
import assert from 'node:assert/strict';

import { CELL_W, renderProjectCell } from './assets.mjs';
import { IMAGE_W, PANEL_W } from './markup.mjs';

const one = { name: 'Excel2SQL', description: 'A tool for things', language: 'Python', languageColor: '#3572A5', stars: 3 };
const two = { name: 'SQL2Excel', description: 'The other way round', language: 'C++', languageColor: '#f34b7d', stars: 0 };

const size = (svg) => {
  const m = svg.match(/<svg[^>]*width="(\d+)" height="(\d+)"/);
  return { width: Number(m[1]), height: Number(m[2]) };
};
const shift = (svg) => Number(svg.match(/<g transform="translate\((-?\d+) 0\)"/)[1]);
const edge = (svg) => svg.match(/<path class="edge"[^>]*\sd="([^"]+)"/)[1];

test('a cell is half the canvas, so two of them at 50% fill the column exactly', () => {
  assert.equal(CELL_W * 2, IMAGE_W);
  for (const side of ['left', 'right']) {
    assert.equal(size(renderProjectCell(one, side)).width, CELL_W, `the ${side} cell is the wrong width`);
  }
});

test('the two cells of a row are the same height so the grid does not step', () => {
  assert.equal(size(renderProjectCell(one, 'left')).height, size(renderProjectCell(two, 'right')).height);
});

test('each cell carries the panel edge on its own outer side and nothing on the seam', () => {
  assert.equal(edge(renderProjectCell(one, 'left')), `M.5 0V${size(renderProjectCell(one, 'left')).height}`);
  assert.equal(edge(renderProjectCell(two, 'right')), `M${PANEL_W - 0.5} 0V${size(renderProjectCell(two, 'right')).height}`);
});

test('the right cell is drawn in the same panel coordinates, shifted by half a canvas', () => {
  assert.equal(shift(renderProjectCell(one, 'left')) - shift(renderProjectCell(two, 'right')), CELL_W);
});

test('a cell keeps its description, wrapped rather than run out of the column', () => {
  const svg = renderProjectCell({ ...one, description: 'one two three four five six seven eight nine ten eleven twelve' }, 'left');
  const lines = [...svg.matchAll(/font-size="13"[^>]*>([^<]+)</g)].map((m) => m[1]);
  assert.ok(lines.length >= 2, 'the description was not wrapped');
  for (const line of lines) assert.ok(line.length * 7.8 <= PANEL_W / 2 - 42, `"${line}" runs past its column`);
});

test('a description too long for the cell is cut with an ellipsis', () => {
  const long = 'An intuitive tool for converting Excel spreadsheets into SQL scripts, designed to streamline every migration anyone could ever want to run anywhere at all';
  assert.match(renderProjectCell({ ...one, description: long }, 'left'), /…/);
});

test('a cell marks its language colour and states its stars only when it has any', () => {
  assert.match(renderProjectCell(one, 'left'), /<circle[^>]*fill="#3572A5"/);
  assert.match(renderProjectCell(one, 'left'), /★ 3/);
  assert.ok(!renderProjectCell(two, 'right').includes('★'));
});

test('a cell escapes a repository name that contains markup', () => {
  assert.ok(!/<script[ >]/.test(renderProjectCell({ ...one, name: '<script>a()</script>' }, 'left')));
});
