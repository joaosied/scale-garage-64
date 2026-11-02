import { NextResponse } from 'next/server';
import { fail, guard, refreshSite } from '@/lib/api';
import { toItem, toRow } from '@/lib/db';

export async function POST(req) {
  const g = await guard();
  if (g.res) return g.res;
  let body;
  try { body = await req.json(); } catch { return fail('Dados inválidos.'); }
  const row = toRow(body);
  if (!row.nome) return fail('Coloca o nome da miniatura.');
  const { data, error } = await g.client.from('miniaturas').insert(row).select().single();
  if (error) return fail('Não deu pra salvar: ' + error.message, 500);
  refreshSite();
  return NextResponse.json({ item: toItem(data) });
}
