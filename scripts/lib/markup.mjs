import { escapeAttr } from './format.mjs';
import { STACK_GROUPS } from './stack-data.mjs';


export const PANEL_W = 820;



const safeUrl = (url) => {
  if (!/^https?:\/\//i.test(url)) throw new Error(`refusing to link to "${url}"`);
  return url;
};

// align="left" floats the image, which is the only way GitHub stacks two images
// with no gap between them: an inline image sits on a baseline and leaves 5px of
// page showing, which would cut the window frame at every seam.
const floated = (src, alt) => `<img align="left" src="${src}" width="${PANEL_W}" alt="${escapeAttr(alt)}">`;

export function projectMarkup(projects) {
  if (projects.length === 0) return '';

  const rows = projects
    .map((project, i) => {
      const alt = project.description ? `${project.name} — ${project.description}` : project.name;
      return `<a href="${escapeAttr(safeUrl(project.url))}">${floated(`dist/projects/${i + 1}.svg`, alt)}</a>`;
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
