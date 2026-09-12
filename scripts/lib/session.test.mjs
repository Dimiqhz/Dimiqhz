import test from 'node:test';
import assert from 'node:assert/strict';

import { CURSOR_AT, HEADER_END, SESSION, TYPE_DUR, cueOf } from './session.mjs';
import { renderBottom, renderHeader, renderPromptStrip } from './assets.mjs';

const delays = (svg) => [...svg.matchAll(/animation:\w+ [\d.]+s steps\(\d+\) ([\d.]+)s/g)].map((m) => Number(m[1]));
const ends = (svg) => [...svg.matchAll(/animation:\w+ ([\d.]+)s steps\(\d+\) ([\d.]+)s/g)]
  .map((m) => Number(m[1]) + Number(m[2]));

test('the header finishes typing before the first command below it starts', () => {
  assert.ok(Math.max(...ends(renderHeader())) <= HEADER_END, 'the header is still typing when the next command begins');
  assert.ok(cueOf(SESSION[0].name) >= HEADER_END, 'the first command cuts the header off');
});

test('each command waits for the one above it to finish', () => {
  const cues = SESSION.map((c) => cueOf(c.name));
  for (let i = 1; i < cues.length; i += 1) {
    assert.ok(cues[i] >= cues[i - 1] + TYPE_DUR, `${SESSION[i].name} starts before ${SESSION[i - 1].name} has finished`);
  }
});

test('every command line types itself', () => {
  for (const { name, command } of SESSION) {
    const svg = renderPromptStrip(command, null, { at: cueOf(name) });
    assert.deepEqual(delays(svg), [cueOf(name)], `${command} does not type at its turn`);
    assert.match(svg, /steps\(\d+\)/, `${command} appears all at once`);
  }
});

test('a still render shows every command in full', () => {
  // The clip is authored at full width and the animation only takes it away, so
  // a viewer who asked for no motion — or any renderer that ignores CSS — sees
  // the finished session rather than an empty window.
  for (const { name, command } of SESSION) {
    const svg = renderPromptStrip(command, null, { at: cueOf(name) });
    const authored = Number(svg.match(/<clipPath[^>]*><rect[^>]*width="(\d+)"/)[1]);
    const settles = Number(svg.match(/to\{width:(\d+)px\}/)[1]);
    assert.equal(authored, settles, `${command} would stay clipped after it has typed`);
  }
  assert.match(renderPromptStrip('ls', null, { at: 5 }), /@media \(prefers-reduced-motion: no-preference\)/);
});

test('a command with no cue is drawn plainly, with nothing to animate', () => {
  const svg = renderPromptStrip('ls ./projects');
  assert.ok(!svg.includes('animation:'), 'an uncued command still animates');
  assert.ok(!svg.includes('<clipPath'), 'an uncued command is clipped for no reason');
});

test('the cursor starts blinking only once the last command has typed', () => {
  const last = cueOf(SESSION[SESSION.length - 1].name) + TYPE_DUR;
  assert.ok(CURSOR_AT >= last, 'the prompt blinks while the session is still running');
  assert.match(renderBottom(), new RegExp(`step-end ${CURSOR_AT}s infinite`));
});

test('the whole session is over inside ten seconds', () => {
  assert.ok(CURSOR_AT <= 10, `the last command lands at ${CURSOR_AT}s, which is a long wait`);
});
