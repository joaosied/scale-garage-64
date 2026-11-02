export async function api(path, method = 'GET', body) {
  const opts = { method, headers: {} };
  if (body instanceof FormData) opts.body = body;
  else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const r = await fetch(path, opts);
  if (r.status === 401) {
    location.href = '/admin/login';
    throw new Error('Sessão expirada. Faça login de novo.');
  }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Algo deu errado. Tenta de novo.');
  return j;
}

export async function upload(blob, pasta, name = 'foto') {
  const fd = new FormData();
  const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/svg+xml' ? 'svg' : blob.type === 'image/jpeg' ? 'jpg' : 'png';
  fd.append('file', blob, `${name}.${ext}`);
  fd.append('pasta', pasta);
  const j = await api('/api/admin/upload', 'POST', fd);
  return j.url;
}
