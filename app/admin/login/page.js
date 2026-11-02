'use client';

import { useState } from 'react';

export default function Login() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, password })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Não deu pra entrar.');
      location.href = '/admin';
    } catch (e2) {
      setErr(e2.message);
      setBusy(false);
    }
  };

  return (
    <main className="a-login">
      <form onSubmit={submit}>
        <div>
          <h1>
            SCALE GARAGE <em>64</em>
          </h1>
          <p>Área do admin</p>
        </div>
        <div className="a-field">
          <label htmlFor="u">Usuário</label>
          <input id="u" className="a-f" autoComplete="username" value={user} onChange={e => setUser(e.target.value)} required />
        </div>
        <div className="a-field">
          <label htmlFor="p">Senha</label>
          <input id="p" className="a-f" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {err ? <p className="a-err" role="alert">{err}</p> : null}
        <button className="a-btn red" type="submit" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
