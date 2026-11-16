'use strict';

const grid = document.querySelector('#palette-grid');
const categoryGroup = document.querySelector('#categories');
const search = document.querySelector('#search');
const state = document.querySelector('#state');
const resultCount = document.querySelector('#result-count');
const feedback = document.querySelector('#copy-feedback');
const message = document.querySelector('#copy-message');
const manualCode = document.querySelector('#manual-code');
const manualLabel = document.querySelector('#manual-label');
let data;
let selectedCategory = '';
let feedbackTimer;
let copyRequest = 0;

function validateData(value) {
  function fail(location, rule) {
    throw new Error(`${location}：${rule}`);
  }
  function keys(object, expected, location) {
    if (!object || typeof object !== 'object' || Array.isArray(object)
      || Object.keys(object).sort().join(',') !== [...expected].sort().join(',')) {
      fail(location, `欄位必須為 ${expected.join(', ')}`);
    }
  }
  function string(value, min, max, location) {
    if (typeof value !== 'string' || value.trim() !== value || /[<>]/u.test(value)
      || [...value].length < min || [...value].length > max) {
      fail(location, `須為 ${min}–${max} 字元且無前後空白及 HTML 標記的字串`);
    }
  }
  function id(value, location) {
    string(value, 2, 48, location);
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value)) fail(location, 'ID 格式錯誤');
  }
  function unique(value, seen, location) {
    if (seen.has(value)) fail(location, '不可重複');
    seen.add(value);
  }
  function chinese(value, location) {
    if (!/\p{Script=Han}/u.test(value)) fail(location, '須包含繁體中文名稱');
  }
  keys(value, ['schemaVersion', 'categories', 'palettes'], 'root');
  if (value.schemaVersion !== 1) fail('schemaVersion', '須為整數 1');
  if (!Array.isArray(value.categories) || !value.categories.length) fail('categories', '須為非空陣列');
  if (!Array.isArray(value.palettes)) fail('palettes', '須為陣列');
  const categoryIds = new Set();
  const categoryNames = new Set();
  value.categories.forEach((category, index) => {
    const location = `categories[${index}]`;
    keys(category, ['id', 'name'], location);
    id(category.id, `${location}.id`);
    string(category.name, 1, 12, `${location}.name`);
    chinese(category.name, `${location}.name`);
    if (category.name === '全部') fail(`${location}.name`, '不可使用保留名稱');
    unique(category.id, categoryIds, `${location}.id`);
    unique(category.name, categoryNames, `${location}.name`);
  });
  const paletteIds = new Set();
  const paletteNames = new Set();
  value.palettes.forEach((palette, index) => {
    const location = `palettes[${index}]`;
    keys(palette, ['id', 'name', 'category', 'description', 'colors', 'tags'], location);
    id(palette.id, `${location}.id`);
    unique(palette.id, paletteIds, `${location}.id`);
    string(palette.name, 1, 20, `${location}.name`);
    chinese(palette.name, `${location}.name`);
    unique(palette.name, paletteNames, `${location}.name`);
    if (!categoryIds.has(palette.category)) fail(`${location}.category`, '分類不存在');
    string(palette.description, 10, 120, `${location}.description`);
    chinese(palette.description, `${location}.description`);
    if (!Array.isArray(palette.colors) || palette.colors.length < 3 || palette.colors.length > 6) {
      fail(`${location}.colors`, '須有 3–6 個色碼');
    }
    const colors = new Set();
    palette.colors.forEach((color, colorIndex) => {
      if (typeof color !== 'string' || !/^#[0-9A-F]{6}$/.test(color)) fail(`${location}.colors[${colorIndex}]`, '須為大寫六位 HEX');
      unique(color, colors, `${location}.colors[${colorIndex}]`);
    });
    if (!Array.isArray(palette.tags) || palette.tags.length < 1 || palette.tags.length > 5) fail(`${location}.tags`, '須有 1–5 個標籤');
    const tags = new Set();
    palette.tags.forEach((tag, tagIndex) => {
      string(tag, 1, 12, `${location}.tags[${tagIndex}]`);
      unique(tag, tags, `${location}.tags[${tagIndex}]`);
    });
  });
  return value;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function categoryName(id) {
  return data.categories.find((category) => category.id === id).name;
}

function createCard(palette) {
  const card = element('article', 'palette-card');
  const heading = element('h3', 'card-heading', palette.name);
  heading.id = `palette-${palette.id}`;
  card.setAttribute('aria-labelledby', heading.id);
  const category = element('p', 'card-category');
  const dot = element('span', 'category-dot');
  dot.setAttribute('aria-hidden', 'true');
  category.append(dot, document.createTextNode(categoryName(palette.category)));
  const swatches = element('div', 'swatches');
  palette.colors.forEach((hex) => {
    const button = element('button', 'swatch');
    button.type = 'button';
    button.setAttribute('aria-label', `複製 ${palette.name} 的色碼 ${hex}`);
    button.title = `複製 ${hex}`;
    // SVG presentation attribute displays validated JSON colors without inline CSS.
    const color = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    color.setAttribute('class', 'swatch-color');
    color.setAttribute('aria-hidden', 'true');
    color.setAttribute('viewBox', '0 0 100 100');
    color.setAttribute('preserveAspectRatio', 'none');
    const rectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rectangle.setAttribute('width', '100');
    rectangle.setAttribute('height', '100');
    rectangle.setAttribute('fill', hex);
    color.append(rectangle);
    button.append(color, element('span', 'swatch-code', hex));
    button.addEventListener('click', () => copyColor(hex));
    swatches.append(button);
  });
  const tags = element('ul', 'tags');
  tags.setAttribute('aria-label', '配色標籤');
  palette.tags.forEach((tag) => tags.append(element('li', 'tag', tag)));
  card.append(heading, category, swatches, element('p', 'card-description', palette.description), tags);
  return card;
}

function render() {
  const query = search.value.trim().toLocaleLowerCase();
  const palettes = data.palettes.filter((palette) => {
    const text = [palette.name, palette.description, ...palette.tags, categoryName(palette.category)].join(' ').toLocaleLowerCase();
    return (!selectedCategory || palette.category === selectedCategory) && text.includes(query);
  });
  grid.replaceChildren(...palettes.map(createCard));
  resultCount.textContent = `顯示 ${palettes.length} 組配色，共收錄 ${data.palettes.length} 組`;
  state.hidden = palettes.length > 0;
  state.textContent = data.palettes.length === 0 ? '目前尚未收錄配色，敬請期待。' : '找不到符合的配色，試試其他關鍵字或分類。';
}

function renderCategories() {
  const choices = [{ id: '', name: '全部' }, ...data.categories];
  choices.forEach((category) => {
    const button = element('button', 'category-button', category.name);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(category.id === selectedCategory));
    button.addEventListener('click', () => {
      selectedCategory = category.id;
      categoryGroup.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      render();
    });
    categoryGroup.append(button);
  });
}

async function copyColor(hex) {
  const request = ++copyRequest;
  clearTimeout(feedbackTimer);
  let succeeded = false;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await navigator.clipboard.writeText(hex);
    succeeded = true;
  } catch {
    succeeded = false;
  }
  if (request !== copyRequest) return;
  feedback.hidden = false;
  manualCode.hidden = succeeded;
  manualLabel.hidden = succeeded;
  manualCode.value = succeeded ? '' : hex;
  message.textContent = succeeded ? `已複製 ${hex}，開始你的創作吧！` : '無法自動複製，請手動複製色碼。';
  if (succeeded) {
    feedbackTimer = setTimeout(() => {
      if (!feedback.contains(document.activeElement)) feedback.hidden = true;
    }, 4000);
  }
}

search.addEventListener('input', () => { if (data) render(); });
manualCode.addEventListener('focus', () => manualCode.select());
document.querySelector('#dismiss-feedback').addEventListener('click', () => {
  clearTimeout(feedbackTimer);
  copyRequest += 1;
  feedback.hidden = true;
  search.focus();
});

async function initialize() {
  let response;
  try {
    response = await fetch('./data/palettes.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    state.textContent = '配色載入失敗，請確認連線後重新整理頁面。';
    resultCount.textContent = '暫時無法取得配色';
    console.error('data/palettes.json 載入失敗', error);
    return;
  }
  try {
    data = validateData(await response.json());
  } catch (error) {
    state.textContent = '配色資料格式有誤，請稍後再試';
    resultCount.textContent = '暫時無法顯示配色';
    console.error('data/palettes.json 資料驗證失敗', error);
    return;
  }
  renderCategories();
  search.disabled = false;
  render();
}

initialize();
