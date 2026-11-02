import { NextResponse } from 'next/server';
import { fail, guard, refreshSite } from '@/lib/api';
import { brandRow } from '@/lib/brands';

export async function PATCH(req, { params }) {
  const g = await guard();
  if (g.res) return g.res;
  const id = parseInt((await params).id, 10);
  if (!Number.isFinite(id)) return fail('ID inválido.');
  let b;
  try { b = await req.json(); } catch { return fail('Dados inválidos.'); }
  const row = brandRow(b);
  if ('nome' in row && !row.nome) return fail('Coloca o nome da marca.');
  const { data, error } = await g.client.from('marcas').update(row).eq('id', id).select().single();
  if (error) return fail(error.code === '23505' ? 'Essa marca já existe.' : 'Não deu pra salvar: ' + error.message, 400);
  refreshSite();
  return NextResponse.json({ brand: data });
}

export async function DELETE(req, { params }) {
  const g = await guard();
  if (g.res) return g.res;
  const id = parseInt((await params).id, 10);
  if (!Number.isFinite(id)) return fail('ID inválido.');
  const { error } = await g.client.from('marcas').delete().eq('id', id);
  if (error) return fail('Não deu pra excluir: ' + error.message, 500);
  refreshSite();
  return NextResponse.json({ ok: true });
}
