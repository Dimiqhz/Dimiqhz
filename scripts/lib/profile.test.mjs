import test from 'node:test';
import assert from 'node:assert/strict';

import { toProfile } from './github.mjs';

const user = (over = {}) => ({
  contributionsCollection: { totalCommitContributions: 1344 },
  repositories: {
    totalCount: 2,
    nodes: [
      { languages: { edges: [{ size: 80, node: { name: 'Shell', color: '#89e051' } }] } },
      { languages: { edges: [{ size: 20, node: { name: 'Shell', color: '#89e051' } }, { size: 100, node: { name: 'Python', color: '#3572A5' } }] } },
    ],
  },
  pinnedItems: { nodes: [] },
  ...over,
});

test('toProfile adds up one language across several repositories', () => {
  const { languages } = toProfile(user());
  assert.deepEqual(languages.find((l) => l.name === 'Shell').size, 100);
});

test('toProfile refuses a truncated repository page rather than under-reporting', () => {
  const truncated = user({ repositories: { totalCount: 140, nodes: [] } });
  assert.throws(() => toProfile(truncated), /140/);
});

test('toProfile reports no projects when nothing is pinned', () => {
  assert.deepEqual(toProfile(user()).projects, []);
});

test('toProfile leaves markup and build files out of the language split', () => {
  const withMarkup = user({
    repositories: {
      totalCount: 1,
      nodes: [{ languages: { edges: [
        { size: 50, node: { name: 'HTML', color: '#e34c26' } },
        { size: 30, node: { name: 'Batchfile', color: '#C1F12E' } },
        { size: 20, node: { name: 'Python', color: '#3572A5' } },
      ] } }],
    },
  });
  assert.deepEqual(toProfile(withMarkup).languages.map((l) => l.name), ['Python']);
});

test('toProfile keeps shell, which is written not generated', () => {
  const withShell = user({
    repositories: { totalCount: 1, nodes: [{ languages: { edges: [
      { size: 10, node: { name: 'Shell', color: '#89e051' } },
    ] } }] },
  });
  assert.deepEqual(toProfile(withShell).languages.map((l) => l.name), ['Shell']);
});
