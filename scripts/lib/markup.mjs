import { escapeAttr } from './format.mjs';
import { STACK_GROUPS } from './stack-data.mjs';


export const PANEL_W = 820;



export function cardWidths(count) {
  const base = Math.floor(PANEL_W / count);
  const widths = Array.from({ length: count }, () => base);
  widths[count - 1] += PANEL_W - base * count;
  return widths;
}

export function cardCorners(index, count) {
  return {
    tl: index === 0,
    bl: index === 0,
    tr: index === count - 1,
    br: index === count - 1,
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

  return `<img src="dist/ui/prompt-projects.svg" alt="~ $ ls ./projects">\n\n${cards}`;
}

export function stackMarkup() {
  const described = STACK_GROUPS
    .map(([label, items]) => `${label.toLowerCase()}: ${items.join(', ')}`)
    .join('. ');
  const total = STACK_GROUPS.reduce((n, [, items]) => n + items.length, 0);
  return `<details>
<summary><code>stack.txt</code> &nbsp;&middot;&nbsp; ${total} tools</summary>
<br>

<img src="dist/ui/prompt-stack.svg" alt="~ $ cat stack.txt">

<img src="dist/panels/stack.svg" alt="${escapeAttr(`Full stack. ${described}.`)}">

</details>`;
}
