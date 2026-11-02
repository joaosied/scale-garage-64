import { NextResponse } from 'next/server';
import { fail, guard, refreshSite } from '@/lib/api';

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function PUT(req) {
  const g = await guard();
  if (g.res) return g.res;
  let b;
  try { b = await req.json(); } catch { return fail('Dados inválidos.'); }
  const row = { id: 1 };
  if ('instagram' in b) {
    const ig = clean(b.instagram, 60).replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/.*$/, '');
    if (!/^[A-Za-z0-9._]{1,30}$/.test(ig)) return fail('Usuário do Instagram inválido.');
    row.instagram = ig;
  }
  if ('desde' in b) {
    const d = parseInt(b.desde, 10);
    row.desde = Number.isFinite(d) && d > 1900 && d < 2200 ? d : null;
  }
  if ('hero_id' in b) {
    const h = parseInt(b.hero_id, 10);
    row.hero_id = Number.isFinite(h) ? h : null;
  }
  if ('sobre' in b) {
    if (!Array.isArray(b.sobre) || b.sobre.length !== 3) return fail('O “Sobre” precisa ter 3 blocos.');
    row.sobre = b.sobre.map(s => ({
      t_pt: clean(s.t_pt, 80), p_pt: clean(s.p_pt, 400),
      t_en: clean(s.t_en, 80), p_en: clean(s.p_en, 400)
    }));
  }
  if ('importacao_pt' in b) row.importacao_pt = clean(b.importacao_pt, 1200);
  if ('importacao_en' in b) row.importacao_en = clean(b.importacao_en, 1200);

  const { error } = await g.client.from('configuracoes').upsert(row);
  if (error) return fail('Não deu pra salvar: ' + error.message, 500);
  refreshSite();
  return NextResponse.json({ ok: true });
}
