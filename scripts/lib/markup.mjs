import { escapeAttr } from './format.mjs';
import { STACK_GROUPS } from './stack-data.mjs';


export const PANEL_W = 820;

export const IMAGE_W = 846;


const floated = (src, alt) => `<img align="left" src="${src}" width="${IMAGE_W}" alt="${escapeAttr(alt)}">`;

export const PAIR_SIZE = 2;

export function projectPairs(projects) {
  const pairs = [];
  for (let i = 0; i < projects.length; i += PAIR_SIZE) pairs.push(projects.slice(i, i + PAIR_SIZE));
  return pairs;
}

export function projectMarkup(projects) {
  if (projects.length === 0) return '';

  const rows = projectPairs(projects)
    .map((pair, i) => {
      const alt = pair
        .map((p) => (p.description ? `${p.name} — ${p.description}` : p.name))
        .join('. ');
      return floated(`dist/projects/${i + 1}.svg`, alt);
    })
    .join('\n');

  return `${floated('dist/ui/prompt-projects.svg', '~ $ ls ./projects')}\n${rows}`;
}

export function stackMarkup() {
  const described = STACK_GROUPS
    .map(([label, items]) => `${label.toLowerCase()}: ${items.join(', ')}`)
    .join('. ');
  const total = STACK_GROUPS.reduce((n, [, items]) => n + items.length, 0);

  return floated('dist/ui/prompt-stack.svg', `~ $ cat stack.txt — ${total} tools`)
    + '\n'
    + floated('dist/panels/stack.svg', `Full stack. ${described}.`);
}
