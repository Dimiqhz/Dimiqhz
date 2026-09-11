import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('the vendored icon set ships its licence', () => {
  const notice = readFileSync(new URL('../../NOTICE.md', import.meta.url), 'utf8');
  assert.match(notice, /Devicon/);
  assert.match(notice, /MIT/);
  assert.match(notice, /Copyright \(c\) 2015 konpa/);
});

test('the embedded typeface ships its licence', () => {
  const notice = readFileSync(new URL('../../NOTICE.md', import.meta.url), 'utf8');
  assert.match(notice, /JetBrains Mono/);
  assert.match(notice, /SIL OPEN FONT LICENSE/i);
});
