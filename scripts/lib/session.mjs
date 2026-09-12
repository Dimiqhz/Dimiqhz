// The terminal at the top types its own session; the block underneath prints
// its commands the way a scrollback holds them. Only the terminal needs a clock.

export const SESSION = [
  { name: 'about', command: 'neofetch' },
  { name: 'projects', command: 'ls ./projects' },
  { name: 'stats', command: 'gh stats' },
  { name: 'graph', command: 'git log --graph' },
  { name: 'stack', command: 'cat stack.txt' },
];

// When the terminal has finished typing and its prompt comes back.
export const CURSOR_AT = 4.65;
