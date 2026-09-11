import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('./github.mjs', import.meta.url), 'utf8');

test('the query asks only for public repositories', () => {
  assert.match(source, /privacy: PUBLIC/);
});

test('the query pins its own contribution window', () => {
  assert.match(source, /contributionsCollection\(from:/);
});
