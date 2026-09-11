import test from 'node:test';
import assert from 'node:assert/strict';

import { replaceBlock } from './readme.mjs';

const doc = ['# Profile', '', '<!-- projects:start -->', 'old content', '<!-- projects:end -->', '', 'tail'].join('\n');

test('replaceBlock swaps the body between the markers', () => {
  const out = replaceBlock(doc, 'projects', 'new content');
  assert.match(out, /<!-- projects:start -->\nnew content\n<!-- projects:end -->/);
});

test('replaceBlock leaves the surrounding document untouched', () => {
  const out = replaceBlock(doc, 'projects', 'new content');
  assert.match(out, /^# Profile/);
  assert.match(out, /tail$/);
});

test('replaceBlock applied twice produces the same document', () => {
  const once = replaceBlock(doc, 'projects', 'new content');
  assert.equal(replaceBlock(once, 'projects', 'new content'), once);
});

test('replaceBlock refuses to silently do nothing when the markers are missing', () => {
  assert.throws(() => replaceBlock('# Profile\n', 'projects', 'x'), /projects/);
});
