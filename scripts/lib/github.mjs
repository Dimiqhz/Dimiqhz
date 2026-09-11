import { FEATURED } from './featured.mjs';

const ENDPOINT = 'https://api.github.com/graphql';

const NOT_A_LANGUAGE = new Set([
  'HTML', 'CSS', 'SCSS', 'Less', 'Batchfile', 'Dockerfile', 'Makefile', 'CMake',
  'Roff', 'Rich Text Format', 'TeX', 'Jupyter Notebook',
]);

const yearAgo = () => {
  const from = new Date();
  from.setUTCFullYear(from.getUTCFullYear() - 1);
  return from.toISOString();
};

const QUERY = `query ($login: String!, $from: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from) {
      totalCommitContributions
      contributionCalendar { weeks { contributionDays { date contributionCount } } }
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) {
      totalCount
      nodes {
        name url description stargazerCount
        primaryLanguage { name color }
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name color } }
        }
      }
    }
  }
}`;

export async function fetchProfile(login, token) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': `${login}-profile-generator`,
    },
    body: JSON.stringify({ query: QUERY, variables: { login, from: yearAgo() } }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API responded ${response.status} ${response.statusText}`);
  }
  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(`GitHub API: ${payload.errors.map((e) => e.message).join('; ')}`);
  }
  if (!payload.data?.user) throw new Error(`GitHub API returned no user for "${login}"`);

  return toProfile(payload.data.user);
}

export function toProfile(user, featured = FEATURED) {
  const { totalCount, nodes } = user.repositories;
  if (totalCount > nodes.length) {
    throw new Error(`only ${nodes.length} of ${totalCount} repositories were fetched; the query needs paging`);
  }

  const sizes = new Map();
  for (const repo of nodes) {
    for (const edge of repo.languages.edges) {
      if (NOT_A_LANGUAGE.has(edge.node.name)) continue;
      const current = sizes.get(edge.node.name) ?? { name: edge.node.name, color: edge.node.color, size: 0 };
      current.size += edge.size;
      sizes.set(edge.node.name, current);
    }
  }

  return {
    commits: user.contributionsCollection.totalCommitContributions,
    calendar: (user.contributionsCollection.contributionCalendar?.weeks ?? []).map((week) =>
      week.contributionDays.map((day) => ({ date: day.date, count: day.contributionCount }))),
    repositories: totalCount,
    languages: [...sizes.values()],
    projects: featured.map((wanted) => {
      const repo = nodes.find((r) => r.name === wanted);
      if (!repo) throw new Error(`featured repository "${wanted}" is not among the public repositories`);
      return {
        name: repo.name,
        url: repo.url,
        description: repo.description ?? '',
        stars: repo.stargazerCount,
        language: repo.primaryLanguage?.name ?? null,
        languageColor: repo.primaryLanguage?.color ?? null,
      };
    }),
  };
}
