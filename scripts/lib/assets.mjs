import { readFileSync } from 'node:fs';

import { clampLines, escapeAttr, escapeXml, groupThousands, lighten, share, truncate, wrapText } from './format.mjs';
import { STACK_GROUPS } from './stack-data.mjs';
import { PANEL_W } from './markup.mjs';


export const C = {
  brand: '#4f6bff', blue: '#58a6ff', green: '#3fb950', amber: '#d29922', purple: '#a371f7',
};

const FONT = JSON.parse(readFileSync(new URL('./font.json', import.meta.url), 'utf8'));

const FACE = ['regular', 'bold']
  .map((weight) => `@font-face{font-family:'JetBrains Mono';font-style:normal;`
    + `font-weight:${weight === 'bold' ? 700 : 400};font-display:block;`
    + `src:url(data:font/woff2;base64,${FONT[weight]}) format('woff2')}`)
  .join('');

const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export const THEME = FACE + ':root{--bg:#0d1117;--bar:#161b22;--card:#12181f;--line:#21262d;'
  + '--track:#1c2128;--fg:#e6edf3;--dim:#8b949e;--mute:#6e7681;--title:#b6bcc4;'
  + '--js:#f1e05a;--sh:#89e051;--l0:#161b22;--l1:#0e4429;--l2:#006d32;--l3:#26a641;--l4:#39d353}'
  + '@media (prefers-color-scheme: light){:root{--bg:#ffffff;--bar:#f0f3f6;--card:#f6f8fa;'
  + '--line:#d1d9e0;--track:#eaeef2;--fg:#1f2328;--dim:#59636e;--mute:#818b98;--title:#424a53;'
  + '--js:#8a6d00;--sh:#3f6212;--l0:#ebedf0;--l1:#9be9a8;--l2:#40c463;--l3:#30a14e;--l4:#216e39}}';




const UI = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

const W = PANEL_W;
const PAD = 36;
export const TEXT_X = 28;
const SPLIT = Math.round(W / 2);
const COL2_X = SPLIT + 40;
export const BAR_W = W - COL2_X - PAD;
const MID = '&#183;';


export const WINDOW_TITLE = 'dimiqhz@github: ~';

const light = (cx, fill) => `<circle class="light" cx="${cx}" cy="20.5" r="6" fill="${fill}"/>`;

const panel = (w, h, title, body, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
<style>${THEME}text{font-family:${MONO}}.title{font-family:${UI};font-size:13px;font-weight:600;fill:var(--title)}</style>
<defs>${defs}</defs>
<rect class="frame" x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="12" fill="var(--bg)" stroke="var(--line)"/>
<path d="M.5 12.5A12 12 0 0 1 12.5 .5H${w - 12.5}A12 12 0 0 1 ${w - 0.5} 12.5V40.5H.5Z" fill="var(--bar)"/>
<path d="M.5 40.5H${w - 0.5}" stroke="var(--line)"/>
${light(24, '#ff5f57')}${light(46, '#febc2e')}${light(68, '#28c840')}
<text class="title" x="${w / 2}" y="25.5" text-anchor="middle">${escapeXml(title)}</text>
${body}</svg>`;



const cmd = (text) => `<tspan fill="var(--mute)">~</tspan><tspan fill="${C.brand}"> $ </tspan><tspan fill="var(--fg)">${text}</tspan>`;
const out = `<tspan fill="${C.green}">&#8594;</tspan><tspan fill="var(--dim)"> </tspan>`;


const CURSOR_AT = 4.65;

const HEADER_LINES = [
  { y: 76, w: 120, n: 10, at: 0.15, dur: 0.65, t: cmd('whoami') },
  { y: 108, w: 650, n: 57, at: 0.90, dur: 0.45, t: `${out}<tspan fill="var(--fg)" font-weight="600">Dimiqhz</tspan><tspan fill="${C.green}"> ${MID} Senior DevOps</tspan><tspan fill="var(--dim)"> ${MID} software developer &amp; designer</tspan>` },
  { y: 140, w: 200, n: 17, at: 1.50, dur: 0.85, t: cmd('cat focus.txt') },
  { y: 172, w: 500, n: 43, at: 2.45, dur: 0.45, t: `${out}<tspan fill="${C.blue}">web</tspan><tspan fill="var(--mute)"> ${MID} </tspan><tspan fill="${C.amber}">applications</tspan><tspan fill="var(--mute)"> ${MID} </tspan><tspan fill="${C.purple}">llm &amp; neural networks</tspan>` },
  { y: 204, w: 120, n: 10, at: 3.00, dur: 0.65, t: cmd('uptime') },
  { y: 236, w: 545, n: 47, at: 3.75, dur: 0.45, t: `${out}<tspan fill="${C.green}">8 years</tspan><tspan fill="var(--dim)"> shipping ${MID} first line of Java at age 6</tspan>` },
  { y: 268, w: 65, n: 5, at: 4.30, dur: 0.30, t: `<tspan fill="var(--mute)">~</tspan><tspan fill="${C.brand}"> $ </tspan><tspan class="cur" fill="${C.brand}">&#9612;</tspan>` },
];

export function renderHeader() {
  const full = W - 40;

  const clips = HEADER_LINES
    .map((l, i) => `<clipPath id="h${i}"><rect class="c${i}" x="${TEXT_X}" y="${l.y - 23}" height="30" width="${full}"/></clipPath>`)
    .join('');

  const motion = `<style>@media (prefers-reduced-motion: no-preference){
${HEADER_LINES.map((l, i) => `.c${i}{animation:t${i} ${l.dur}s steps(${l.n}) ${l.at}s both}`).join('')}
.cur{animation:blink 1.1s step-end ${CURSOR_AT}s infinite}
${HEADER_LINES.map((l, i) => `@keyframes t${i}{from{width:0}96%{width:${l.w}px}to{width:${full}px}}`).join('')}
@keyframes blink{0%,45%{fill-opacity:1}50%,100%{fill-opacity:0}}}</style>`;

  const body = HEADER_LINES
    .map((l, i) => `<text x="${TEXT_X}" y="${l.y}" font-size="19" xml:space="preserve" clip-path="url(#h${i})">${l.t}</text>`)
    .join('\n');

  return panel(W, 304, WINDOW_TITLE, body, clips + motion);
}



export function renderGraph(weeks) {
  const CELL = 12;
  const GAP = 2;
  const STEP = CELL + GAP;
  const gridW = weeks.length * STEP - GAP;
  const x0 = TEXT_X;
  const y0 = 96;
  const height = y0 + 7 * STEP - GAP + 46;

  const busiest = Math.max(0, ...weeks.flat().map((day) => day.count));
  const level = (count) => (count === 0 || busiest === 0 ? 0 : Math.min(4, Math.ceil(count / (busiest / 4))));

  const cells = weeks.flatMap((week, w) => week.map((day, d) =>
    `<rect class="d${level(day.count)}" x="${x0 + w * STEP}" y="${y0 + d * STEP}" width="${CELL}" height="${CELL}" rx="3"/>`))
    .join('');

  const legend = [0, 1, 2, 3, 4]
    .map((l, i) => `<rect class="d${l}" x="${W - 118 + i * 16}" y="${height - 30}" width="${CELL}" height="${CELL}" rx="3"/>`)
    .join('');

  const levels = [0, 1, 2, 3, 4].map((l) => `.d${l}{fill:var(--l${l})}`).join('');
  const motion = '@media (prefers-reduced-motion: no-preference){'
    + '.reveal{animation:sweep 1.6s ease-out backwards}@keyframes sweep{from{width:0}}}';

  const extra = `<style>text{font-size:11px;fill:var(--mute)}.cmdline{font-size:19px}${levels}${motion}</style>`
    + `<clipPath id="wipe"><rect class="reveal" x="${x0}" y="0" height="${height}" width="${gridW}"/></clipPath>`;

  const body = `<text class="cmdline" x="${TEXT_X}" y="72" xml:space="preserve">${cmd('git log --graph')}</text>
<g clip-path="url(#wipe)">${cells}</g>
<text x="${x0}" y="${height - 20}">${weeks.length} weeks</text>
<text x="${W - 140}" y="${height - 20}" text-anchor="end">less</text>
${legend}
<text x="${W - 30}" y="${height - 20}">more</text>`;

  return panel(W, height, WINDOW_TITLE, body, extra);
}

export function renderDivider() {

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="36" viewBox="0 0 ${W} 36" role="presentation">
<style>${THEME}</style>
<defs><linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
<stop offset="0%" stop-color="${C.brand}" stop-opacity="0"/>
<stop offset="28%" stop-color="${C.brand}" stop-opacity=".75"/>
<stop offset="52%" stop-color="${C.blue}" stop-opacity=".85"/>
<stop offset="76%" stop-color="${C.purple}" stop-opacity=".7"/>
<stop offset="100%" stop-color="${C.purple}" stop-opacity="0"/>
</linearGradient></defs>
<rect x="0" y="17" width="${W}" height="2" rx="1" fill="url(#rule)"/>
</svg>`;
}



export function renderPromptStrip(command) {

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="46" viewBox="0 0 ${W} 46" role="img" aria-label="${escapeAttr(`~ $ ${command}`)}">
<style>${THEME}text{font-family:${MONO};font-size:19px}</style>
<text x="${TEXT_X}" y="31" xml:space="preserve"><tspan fill="var(--mute)">~</tspan><tspan fill="${C.brand}"> $ </tspan><tspan fill="var(--fg)">${escapeXml(command)}</tspan></text>
</svg>`;
}



const D_MATRIX = [
  '1111111100', '1111111110', '1110000111', '1110000011', '1110000011', '1110000011',
  '1110000011', '1110000011', '1110000011', '1110000111', '1111111110', '1111111100',
];

const sep = ['var(--mute)', ` ${MID} `];


const CHROME_H = 40;
const ABOUT_H = 276;
const LOGO_X = TEXT_X;
const BLOCK = 13;
const LOGO_H = D_MATRIX.length * BLOCK - 1;
const LOGO_Y = Math.round(CHROME_H + (ABOUT_H - CHROME_H - LOGO_H) / 2);
const LOGO_W = D_MATRIX[0].length * BLOCK;
const INFO_X = LOGO_X + LOGO_W + 52;
const VALUE_X = INFO_X + 100;


const HANDLE_W = 160;


const ABOUT_ROWS = [
  ['ROLE', [[C.green, 'Senior DevOps'], ['var(--dim)', ' — current']]],
  ['OS', [['var(--fg)', `Windows ${MID} macOS ${MID} Linux`]]],
  ['STACK', [['#3178c6', 'TypeScript'], sep, ['#4b8bbe', 'Python'], sep, ['#b07219', 'Java'], sep, ['#f34b7d', 'C++']]],
  ['', [['#178600', 'C#'], sep, ['#4F5D95', 'PHP'], sep, ['var(--js)', 'JavaScript'], sep, ['var(--sh)', 'Bash']]],
  ['LEARNING', [['#00ADD8', 'Go']]],
  ['SPEAKING', [['var(--dim)', 'tech events, whenever I get the chance']]],
  ['CONTACT', [['var(--dim)', 'discord '], [C.brand, 'DIMIQHZ']]],
];

export function renderAbout() {
  const logo = D_MATRIX.flatMap((row, y) => [...row].map((bit, x) =>
    bit === '1' ? `<rect x="${LOGO_X + x * BLOCK}" y="${LOGO_Y + y * BLOCK}" width="${BLOCK - 1}" height="${BLOCK - 1}" rx="2" fill="url(#g)"/>` : '',
  )).join('');

  const rows = ABOUT_ROWS.map(([label, parts], i) => {
    const y = 82 + i * 26;
    return `<text x="${INFO_X}" y="${y}" font-size="12" letter-spacing="1.2" fill="var(--mute)">${label}</text>
<text x="${VALUE_X}" y="${y}" font-size="15" xml:space="preserve">${parts.map(([fill, text]) => `<tspan fill="${fill}">${text}</tspan>`).join('')}</text>`;
  }).join('\n');

  return panel(W, ABOUT_H, WINDOW_TITLE, `${logo}
${rows}`,
  `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${C.brand}"/><stop offset="100%" stop-color="${C.blue}"/></linearGradient>`);
}




const CARD_BODY = 168;
const COMMAND_BAND = 0;

export function renderProjectCard({ name, description, language, languageColor }, width, opts = {}) {
  const corners = opts.corners ?? { tl: true, tr: true, bl: true, br: true };
  const command = opts.command ?? null;
  const topRow = opts.topRow ?? Boolean(command);
  const band = topRow ? COMMAND_BAND : 0;
  const H = CARD_BODY + band;
  const R = 12;

  const arc = (on, x, y, sweep) => (on ? `A${R} ${R} 0 0 ${sweep} ${x} ${y}` : `L${x} ${y}`);
  const shape = [
    `M${corners.tl ? R : 0} 0`,
    `H${width - (corners.tr ? R : 0)}`,
    arc(corners.tr, width, R, 1),
    `V${H - (corners.br ? R : 0)}`,
    arc(corners.br, width - R, H, 1),
    `H${corners.bl ? R : 0}`,
    arc(corners.bl, 0, H - R, 1),
    `V${corners.tl ? R : 0}`,
    arc(corners.tl, R, 0, 1),
    'Z',
  ].join(' ');

  const columns = Math.floor((width - TEXT_X - 16) / 7.4);
  const nameColumns = Math.floor((width - TEXT_X - 16) / 8.4);
  const body = clampLines(wrapText(description, columns), 4)
    .map((line, i) => `<text x="${TEXT_X}" y="${band + 68 + i * 20}" font-size="13" fill="var(--dim)">${escapeXml(line)}</text>`)
    .join('\n');
  const tag = language
    ? `<circle cx="${TEXT_X + 5}" cy="${H - 28}" r="5" fill="${escapeAttr(languageColor || C.blue)}"/>
<text x="${TEXT_X + 18}" y="${H - 23}" font-size="12" fill="var(--dim)">${escapeXml(language)}</text>`
    : '';
  const head = command
    ? `<text class="cmdline" x="${TEXT_X}" y="34" xml:space="preserve">${cmd(escapeXml(command))}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${H}" viewBox="0 0 ${width} ${H}" role="img">
<style>${THEME}text{font-family:${MONO}}.cmdline{font-size:19px}</style>
<path class="frame" d="${shape}" fill="var(--card)"/>
${head}
<text x="${TEXT_X}" y="${band + 42}" font-size="14" font-weight="600" fill="${C.blue}">${escapeXml(truncate(name, nameColumns))}</text>
${body}
${tag}</svg>`;
}



const ICONS = JSON.parse(readFileSync(new URL('./icons.json', import.meta.url), 'utf8'));

const ICON = 16;
const GLYPH = 7.2;

export function renderStack() {
  const LABEL_X = TEXT_X;
  const CHIPS_X = TEXT_X + 162;
  const RIGHT = W - PAD;
  const TEXT_GAP = ICON + 8;

  const parts = [];
  let y = 120;

  for (const [label, items] of STACK_GROUPS) {
    const column = CHIPS_X - LABEL_X - 12;
    const lines = wrapText(label, Math.floor(column / 8.4));
    lines.forEach((line, n) => {
      parts.push(`<text x="${LABEL_X}" y="${y + n * 15}" class="glabel">${escapeXml(line)}</text>`);
    });
    let x = CHIPS_X;

    for (const name of items) {

      if (x + TEXT_GAP + name.length * GLYPH > RIGHT && x > CHIPS_X) {
        x = CHIPS_X;
        y += 28;
      }
      const icon = ICONS[name];
      const scale = (ICON / Number(icon.viewBox.split(/\s+/)[2])).toFixed(4);

      parts.push(`<g fill="var(--dim)" transform="translate(${x} ${y - 13}) scale(${scale})">${icon.body}</g>`);
      parts.push(`<text x="${x + TEXT_GAP}" y="${y}" class="chip">${escapeXml(name)}</text>`);
      x += TEXT_GAP + name.length * GLYPH + 22;
    }
    y += 46;
  }

  const style = `<style>.glabel{font-size:12px;letter-spacing:1.2px;fill:var(--mute)}`
    + `.chip{font-size:12px;fill:var(--dim)}</style>`;
  const head = `<text x="${TEXT_X}" y="76" font-size="19" xml:space="preserve">${cmd('cat stack.txt')}</text>`;
  return panel(W, Math.round(y - 12), WINDOW_TITLE, head + '\n' + parts.join('\n'), style);
}



export function renderStats({ contributions, repositories, languages }) {
  const total = languages.reduce((sum, l) => sum + l.size, 0);
  const top = [...languages].sort((a, b) => b.size - a.size).slice(0, 5);


  const counters = [
    [groupThousands(contributions), 'contributions, last 12 months', C.green],
    [groupThousands(repositories), 'public repositories', C.brand],
    [String(languages.length), 'languages used', C.blue],
  ];

  const ramps = counters
    .map(([, , fill], i) => `<linearGradient id="n${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${lighten(fill, 0.35)}"/><stop offset="100%" stop-color="${fill}"/></linearGradient>`)
    .join('');

  const left = counters.map(([value, label], i) => {
    const y = 130 + i * 76;
    return `<text x="${TEXT_X}" y="${y}" font-size="34" font-weight="600" fill="url(#n${i})">${escapeXml(value)}</text>
<text x="${TEXT_X}" y="${y + 22}" font-size="13" fill="var(--dim)">${escapeXml(label)}</text>`;
  }).join('\n');

  const right = top.map((lang, i) => {
    const y = 118 + i * 40;
    const filled = total > 0 ? Math.max(4, Math.round(BAR_W * (lang.size / total))) : 0;
    return `<text x="${COL2_X}" y="${y}" font-size="14" fill="var(--fg)">${escapeXml(lang.name)}</text>
<text x="${COL2_X + BAR_W}" y="${y}" font-size="14" text-anchor="end" fill="var(--dim)">${share(lang.size, total)}</text>
<rect class="track" x="${COL2_X}" y="${y + 10}" height="8" rx="4" fill="var(--track)" width="${BAR_W}"/>
<rect class="bar" x="${COL2_X}" y="${y + 10}" height="8" rx="4" fill="${escapeAttr(lang.color || C.brand)}" style="animation-delay:${(0.15 + i * 0.09).toFixed(2)}s" width="${filled}"/>`;
  }).join('\n');


  const motion = `<style>@media (prefers-reduced-motion: no-preference){`
    + `.bar{animation:grow .8s cubic-bezier(.2,.8,.2,1) backwards}`
    + `@keyframes grow{from{width:0}}}</style>${ramps}`;

  const leftBottom = 130 + (counters.length - 1) * 76 + 22;
  const rightBottom = top.length ? 118 + (top.length - 1) * 40 + 18 : 0;
  const height = Math.max(leftBottom, rightBottom) + 40;

  return panel(W, height, WINDOW_TITLE, `
<text x="${TEXT_X}" y="78" font-size="12" letter-spacing="1.2" fill="var(--mute)">OVERVIEW</text>
${left}
<path d="M${SPLIT} 70V${height - 26}" stroke="var(--line)"/>
<text x="${COL2_X}" y="78" font-size="12" letter-spacing="1.2" fill="var(--mute)">TOP LANGUAGES</text>
${right}`, motion);
}
