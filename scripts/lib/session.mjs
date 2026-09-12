// The profile is one shell session drawn across stacked images. Each image
// animates on its own clock, which all start together when the page loads, so
// the run is sequenced with absolute delays rather than with any shared timer.

// When the header has finished typing its last line. Asserted against the
// header's own keyframes, so shortening the intro cannot silently overlap.
export const HEADER_END = 4.3;

// How long one command takes to type, and the beat between two of them.
export const TYPE_DUR = 0.45;
const STEP = 0.6;

export const SESSION = [
  { name: 'about', command: 'neofetch' },
  { name: 'projects', command: 'ls ./projects' },
  { name: 'stats', command: 'gh stats' },
  { name: 'graph', command: 'git log --graph' },
  { name: 'stack', command: 'cat stack.txt' },
];

export function cueOf(name) {
  const index = SESSION.findIndex((entry) => entry.name === name);
  if (index < 0) throw new Error(`"${name}" is not part of the session`);
  return Number((HEADER_END + 0.3 + index * STEP).toFixed(2));
}

// The prompt is only live once the last command has run.
export const CURSOR_AT = Number((cueOf(SESSION[SESSION.length - 1].name) + TYPE_DUR + 0.35).toFixed(2));
