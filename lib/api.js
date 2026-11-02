import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from './db';
import { COOKIE, verifyToken } from './session';

export function fail(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

// Confere a sessao de novo dentro da rota e devolve o cliente do banco.
export async function guard() {
  const store = await cookies();
  if (!(await verifyToken(store.get(COOKIE)?.value))) return { res: fail('Faça login de novo.', 401) };
  const client = db();
  if (!client) return { res: fail('O banco ainda não foi configurado. Veja o README.', 503) };
  return { client };
}

export function refreshSite() {
  revalidatePath('/');
  revalidatePath('/admin');
}
