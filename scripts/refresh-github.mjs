import { readFile, rename, writeFile } from 'node:fs/promises';

const catalogPath = new URL('../catalog.json', import.meta.url);
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const snapshotPath = new URL('../github.json', import.meta.url);
const repositories = {};
const headers = { Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function github(path, { allowMissing = false } = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers,
    signal: AbortSignal.timeout(20_000)
  });
  if (response.status === 404 && allowMissing) return null;
  if (!response.ok) throw new Error(`GitHub ${path}: HTTP ${response.status}`);
  return response.json();
}

for (const project of catalog.projects) {
  const repo = new URL(project.repo);
  if (repo.origin !== 'https://github.com' || !/^\/[\w.-]+\/[\w.-]+$/.test(repo.pathname)) {
    throw new Error(`Invalid repository URL: ${project.repo}`);
  }

  const path = `/repos${repo.pathname}`;
  const [metadata, release] = await Promise.all([
    github(path),
    github(`${path}/releases/latest`, { allowMissing: true })
  ]);

  if (!Number.isInteger(metadata.stargazers_count)) {
    throw new Error(`Missing star count: ${project.repo}`);
  }
  if (release && (!release.tag_name || !release.published_at || !release.html_url)) {
    throw new Error(`Incomplete release data: ${project.repo}`);
  }

  repositories[project.repo] = {
    stars: metadata.stargazers_count,
    release: release
      ? { version: release.tag_name, publishedAt: release.published_at, url: release.html_url }
      : null
  };
}

const snapshot = { checkedAt: new Date().toISOString(), repositories };
const temporaryPath = new URL('../github.json.tmp', import.meta.url);
await writeFile(temporaryPath, JSON.stringify(snapshot, null, 2) + '\n');
await rename(temporaryPath, snapshotPath);
console.log(`Updated GitHub metadata for ${catalog.projects.length} projects.`);
