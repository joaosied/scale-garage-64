import { NextResponse } from 'next/server';
import { fail, guard, refreshSite } from '@/lib/api';

// Recebe a lista de IDs na ordem da estante; quem não estiver na lista sai da estante.
export async function PUT(req) {
  const g = await guard();
  if (g.res) return g.res;
  let b;
  try { b = await req.json(); } catch { return fail('Dados inválidos.'); }
  const ids = Array.isArray(b.ids) ? b.ids.map(n => parseInt(n, 10)).filter(Number.isFinite).slice(0, 60) : null;
  if (!ids) return fail('Lista inválida.');

  const off = g.client.from('miniaturas').update({ estante: false, ordem_estante: null });
  const r0 = ids.length ? await off.not('id', 'in', `(${ids.join(',')})`) : await off.gte('id', 0);
  if (r0.error) return fail('Não deu pra salvar: ' + r0.error.message, 500);
  for (let i = 0; i < ids.length; i++) {
    const r = await g.client.from('miniaturas').update({ estante: true, ordem_estante: i + 1 }).eq('id', ids[i]);
    if (r.error) return fail('Não deu pra salvar: ' + r.error.message, 500);
  }
  refreshSite();
  return NextResponse.json({ ok: true });
}
