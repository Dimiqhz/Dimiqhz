import test from 'node:test';
import assert from 'node:assert/strict';

import { TEXT_X, renderAbout, renderGraph, renderHeader, renderProjectCard, renderStack, renderStats } from './assets.mjs';

const profile = { contributions: 1, repositories: 1, languages: [{ name: 'Shell', color: '#89e051', size: 1 }] };
const calendar = Array.from({ length: 53 }, () => Array.from({ length: 7 }, () => ({ date: 'x', count: 1 })));

const panels = () => ({
  header: renderHeader(),
  about: renderAbout(),
  stats: renderStats(profile),
  stack: renderStack(),
  graph: renderGraph(calendar),
  project: renderProjectCard({ name: 'One', language: 'Shell' }, 205, { shape: 'left', command: 'ls' }),
});

// Window chrome hugs the corner; it is not content and is tagged so.
const contentEdges = (svg) => [...svg.matchAll(/<(?:text|rect|circle|g)\b([^>]*)>/g)]
  .filter((m) => !/class="(?:frame|light|title)"/.test(m[1]))
  .map((m) => m[1].match(/\b(?:x|cx)="(\d+)"/))
  .filter(Boolean)
  .map((m) => Number(m[1]));

test('every panel indents its content to the same left edge', () => {
  for (const [name, svg] of Object.entries(panels())) {
    assert.equal(Math.min(...contentEdges(svg)), TEXT_X, `${name} starts its content elsewhere`);
  }
});
