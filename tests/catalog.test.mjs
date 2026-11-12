import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterProjects } from '../catalog.mjs';

const { projects, models, categories } = JSON.parse(readFileSync(new URL('../catalog.json', import.meta.url), 'utf8'));

test('filters by model, purpose and firmware together', () => {
  const matches = filterProjects(projects, { model: 'lite2', category: 'voice', query: '0.369.1.46.4778258659' }, models, categories);
  assert.deepEqual(matches.map(project => project.name), ['Pulsar']);
  assert.equal(filterProjects(projects, { model: 'midi', query: '4778258659' }, models, categories).length, 0);
});

test('search recognizes Cyrillic letters and model aliases', () => {
  assert.ok(filterProjects(projects, { query: 'СТАНЦИЯ МИНИ 2' }, models, categories).some(project => project.name === 'Spotiya'));
  assert.ok(filterProjects(projects, { query: '  звезд  ' }, models, categories).length === 0);
});

test('default results are sorted by GitHub stars without changing source order', () => {
  const original = projects.map(project => project.name);
  const stars = filterProjects(projects, {}, models, categories).map(project => project.stars);
  assert.deepEqual(stars, [...stars].sort((a, b) => b - a));
  assert.deepEqual(projects.map(project => project.name), original);
});

test('compatibility references known models and each project has a unique icon and GitHub URL', () => {
  assert.equal(new Set(projects.map(project => project.icon)).size, projects.length);
  assert.equal(new Set(projects.map(project => project.repo)).size, projects.length);
  for (const project of projects) {
    assert.match(project.repo, /^https:\/\/github\.com\/[^/]+\/[^/]+$/);
    assert.ok(project.compatibility.length > 0);
    assert.ok(categories[project.category]);
    for (const item of project.compatibility) {
      assert.ok(models[item.model]);
      assert.ok(['tested', 'declared', 'experimental', 'emulated'].includes(item.status));
      assert.match(item.source || project.repo, /^https:\/\/github\.com\//);
    }
  }
});
