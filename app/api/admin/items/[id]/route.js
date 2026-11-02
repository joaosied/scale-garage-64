import { NextResponse } from 'next/server';
import { fail, guard, refreshSite } from '@/lib/api';
import { BUCKET, toItem, toRow } from '@/lib/db';

function idFrom(params) {
  const id = parseInt(params.id, 10);
  return Number.isFinite(id) ? id : null;
}

export async function PATCH(req, { params }) {
  const g = await guard();
  if (g.res) return g.res;
  const id = idFrom(await params);
  if (!id) return fail('ID inválido.');
  let body;
  try { body = await req.json(); } catch { return fail('Dados inválidos.'); }
  const row = toRow(body);
  if ('nome' in row && !row.nome) return fail('Coloca o nome da miniatura.');
  const { data, error } = await g.client.from('miniaturas').update(row).eq('id', id).select().single();
  if (error) return fail('Não deu pra salvar: ' + error.message, 500);
  refreshSite();
  return NextResponse.json({ item: toItem(data) });
}

export async function DELETE(req, { params }) {
  const g = await guard();
  if (g.res) return g.res;
  const id = idFrom(await params);
  if (!id) return fail('ID inválido.');
  const { data, error } = await g.client.from('miniaturas').delete().eq('id', id).select('imagem_url').maybeSingle();
  if (error) return fail('Não deu pra excluir: ' + error.message, 500);
  const url = data?.imagem_url || '';
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  if (url.includes(marker)) {
    await g.client.storage.from(BUCKET).remove([url.split(marker)[1]]);
  }
  refreshSite();
  return NextResponse.json({ ok: true });
}
