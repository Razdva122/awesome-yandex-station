function normalize(value) {
  return value.toLocaleLowerCase('ru').replaceAll('ё', 'е');
}

export function filterProjects(projects, filters, models, categories) {
  const words = normalize(filters.query || '').trim().split(/\s+/).filter(Boolean);

  return projects.filter(project => {
    if (filters.category && project.category !== filters.category) return false;
    const compatibility = project.compatibility.filter(item => !filters.model || item.model === filters.model);
    if (!compatibility.length) return false;

    const text = normalize([
      project.name,
      project.repo,
      project.description,
      ...(project.features || []),
      project.requirements,
      categories[project.category],
      ...compatibility.flatMap(item => [`Станция ${models[item.model]}`, item.variant, item.firmware, item.note])
    ].join(' '));

    return words.every(word => text.includes(word));
  }).sort((first, second) => second.stars - first.stars);
}
