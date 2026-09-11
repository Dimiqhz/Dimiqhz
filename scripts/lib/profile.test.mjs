import test from 'node:test';
import assert from 'node:assert/strict';

import { toProfile } from './github.mjs';

const repo = (name, languages) => ({
  name,
  url: `https://github.com/Dimiqhz/${name}`,
  description: 'd',
  stargazerCount: 0,
  primaryLanguage: { name: 'Python', color: '#3572A5' },
  languages: { edges: languages.map(([n, size, color]) => ({ size, node: { name: n, color } })) },
});

const user = (nodes, totalCount = nodes.length) => ({
  login: 'Dimiqhz',
  contributionsCollection: {
    totalCommitContributions: 1344,
    contributionCalendar: { weeks: [] },
  },
  repositories: { totalCount, nodes },
});

test('toProfile adds up one language across several repositories', () => {
  const profile = toProfile(user([
    repo('a', [['Shell', 80, '#89e051']]),
    repo('b', [['Shell', 20, '#89e051'], ['Python', 100, '#3572A5']]),
  ]), []);
  assert.equal(profile.languages.find((l) => l.name === 'Shell').size, 100);
});

test('toProfile leaves markup and build files out of the language split', () => {
  const profile = toProfile(user([
    repo('a', [['HTML', 50, '#e34c26'], ['Batchfile', 30, '#C1F12E'], ['Python', 20, '#3572A5']]),
  ]), []);
  assert.deepEqual(profile.languages.map((l) => l.name), ['Python']);
});

test('toProfile keeps shell, which is written not generated', () => {
  const profile = toProfile(user([repo('a', [['Shell', 10, '#89e051']])]), []);
  assert.deepEqual(profile.languages.map((l) => l.name), ['Shell']);
});

test('toProfile refuses a truncated repository page rather than under-reporting', () => {
  assert.throws(() => toProfile(user([], 140), []), /140/);
});

test('toProfile features the repositories listed in the code, in that order', () => {
  const profile = toProfile(user([
    repo('SQL2Excel', []), repo('Other', []), repo('Excel2SQL', []),
  ]), ['Excel2SQL', 'SQL2Excel']);
  assert.deepEqual(profile.projects.map((p) => p.name), ['Excel2SQL', 'SQL2Excel']);
});

test('toProfile refuses a featured repository it cannot find', () => {
  assert.throws(
    () => toProfile(user([repo('Excel2SQL', [])]), ['Excel2SQL', 'Renamed']),
    /Renamed/,
  );
});

test('toProfile carries the language colour of each featured repository', () => {
  const profile = toProfile(user([repo('Excel2SQL', [])]), ['Excel2SQL']);
  assert.equal(profile.projects[0].languageColor, '#3572A5');
});

test('the headline number comes from the calendar, not from a token-dependent field', () => {
  // totalCommitContributions returns almost nothing to the Actions token: it
  // read 1,347 locally and 10 in CI. The calendar is identical for both.
  const weeks = [{ contributionDays: [{ date: 'a', contributionCount: 3 }, { date: 'b', contributionCount: 4 }] }];
  const profile = toProfile({
    login: 'Dimiqhz',
    contributionsCollection: { totalCommitContributions: 10, contributionCalendar: { weeks } },
    repositories: { totalCount: 0, nodes: [] },
  }, []);
  assert.equal(profile.contributions, 7);
});
