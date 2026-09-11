import { escapeAttr } from './format.mjs';
import { STACK_GROUPS } from './stack-data.mjs';


export const PANEL_W = 820;



export function cardWidths(count) {
  return Array.from({ length: count }, (_, i) => {
    const alone = i === count - 1 && i % 2 === 0;
    return alone ? PANEL_W : PANEL_W / 2;
  });
}

export function cardCorners(index, count) {
  const lastRow = Math.floor((count - 1) / 2);
  const row = Math.floor(index / 2);
  const alone = index === count - 1 && index % 2 === 0;
  const left = alone || index % 2 === 0;
  const right = alone || index % 2 === 1 || index === count - 1;
  return {
    tl: row === 0 && left,
    tr: row === 0 && right,
    bl: row === lastRow && left,
    br: row === lastRow && right,
  };
}

const safeUrl = (url) => {
  if (!/^https?:\/\//i.test(url)) throw new Error(`refusing to link to "${url}"`);
  return url;
};

export function projectMarkup(projects) {
  if (projects.length === 0) return '';

  const widths = cardWidths(projects.length);

  const cards = projects
    .map((project, i) => {
      const width = widths[i];
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
