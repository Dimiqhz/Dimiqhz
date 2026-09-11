import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderAbout, renderBottom, renderHeader, renderGraph, renderProjectRow, renderPromptStrip, renderStack, renderStats } from './lib/assets.mjs';
import { fetchProfile } from './lib/github.mjs';
import { projectMarkup, stackMarkup } from './lib/markup.mjs';
import { STACK_GROUPS } from './lib/stack-data.mjs';
import { replaceBlock } from './lib/readme.mjs';

const LOGIN = 'Dimiqhz';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const write = (file, contents) => writeFile(path.join(ROOT, file), contents);

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not set');


  const profile = await fetchProfile(LOGIN, token);

  for (const dir of ['dist/panels', 'dist/ui', 'dist/projects']) {
    await mkdir(path.join(ROOT, dir), { recursive: true });
  }

  const projectsDir = path.join(ROOT, 'dist/projects');
  for (const stale of await readdir(projectsDir)) {
    await rm(path.join(projectsDir, stale));
  }
  await write('dist/panels/header.svg', renderHeader());
  await write('dist/panels/about.svg', renderAbout());
  await write('dist/panels/stats.svg', renderStats(profile));
  await write('dist/panels/stack.svg', renderStack());
  await write('dist/ui/prompt-projects.svg', renderPromptStrip('ls ./projects'));
  await write('dist/ui/prompt-about.svg', renderPromptStrip('neofetch'));
  await write('dist/ui/prompt-stats.svg', renderPromptStrip('gh stats'));
  await write('dist/ui/prompt-graph.svg', renderPromptStrip('git log --graph'));
  await write('dist/ui/prompt-stack.svg', renderPromptStrip('cat stack.txt', `${STACK_GROUPS.reduce((n, [, items]) => n + items.length, 0)} tools`));
  await write('dist/panels/graph.svg', renderGraph(profile.calendar));
  await write('dist/panels/bottom.svg', renderBottom());

  await Promise.all(profile.projects.map((project, i) =>
    write(`dist/projects/${i + 1}.svg`, renderProjectRow(project))));

  const readmePath = path.join(ROOT, 'README.md');
  const readme = await readFile(readmePath, 'utf8');
  const withProjects = replaceBlock(readme, 'projects', projectMarkup(profile.projects));
  await writeFile(readmePath, replaceBlock(withProjects, 'stack', stackMarkup()));

  console.log(`generated: ${profile.contributions} contributions, ${profile.repositories} repos, ` +
    `${profile.languages.length} languages, ${profile.projects.length} pinned projects`);
}

main().catch((error) => {
  console.error(`generate failed: ${error.message}`);
  process.exit(1);
});
