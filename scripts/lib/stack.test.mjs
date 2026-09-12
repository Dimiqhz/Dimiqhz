import test from 'node:test';
import assert from 'node:assert/strict';

import { renderStack } from './assets.mjs';
import { IMAGE_W, PANEL_W } from './markup.mjs';
import { STACK_GROUPS } from './stack-data.mjs';

const chipsOf = (svg) => [...svg.matchAll(/<text x="(\d+)" y="\d+" class="chip"[^>]*>([^<]+)<\/text>/g)]
  .map((m) => ({ x: Number(m[1]), name: m[2] }));

test('the stack panel is drawn on the shared grid width', () => {
  assert.match(renderStack(), new RegExp(`<svg[^>]*width="${IMAGE_W}"`));
});

test('no chip runs past the panel padding', () => {
  const overflowing = chipsOf(renderStack())
    .filter((c) => c.x + c.name.length * 7.2 > PANEL_W - 36);
  assert.deepEqual(overflowing, [], 'these chips overflow the panel');
});

test('the stack panel keeps every tool that was in the icon strips', () => {
  const svg = renderStack();
  for (const name of ['TypeScript', 'Bash', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis',
    'Next.js', 'FastAPI', 'TensorFlow', 'Figma', 'Blender', 'Terraform', 'Kafka']) {
    assert.ok(svg.includes(name), `the stack lost ${name}`);
  }
});

test('the stack panel is tall enough for the rows it laid out', () => {
  const svg = renderStack();
  const height = Number(svg.match(/<svg[^>]*height="(\d+)"/)[1]);
  const lowestChip = Math.max(...[...svg.matchAll(/<text x="\d+" y="(\d+)" class="chip"/g)].map((m) => Number(m[1])));
  assert.ok(height - lowestChip >= 20, `only ${height - lowestChip}px below the last row`);
});

test('the stack panel produces parseable markup', () => {
  assert.ok(!/&(?!(amp|lt|gt|quot|apos|#\d+);)/.test(renderStack()));
});

test('the stack panel leaves no undeclared xlink namespace behind', () => {
  assert.ok(!renderStack().includes('xlink:'), 'an xlink attribute survived vendoring');
});

test('no two icons share an id inside the panel', () => {
  const ids = [...renderStack().matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'duplicate ids across icons');
});

test('icons that carry no colour of their own inherit a visible one', () => {
  assert.match(renderStack(), /<g fill="var\(--dim\)" transform=/);
});

test('related tools sit next to each other', () => {
  const families = {
    JetBrains: ['IntelliJ IDEA', 'WebStorm', 'PyCharm', 'GoLand', 'CLion', 'Rider',
      'PhpStorm', 'DataGrip', 'Android Studio', 'Qodana'],
    Adobe: ['Photoshop', 'Illustrator', 'After Effects', 'Premiere'],
    Microsoft: ['Visual Studio', 'VS Code'],
    HashiCorp: ['Vault', 'Consul', 'Nomad'],
    relational: ['PostgreSQL', 'MySQL'],
    queues: ['Kafka', 'RabbitMQ'],
    versionControl: ['Git', 'GitHub', 'GitLab'],
    containers: ['Docker', 'Podman'],
  };
  const flat = STACK_GROUPS.flatMap(([, items]) => items);
  for (const [family, members] of Object.entries(families)) {
    const positions = members.map((m) => flat.indexOf(m)).sort((a, b) => a - b);
    assert.ok(positions[0] >= 0, `${family} is missing from the stack`);
    const contiguous = positions.every((p, i) => i === 0 || p === positions[i - 1] + 1);
    assert.ok(contiguous, `${family} is scattered: ${positions.join(', ')}`);
  }
});

test('the games engine is not filed under tools', () => {
  assert.ok(!STACK_GROUPS.flatMap(([, items]) => items).includes('Unreal'));
});

test('the group of frameworks and libraries says so', () => {
  assert.ok(STACK_GROUPS.some(([label]) => label === 'FRAMEWORKS & LIBRARIES'));
});

test('no group label runs into the chip column', () => {
  const svg = renderStack();
  const chipsLeft = Math.min(...[...svg.matchAll(/<g fill="#[0-9a-f]{6}" transform="translate\((\d+) /g)]
    .map((m) => Number(m[1])));
  const overflowing = [...svg.matchAll(/<text x="(\d+)" y="\d+" class="glabel">([^<]+)<\/text>/g)]
    .map((m) => [Number(m[1]), m[2].replace(/&amp;/g, '&')])
    .filter(([x, text]) => x + text.length * 8.4 > chipsLeft - 8)
    .map(([, text]) => text);
  assert.deepEqual(overflowing, [], 'these labels collide with the chips');
});

