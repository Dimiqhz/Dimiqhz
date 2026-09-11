export function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function escapeAttr(value) {
  return escapeXml(value).replace(/"/g, '&quot;');
}

export function groupThousands(value) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function wrapText(value, max) {
  const lines = [];
  let line = '';
  for (const word of String(value ?? '').split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function truncate(text, max) {
  const value = String(text ?? '');
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

export function clampLines(lines, max) {
  if (lines.length <= max) return lines;
  const kept = lines.slice(0, max);
  kept[max - 1] = kept[max - 1].replace(/[\s,;:.]*\S*$/, '') + '…';
  return kept;
}

export function share(part, total) {
  const pct = total > 0 ? (part / total) * 100 : 0;
  return `${pct.toFixed(1)}%`;
}

export function lighten(hex, amount) {
  const raw = hex.slice(1);
  const full = raw.length === 3 ? [...raw].map((c) => c + c).join('') : raw;
  const mixed = [0, 2, 4]
    .map((i) => parseInt(full.slice(i, i + 2), 16))
    .map((channel) => Math.round(channel + (255 - channel) * amount))
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('');
  return `#${mixed}`;
}
