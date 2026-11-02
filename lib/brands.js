const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function brandRow(b) {
  const row = {};
  if ('nome' in b) row.nome = clean(b.nome, 60);
  if ('logo_url' in b) row.logo_url = clean(b.logo_url, 600) || null;
  if ('cor_fundo' in b) {
    const c = clean(b.cor_fundo, 9);
    row.cor_fundo = /^#[0-9a-fA-F]{6}$/.test(c) ? c : null;
  }
  if ('ordem' in b) {
    const o = parseInt(b.ordem, 10);
    row.ordem = Number.isFinite(o) ? o : null;
  }
  return row;
}
