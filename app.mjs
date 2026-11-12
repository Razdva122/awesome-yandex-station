import { filterProjects } from './catalog.mjs';

const icons = {
  box: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z M4 7.5l8 4.5 8-4.5 M12 12v9 M8 5.25l8 4.5"/>',
  wave: '<path d="M2 12h3l2.5-7 4.5 14 4-14 2.5 7H22"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11M6 6.5h.01M9 6.5h.01"/>',
  stream: '<path d="M3 8c6-2 12-1.5 18 2M5 12c5-1.5 10-1 15 2M7 16c4-1 7.5-.5 11 1.5"/>',
  cloud: '<path d="M10 17h8a3.5 3.5 0 1 0-.5-7 5 5 0 0 0-7.5-2.5V17ZM7 9v8M4 11v6M1.5 13v3"/>',
  play: '<rect x="3" y="5" width="18" height="14" rx="4"/><path d="m10 9 5 3-5 3V9Z"/>',
  moon: '<path d="M20 15a8 8 0 0 1-11-11 8.5 8.5 0 1 0 11 11ZM17 4v5m-2.5-2.5h5"/>',
  mic: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11v1a7 7 0 0 0 14 0v-1M12 19v3m-3 0h6"/>',
  sliders: '<path d="M4 5h16M4 12h16M4 19h16"/><circle cx="9" cy="5" r="2" class="slider-dot"/><circle cx="15" cy="12" r="2" class="slider-dot"/><circle cx="8" cy="19" r="2" class="slider-dot"/>',
  airplay: '<path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1m-7-4 6 8H6l6-8Z"/>',
  tv: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4m-2-13 5 2.5-5 2.5Z"/>',
  dial: '<circle cx="12" cy="12" r="8"/><path d="m12 12 3-4M7 12h.01M17 12h.01M12 17h.01"/>',
  headphones: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="13" width="5" height="7" rx="2"/><rect x="16" y="13" width="5" height="7" rx="2"/>',
  home: '<path d="m3 10 9-7 9 7M5 9v11h14V9m-10 4v3m3-5v7m3-5v3"/>',
  bolt: '<path d="m13 2-8 12h6l-1 8 9-12h-6l1-8Z"/>',
  route: '<path d="M5 12h5m4 0h5m-9 0 4-6m-4 6 4 6"/><circle cx="4" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="20" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>',
  receiver: '<rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 17h.01M11 17h6M8 10a6 6 0 0 1 8 0M5 7a10 10 0 0 1 14 0"/>',
  trigger: '<path d="M4 10v4m4-7v10m4-14v18m4-14v10m4-7v4"/>',
  star: '<path d="m12 3 2.7 5.7 6.3.8-4.6 4.5 1.1 6.2-5.5-3-5.5 3 1.1-6.2L3 9.5l6.3-.8L12 3Z"/>',
  external: '<path d="M13 4h7v7M20 4l-9 9m7 0v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  music: '<path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2.5"/><ellipse cx="17" cy="16" rx="3" ry="2.5"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>'
};

const categoryIcons = { '': 'grid', packages: 'box', voice: 'mic', control: 'sliders', music: 'music' };
const statuses = {
  tested: 'Проверено на устройстве',
  declared: 'Заявлено автором',
  experimental: 'Экспериментально',
  emulated: 'Проверено на стенде'
};
const filters = document.querySelector('#filters');
const results = document.querySelector('#projects');
const count = document.querySelector('#result-count');
const reset = document.querySelector('#reset');
const dialog = document.querySelector('#details');
const detailContent = document.querySelector('#details-content');
const loading = document.querySelector('#loading');

function element(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (typeof content === 'string') node.textContent = content;
  else if (content) node.append(...content);
  return node;
}

function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.65');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = icons[name] || '';
  return svg;
}

function projectIcon(project) {
  return element('span', `project-icon ${project.accent}`, [icon(project.icon)]);
}

function categoryLabel(category, label) {
  return element('span', 'category-label', [icon(categoryIcons[category]), document.createTextNode(label)]);
}

function link(href, label, className, withIcon = false) {
  const node = element('a', className, label);
  node.href = href;
  node.target = '_blank';
  node.rel = 'noopener noreferrer';
  if (withIcon) node.append(icon('external'));
  return node;
}

function showDetails(project, data) {
  const { models, categories } = data;
  const title = element('h2', '', project.name);
  title.id = 'project-title';
  const head = element('div', 'detail-top', [
    projectIcon(project),
    element('div', '', [title, categoryLabel(project.category, categories[project.category])])
  ]);
  const intro = element('p', 'detail-intro', project.description);
  const github = link(project.repo, 'Открыть на GitHub', 'repo-link', true);
  const rows = project.compatibility.map(item => {
    const modelName = item.variant ? `${models[item.model]} (${item.variant})` : models[item.model];
    const row = element('li', '', [
      element('div', 'compatibility-row', [
        element('strong', '', modelName),
        element('span', `compatibility-status ${item.status}`, statuses[item.status])
      ]),
      item.firmware
        ? element('p', 'firmware', item.firmware)
        : element('p', 'firmware-missing', 'Прошивка не указана')
    ]);
    if (item.note) row.append(element('p', 'compatibility-note', item.note));
    row.append(link(item.source || project.repo, 'Источник', 'proof'));
    return row;
  });
  detailContent.replaceChildren(head, intro);
  if (project.features?.length) {
    detailContent.append(
      element('ul', 'feature-list', project.features.map(feature =>
        element('li', '', [icon('chevron'), document.createTextNode(feature)])))
    );
  }
  if (project.requirements) {
    detailContent.append(element('p', 'requirements', [
      element('strong', '', 'Что понадобится'), document.createTextNode(project.requirements)
    ]));
  }
  detailContent.append(
    element('div', 'detail-actions', [github]),
    element('details', 'compatibility-disclosure', [
      element('summary', '', 'Модели и прошивки'),
      element('ul', 'compatibility-list', rows)
    ])
  );
  if (project.screenshot) {
    const { file, alt, source, width, height } = project.screenshot;
    const image = element('img', 'screenshot');
    image.alt = alt;
    image.width = width;
    image.height = height;
    image.decoding = 'async';
    const frame = link(source, '', 'screenshot-link');
    frame.append(image);
    image.addEventListener('error', () => frame.remove(), { once: true });
    image.src = file;
    detailContent.append(element('section', 'screenshot-section', [
      element('h3', 'detail-section-title', 'Как выглядит'),
      frame
    ]));
  }
  dialog.showModal();
  dialog.scrollTop = 0;
}

function projectCard(project, data) {
  const star = element('span', 'star', [icon('star'), document.createTextNode(project.stars)]);
  star.setAttribute('aria-label', `Звёзд на GitHub: ${project.stars}`);
  const github = link(project.repo, 'GitHub', 'repo-link', true);
  github.setAttribute('aria-label', `${project.name} на GitHub`);
  const details = element('button', 'detail-button', [document.createTextNode('Подробнее'), icon('chevron')]);
  details.type = 'button';
  details.setAttribute('aria-label', `Подробнее о программе ${project.name}`);
  details.setAttribute('aria-haspopup', 'dialog');
  details.addEventListener('click', () => showDetails(project, data));
  return element('article', 'project', [
    element('div', 'project-top', [
      projectIcon(project),
      element('div', '', [
        element('h3', '', project.name),
        categoryLabel(project.category, data.categories[project.category])
      ]),
      star
    ]),
    element('p', 'project-description', project.description),
    element('div', 'project-actions', [details, github])
  ]);
}

function initialize(data) {
  const { projects, models, categories, checkedAt } = data;
  const controls = filters.elements;
  const plural = new Intl.PluralRules('ru');
  const pluralNames = { one: 'программа', few: 'программы', many: 'программ', other: 'программ' };

  const options = document.querySelector('#category-options');
  for (const [value, label] of [['', 'Все'], ...Object.entries(categories)]) {
    const radio = element('input', 'category-radio');
    radio.type = 'radio';
    radio.name = 'category';
    radio.value = value;
    radio.defaultChecked = value === '';
    options.append(element('label', 'category-option', [radio, categoryLabel(value, label)]));
  }
  const date = new Intl.DateTimeFormat('ru', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(checkedAt));
  document.querySelector('#catalog-date').textContent = `Данные на ${date}`;

  function clear() {
    filters.reset();
    render();
    controls.query.focus();
  }

  function render() {
    const { category, query } = Object.fromEntries(new FormData(filters));
    const matched = filterProjects(projects, { category, query }, models, categories);
    count.textContent = `${matched.length} ${pluralNames[plural.select(matched.length)]}`;
    reset.hidden = !(category || query.trim());
    document.querySelector('#sort-note').hidden = matched.length === 0;

    if (matched.length) {
      results.replaceChildren(...matched.map(project => projectCard(project, data)));
    } else {
      const button = element('button', 'text-button', 'Сбросить фильтры');
      button.type = 'button';
      button.addEventListener('click', clear);
      results.replaceChildren(element('div', 'empty', [
        element('h3', '', 'Программы не найдены'),
        element('p', 'muted', 'Попробуйте другой запрос или модель.'),
        button
      ]));
    }
  }

  filters.addEventListener('input', render);
  filters.addEventListener('submit', event => event.preventDefault());
  reset.addEventListener('click', clear);
  filters.hidden = false;
  document.querySelector('#result-bar').hidden = false;
  loading.hidden = true;
  render();
}

try {
  const response = await fetch('./catalog.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  initialize(await response.json());
} catch (error) {
  loading.replaceChildren(document.createTextNode('Не удалось загрузить каталог. '),
    element('a', 'proof', 'Открыть данные каталога'));
  loading.querySelector('a').href = 'catalog.json';
  console.error(error);
}
