// Sessao do admin: token assinado com HMAC-SHA256 guardado em cookie httpOnly.
// Usa so a Web Crypto API, entao funciona tanto no middleware quanto nas rotas.

export const COOKIE = 'sg64_admin';
export const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

const enc = new TextEncoder();

function b64url(bytes) {
  let s = '';
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(s) {
  const pad = s + '='.repeat((4 - (s.length % 4)) % 4);
  return atob(pad.replace(/-/g, '+').replace(/_/g, '/'));
}

async function hmac(data) {
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(process.env.AUTH_SECRET || ''), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

export function safeEqual(a, b) {
  a = String(a ?? '');
  b = String(b ?? '');
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export function authConfigured() {
  return Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASSWORD && (process.env.AUTH_SECRET || '').length >= 16);
}

export async function createToken(user) {
  const payload = b64url(enc.encode(JSON.stringify({ u: user, exp: Date.now() + MAX_AGE * 1000 })));
  return payload + '.' + (await hmac(payload));
}

export async function verifyToken(token) {
  if (!token || !authConfigured()) return false;
  const i = token.lastIndexOf('.');
  if (i < 1) return false;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  if (!safeEqual(sig, await hmac(payload))) return false;
  try {
    const data = JSON.parse(fromB64url(payload));
    return typeof data.exp === 'number' && data.exp > Date.now();
  } catch {
    return false;
  }
}
