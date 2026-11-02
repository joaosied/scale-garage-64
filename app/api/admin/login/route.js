import { NextResponse } from 'next/server';
import { COOKIE, MAX_AGE, authConfigured, createToken, safeEqual } from '@/lib/session';

const attempts = new Map();
const WINDOW = 15 * 60 * 1000;
const LIMIT = 8;

export async function POST(req) {
  if (!authConfigured()) {
    return NextResponse.json({ error: 'Login do admin não configurado. Veja o README (ADMIN_USER, ADMIN_PASSWORD, AUTH_SECRET).' }, { status: 503 });
  }
  const ip = (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && now - rec.t < WINDOW && rec.n >= LIMIT) {
    return NextResponse.json({ error: 'Muitas tentativas. Espera 15 minutos.' }, { status: 429 });
  }

  let body = {};
  try { body = await req.json(); } catch {}
  const okUser = safeEqual(body.user, process.env.ADMIN_USER);
  const okPass = safeEqual(body.password, process.env.ADMIN_PASSWORD);
  if (!(okUser && okPass)) {
    const r = rec && now - rec.t < WINDOW ? rec : { n: 0, t: now };
    r.n += 1;
    attempts.set(ip, r);
    return NextResponse.json({ error: 'Usuário ou senha incorretos.' }, { status: 401 });
  }
  attempts.delete(ip);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, await createToken(process.env.ADMIN_USER), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE
  });
  return res;
}
