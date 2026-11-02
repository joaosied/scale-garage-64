'use client';

import { useMemo, useState } from 'react';
import { api } from './api';
import { Close, Down, Plus, Up } from './Icons';

const byShelf = (a, b) => (a.ordem_estante ?? 9999) - (b.ordem_estante ?? 9999) || a.n - b.n;

export default function HighlightsView({ items, setItems, settings, setSettings, notify }) {
  const withImg = useMemo(() => items.filter(i => i.img).sort((a, b) => a.n - b.n), [items]);
  const [shelf, setShelf] = useState(() => items.filter(i => i.img && i.estante).sort(byShelf).map(i => i.id));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const byId = id => items.find(i => i.id === id);

  const setHero = async id => {
    const prev = settings.hero_id;
    setSettings(s => ({ ...s, hero_id: id }));
    try {
      await api('/api/admin/settings', 'PUT', { hero_id: id });
      notify('Carro do topo trocado.');
    } catch (e) {
      setSettings(s => ({ ...s, hero_id: prev }));
      notify(e.message, true);
    }
  };

  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= shelf.length) return;
    const copy = shelf.slice();
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setShelf(copy);
    setDirty(true);
  };
  const remove = id => {
    setShelf(s => s.filter(x => x !== id));
    setDirty(true);
  };
  const add = id => {
    setShelf(s => [...s, id]);
    setDirty(true);
  };

  const saveShelf = async () => {
    setBusy(true);
    try {
      await api('/api/admin/shelf', 'PUT', { ids: shelf });
      setItems(list =>
        list.map(i => {
          const pos = shelf.indexOf(i.id);
          return pos >= 0 ? { ...i, estante: true, ordem_estante: pos + 1 } : { ...i, estante: false, ordem_estante: null };
        })
      );
      setDirty(false);
      notify('Estante salva.');
    } catch (e) {
      notify(e.message, true);
    }
    setBusy(false);
  };

  const off = withImg.filter(i => !shelf.includes(i.id));

  return (
    <section className="a-view">
      <div className="a-top">
        <div>
          <h1>DESTAQUES</h1>
          <p>Escolha o carro que gira no topo do site e a ordem dos carros na Estante digital.</p>
        </div>
      </div>

      <div className="a-sec">
        <h3>CARRO DO TOPO</h3>
        <p className="a-d">Fica melhor com uma foto de lado, em PNG com fundo transparente.</p>
        {withImg.length ? (
          <div className="a-cards">
            {withImg.map(i => (
              <button key={i.id} type="button" className="a-pickc" aria-pressed={settings.hero_id === i.id} onClick={() => setHero(i.id)}>
                <img src={i.img} alt="" />
                <b>{i.nome}</b>
              </button>
            ))}
          </div>
        ) : (
          <p className="a-empty">Cadastre uma miniatura com foto primeiro.</p>
        )}
      </div>

      <div className="a-sec">
        <h3>ORDEM DA ESTANTE</h3>
        <p className="a-d">De cima pra baixo = da esquerda pra direita na estante. Só aparecem miniaturas com foto.</p>
        <ol className="a-order">
          {shelf.map((id, i) => {
            const it = byId(id);
            if (!it) return null;
            return (
              <li key={id}>
                <span className="a-pos">{i + 1}</span>
                <span className="a-thumb">
                  <img src={it.img} alt="" />
                </span>
                <b>{it.nome}</b>
                <button className="a-icon" type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir ${it.nome}`}>
                  <Up />
                </button>
                <button className="a-icon" type="button" onClick={() => move(i, 1)} disabled={i === shelf.length - 1} aria-label={`Descer ${it.nome}`}>
                  <Down />
                </button>
                <button className="a-icon del" type="button" onClick={() => remove(id)} aria-label={`Tirar ${it.nome} da estante`}>
                  <Close />
                </button>
              </li>
            );
          })}
        </ol>
        {off.length ? (
          <>
            <h3 style={{ marginTop: 22 }}>FORA DA ESTANTE</h3>
            <ul className="a-order">
              {off.map(it => (
                <li key={it.id} className="off">
                  <span className="a-pos">–</span>
                  <span className="a-thumb">
                    <img src={it.img} alt="" />
                  </span>
                  <b>{it.nome}</b>
                  <button className="a-btn ghost small" type="button" onClick={() => add(it.id)}>
                    <Plus /> Colocar
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <div className="a-savebar" style={{ maxWidth: 720 }}>
          {dirty ? <span style={{ color: 'var(--a-mute)', fontSize: 13 }}>Mudanças não salvas</span> : null}
          <button className="a-btn red" type="button" onClick={saveShelf} disabled={!dirty || busy}>
            {busy ? 'Salvando…' : 'Salvar estante'}
          </button>
        </div>
      </div>
    </section>
  );
}
