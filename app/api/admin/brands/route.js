import { NextResponse } from 'next/server';
import { fail, guard, refreshSite } from '@/lib/api';
import { brandRow } from '@/lib/brands';

export async function POST(req) {
  const g = await guard();
  if (g.res) return g.res;
  let b;
  try { b = await req.json(); } catch { return fail('Dados inválidos.'); }
  const row = brandRow(b);
  if (!row.nome) return fail('Coloca o nome da marca.');
  if (row.ordem == null) {
    const { data: last } = await g.client.from('marcas').select('ordem').order('ordem', { ascending: false }).limit(1).maybeSingle();
    row.ordem = (last?.ordem || 0) + 1;
  }
  const { data, error } = await g.client.from('marcas').insert(row).select().single();
  if (error) return fail(error.code === '23505' ? 'Essa marca já existe.' : 'Não deu pra salvar: ' + error.message, 400);
  refreshSite();
  return NextResponse.json({ brand: data });
}
