export const norm = s =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export function haystack(item) {
  return norm([item.nome, item.montadora, item.linha, item.marca, item.cor, item.ano, item.origem, item.tiragem, `#${item.n}`].join(' '));
}

export function options(items) {
  const uniq = key =>
    [...new Set(items.map(i => (i[key] || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  return { marca: uniq('marca'), cor: uniq('cor'), origem: ['Japão', 'China', 'EUA'].filter(o => items.some(i => i.origem === o)) };
}

export function applyFilters(items, q, f) {
  const words = norm(q).split(/\s+/).filter(Boolean);
  return items.filter(i => {
    if (f.marca.length && !f.marca.includes(i.marca)) return false;
    if (f.cor.length && !f.cor.includes(i.cor)) return false;
    if (f.origem.length && !f.origem.includes(i.origem)) return false;
    if (!words.length) return true;
    const h = haystack(i);
    return words.every(w => h.includes(w));
  });
}

export const EMPTY_FILTER = { marca: [], cor: [], origem: [] };
