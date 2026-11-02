'use client';

import { useState } from 'react';
import { api, upload } from './api';
import { prepImage } from './image';
import { Down, Trash, Up } from './Icons';

function ink(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#F2F2F2';
  const n = parseInt(m[1], 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 160 ? '#151515' : '#FFFFFF';
}

function BrandRow({ b, first, last, onMove, onDelete, onSaved, notify }) {
  const [nome, setNome] = useState(b.nome);
  const [cor, setCor] = useState(b.cor_fundo || '#2A2A2A');
  const [busy, setBusy] = useState(false);
  const dirty = nome.trim() !== b.nome || cor.toLowerCase() !== (b.cor_fundo || '#2A2A2A').toLowerCase();

  const patch = async body => {
    setBusy(true);
    try {
      const j = await api(`/api/admin/brands/${b.id}`, 'PATCH', body);
      onSaved(j.brand);
      notify('Marca salva.');
    } catch (e) {
      notify(e.message, true);
    }
    setBusy(false);
  };

  const pickLogo = async e => {
    const fl = e.target.files?.[0];
    e.target.value = '';
    if (!fl) return;
    setBusy(true);
    try {
      const blob = await prepImage(fl, { max: 600 });
      const url = await upload(blob, 'marcas', 'logo');
      const j = await api(`/api/admin/brands/${b.id}`, 'PATCH', { logo_url: url });
      onSaved(j.brand);
      notify('Logo trocado.');
    } catch (e2) {
      notify(e2.message, true);
    }
    setBusy(false);
  };

  return (
    <li>
      <span className="a-swatch" style={{ background: cor }}>
        {b.logo_url ? <img src={b.logo_url} alt="" /> : <span style={{ color: ink(cor) }}>{nome || '—'}</span>}
      </span>
      <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
        <input className="a-f" value={nome} maxLength={60} aria-label="Nome da marca" onChange={e => setNome(e.target.value)} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <label className="a-btn ghost small" style={{ cursor: 'pointer', position: 'relative' }}>
            {b.logo_url ? 'Trocar logo' : 'Enviar logo'}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={pickLogo} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />
          </label>
          {b.logo_url ? (
            <button className="a-btn ghost small" type="button" disabled={busy} onClick={() => patch({ logo_url: null })}>
              Tirar logo
            </button>
          ) : null}
          {dirty ? (
            <button className="a-btn red small" type="button" disabled={busy || !nome.trim()} onClick={() => patch({ nome: nome.trim(), cor_fundo: cor })}>
              Salvar
            </button>
          ) : null}
        </div>
      </div>
      <input className="a-color" type="color" value={cor} aria-label="Cor de fundo" onChange={e => setCor(e.target.value)} />
      <div className="a-acts">
        <button className="a-icon" type="button" disabled={first || busy} onClick={() => onMove(-1)} aria-label={`Subir ${b.nome}`}>
          <Up />
        </button>
        <button className="a-icon" type="button" disabled={last || busy} onClick={() => onMove(1)} aria-label={`Descer ${b.nome}`}>
          <Down />
        </button>
        <button className="a-icon del" type="button" disabled={busy} onClick={onDelete} aria-label={`Excluir ${b.nome}`}>
          <Trash />
        </button>
      </div>
    </li>
  );
}

export default function BrandsView({ brands, setBrands, notify, confirm }) {
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#2A2A2A');
  const [busy, setBusy] = useState(false);
  const list = brands.slice().sort((a, b) => a.ordem - b.ordem);

  const replace = saved => setBrands(bs => bs.map(x => (x.id === saved.id ? saved : x)));

  const add = async e => {
    e.preventDefault();
    if (!nome.trim()) return;
    setBusy(true);
    try {
      const j = await api('/api/admin/brands', 'POST', { nome: nome.trim(), cor_fundo: cor });
      setBrands(bs => [...bs, j.brand]);
      setNome('');
      notify('Marca adicionada.');
    } catch (e2) {
      notify(e2.message, true);
    }
    setBusy(false);
  };

  const move = async (i, d) => {
    const a = list[i];
    const b = list[i + d];
    if (!a || !b) return;
    const oa = a.ordem;
    const ob = b.ordem === oa ? oa + d : b.ordem;
    setBrands(bs => bs.map(x => (x.id === a.id ? { ...x, ordem: ob } : x.id === b.id ? { ...x, ordem: oa } : x)));
    try {
      await Promise.all([api(`/api/admin/brands/${a.id}`, 'PATCH', { ordem: ob }), api(`/api/admin/brands/${b.id}`, 'PATCH', { ordem: oa })]);
    } catch (e) {
      setBrands(bs => bs.map(x => (x.id === a.id ? { ...x, ordem: oa } : x.id === b.id ? { ...x, ordem: b.ordem } : x)));
      notify(e.message, true);
    }
  };

  const del = async b => {
    const ok = await confirm({
      title: `Excluir a marca “${b.nome}”?`,
      text: 'Ela sai da grade de marcas do site. As miniaturas dessa marca continuam com o nome dela.',
      yes: 'Excluir'
    });
    if (!ok) return;
    try {
      await api(`/api/admin/brands/${b.id}`, 'DELETE');
      setBrands(bs => bs.filter(x => x.id !== b.id));
      notify('Marca excluída.');
    } catch (e) {
      notify(e.message, true);
    }
  };

  return (
    <section className="a-view">
      <div className="a-top">
        <div>
          <h1>MARCAS</h1>
          <p>
            É a grade colorida da parte de importação do site. Também aparece na lista de marcas do cadastro de miniatura. Logo em
            PNG ou SVG fica melhor; sem logo, aparece o nome em cima da cor.
          </p>
        </div>
      </div>
      <ul className="a-brands">
        {list.map((b, i) => (
          <BrandRow
            key={b.id}
            b={b}
            first={i === 0}
            last={i === list.length - 1}
            onMove={d => move(i, d)}
            onDelete={() => del(b)}
            onSaved={replace}
            notify={notify}
          />
        ))}
      </ul>
      <form className="a-addrow" onSubmit={add}>
        <input className="a-f" value={nome} maxLength={60} placeholder="Nova marca (ex.: Tarmac Works)" aria-label="Nome da nova marca" onChange={e => setNome(e.target.value)} />
        <input className="a-color" type="color" value={cor} aria-label="Cor de fundo da nova marca" onChange={e => setCor(e.target.value)} />
        <button className="a-btn red" type="submit" disabled={busy || !nome.trim()}>
          Adicionar marca
        </button>
      </form>
    </section>
  );
}
