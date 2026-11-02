'use client';

import { useState } from 'react';
import { api } from './api';

const NAMES = ['01 · Quem somos', '02 · Importação', '03 · Como comprar'];

export default function TextsView({ settings, setSettings, notify }) {
  const [f, setF] = useState(() => ({
    instagram: settings.instagram || '',
    desde: settings.desde ? String(settings.desde) : '',
    sobre: settings.sobre.map(s => ({ ...s })),
    importacao_pt: settings.importacao_pt || '',
    importacao_en: settings.importacao_en || ''
  }));
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  const set = (k, v) => {
    setF(p => ({ ...p, [k]: v }));
    setDirty(true);
  };
  const setSobre = (i, k, v) => {
    setF(p => ({ ...p, sobre: p.sobre.map((s, j) => (j === i ? { ...s, [k]: v } : s)) }));
    setDirty(true);
  };

  const save = async () => {
    setBusy(true);
    try {
      await api('/api/admin/settings', 'PUT', f);
      setSettings(s => ({
        ...s,
        ...f,
        instagram: f.instagram.replace(/^@/, '').trim(),
        desde: f.desde ? parseInt(f.desde, 10) : null
      }));
      setDirty(false);
      notify('Textos salvos.');
    } catch (e) {
      notify(e.message, true);
    }
    setBusy(false);
  };

  return (
    <section className="a-view">
      <div className="a-top">
        <div>
          <h1>TEXTOS DO SITE</h1>
          <p>O que aparece no topo, na parte de importação e nos links do Instagram. Tudo em português e inglês.</p>
        </div>
      </div>

      <div className="a-card">
        <h4>Geral</h4>
        <div className="a-grid2">
          <div className="a-field">
            <label htmlFor="t-ig">Instagram</label>
            <input id="t-ig" className="a-f" value={f.instagram} maxLength={60} placeholder="scale_garage64" onChange={e => set('instagram', e.target.value)} />
            <small>Só o usuário, sem o @. Todos os botões “Tenho interesse” abrem a conversa com esse perfil.</small>
          </div>
          <div className="a-field">
            <label htmlFor="t-desde">Colecionando desde</label>
            <input id="t-desde" className="a-f" inputMode="numeric" maxLength={4} value={f.desde} onChange={e => set('desde', e.target.value.replace(/\D/g, ''))} />
            <small>Aparece do lado do número de miniaturas.</small>
          </div>
        </div>
      </div>

      {f.sobre.map((s, i) => (
        <div className="a-card" key={i}>
          <h4>Topo do site — {NAMES[i]}</h4>
          <div className="a-grid2">
            <div className="a-field">
              <label htmlFor={`s${i}tpt`}>Título (português)</label>
              <input id={`s${i}tpt`} className="a-f" value={s.t_pt} maxLength={80} onChange={e => setSobre(i, 't_pt', e.target.value)} />
            </div>
            <div className="a-field">
              <label htmlFor={`s${i}ten`}>Título (inglês)</label>
              <input id={`s${i}ten`} className="a-f" value={s.t_en} maxLength={80} onChange={e => setSobre(i, 't_en', e.target.value)} />
            </div>
            <div className="a-field">
              <label htmlFor={`s${i}ppt`}>Texto (português)</label>
              <textarea id={`s${i}ppt`} className="a-f" value={s.p_pt} maxLength={400} onChange={e => setSobre(i, 'p_pt', e.target.value)} />
            </div>
            <div className="a-field">
              <label htmlFor={`s${i}pen`}>Texto (inglês)</label>
              <textarea id={`s${i}pen`} className="a-f" value={s.p_en} maxLength={400} onChange={e => setSobre(i, 'p_en', e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      <div className="a-card">
        <h4>Parte de importação (ao lado das marcas)</h4>
        <div className="a-grid2">
          <div className="a-field">
            <label htmlFor="t-ipt">Português</label>
            <textarea id="t-ipt" className="a-f" rows={6} value={f.importacao_pt} maxLength={1200} onChange={e => set('importacao_pt', e.target.value)} />
          </div>
          <div className="a-field">
            <label htmlFor="t-ien">Inglês</label>
            <textarea id="t-ien" className="a-f" rows={6} value={f.importacao_en} maxLength={1200} onChange={e => set('importacao_en', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="a-savebar">
        {dirty ? <span style={{ color: 'var(--a-mute)', fontSize: 13 }}>Mudanças não salvas</span> : null}
        <button className="a-btn red" type="button" onClick={save} disabled={!dirty || busy}>
          {busy ? 'Salvando…' : 'Salvar textos'}
        </button>
      </div>
    </section>
  );
}
