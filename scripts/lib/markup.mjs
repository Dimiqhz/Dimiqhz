import { escapeAttr } from './format.mjs';
import { STACK_GROUPS } from './stack-data.mjs';


export const PANEL_W = 820;

export const IMAGE_W = 846;


const safeUrl = (url) => {
  if (!/^https?:\/\//i.test(url)) throw new Error(`refusing to link to "${url}"`);
  return url;
};

const image = (src, alt, width) => `<img align="top" width="${width}" src="${src}" alt="${escapeAttr(alt)}">`;

const band = (src, alt) => image(src, alt, '100%');

export function projectMarkup(projects) {
  if (projects.length === 0) return '';

  const cells = projects
    .map((project, i) => {
      const alt = project.description ? `${project.name} — ${project.description}` : project.name;
      const cell = image(`dist/projects/${i + 1}.svg`, alt, '50%');
      return `<a href="${escapeAttr(safeUrl(project.url))}">${cell}</a>`;
    })
    .join('');

  return `${band('dist/ui/prompt-projects.svg', '~ $ ls ./projects')}
${cells}`;
}

export function stackMarkup() {
  const described = STACK_GROUPS
    .map(([label, items]) => `${label.toLowerCase()}: ${items.join(', ')}`)
    .join('. ');
  const total = STACK_GROUPS.reduce((n, [, items]) => n + items.length, 0);

  return band('dist/ui/prompt-stack.svg', `~ $ cat stack.txt — ${total} tools`)
    + '\n'
    + band('dist/panels/stack.svg', `Full stack. ${described}.`);
}
