import { NextResponse } from 'next/server';
import { fail, guard } from '@/lib/api';
import { BUCKET } from '@/lib/db';

const TYPES = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/svg+xml': 'svg' };
const MAX = 5 * 1024 * 1024;

export async function POST(req) {
  const g = await guard();
  if (g.res) return g.res;
  let form;
  try { form = await req.formData(); } catch { return fail('Arquivo inválido.'); }
  const file = form.get('file');
  const folder = form.get('pasta') === 'marcas' ? 'marcas' : 'miniaturas';
  if (!file || typeof file === 'string') return fail('Escolhe um arquivo.');
  const ext = TYPES[file.type];
  if (!ext) return fail('Use WEBP, PNG, JPG ou SVG.');
  if (ext === 'svg' && folder !== 'marcas') return fail('SVG só é aceito pra logo de marca.');
  if (file.size > MAX) return fail('Arquivo maior que 5 MB.');
  const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const { error } = await g.client.storage.from(BUCKET).upload(path, await file.arrayBuffer(), {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false
  });
  if (error) return fail('Não deu pra enviar a foto: ' + error.message, 500);
  const { data } = g.client.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
