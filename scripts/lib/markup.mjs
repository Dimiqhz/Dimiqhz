import { escapeAttr } from './format.mjs';
import { STACK_GROUPS } from './stack-data.mjs';


export const PANEL_W = 820;



export const GUTTER = 8;

const isLoneTrailingCard = (index, count) => index === count - 1 && count % 2 === 1;

export function cardWidth(index, count) {
  return isLoneTrailingCard(index, count) ? PANEL_W : PANEL_W / 2;
}


export function cardShape(index, count) {
  if (isLoneTrailingCard(index, count)) return 'full';
  return index % 2 === 0 ? 'left' : 'right';
}

const safeUrl = (url) => {
  if (!/^https?:\/\//i.test(url)) throw new Error(`refusing to link to "${url}"`);
  return url;
};

export function projectMarkup(projects) {
  if (projects.length === 0) return '';

  const cards = projects
    .map((project, i) => {
      const width = cardWidth(i, projects.length);
      const alt = project.description ? `${project.name} — ${project.description}` : project.name;
      return `<a href="${escapeAttr(safeUrl(project.url))}"><img src="dist/projects/${i + 1}.svg" width="${width}" alt="${escapeAttr(alt)}"></a>`;
    })
    .join('');

  return cards;
}

export function stackMarkup() {
  const described = STACK_GROUPS
    .map(([label, items]) => `${label.toLowerCase()}: ${items.join(', ')}`)
    .join('. ');
  const total = STACK_GROUPS.reduce((n, [, items]) => n + items.length, 0);
  return `<details>
<summary><code>stack.txt</code> &nbsp;&middot;&nbsp; ${total} tools</summary>
<br>

<img src="dist/panels/stack.svg" alt="${escapeAttr(`Full stack. ${described}.`)}">

</details>`;
}
