import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const readme = readFileSync(new URL('../../README.md', import.meta.url), 'utf8');

test('every asset the README points at actually exists', () => {
  const missing = [...readme.matchAll(/src="(dist\/[^"]+)"/g)]
    .map((m) => m[1])
    .filter((file) => !existsSync(new URL(`../../${file}`, import.meta.url)));
  assert.deepEqual(missing, [], 'these files are referenced but not generated');
});

test('every generated asset is referenced by the README', () => {
  const referenced = new Set([...readme.matchAll(/src="(dist\/[^"]+)"/g)].map((m) => m[1]));
  const generated = ['dist/panels/header.svg', 'dist/panels/about.svg', 'dist/panels/stats.svg',
    'dist/panels/graph.svg', 'dist/panels/stack.svg',
    'dist/ui/prompt-about.svg', 'dist/ui/prompt-projects.svg', 'dist/ui/prompt-stats.svg',
    'dist/ui/prompt-graph.svg', 'dist/ui/prompt-stack.svg'];
  assert.deepEqual(generated.filter((f) => !referenced.has(f)), [], 'these assets are built but never shown');
});
