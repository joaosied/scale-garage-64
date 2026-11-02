'use client';

import { useMemo, useState } from 'react';
import { STATUS_COLOR } from '@/lib/i18n';
import { haystack, norm } from '@/lib/filters';
import { api } from './api';
import { Edit, Search, Trash } from './Icons';

export const STATUS = [
  { v: 'disponivel', l: 'Disponível' },
  { v: 'reservado', l: 'Reservado' },
  { v: 'encomenda', l: 'Sob encomenda' },
  { v: 'vendido', l: 'Vendido' }
];

export default function ItemsView({ items, setItems, settings, notify, onNew, onEdit, onDelete }) {
  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState('todas');

  const stats = useMemo(
    () => [
      { l: 'TOTAL', v: items.length },
      { l: 'À VENDA', v: items.filter(i => i.tipo === 'venda').length, c: '#D92B26' },
      { l: 'COLEÇÃO', v: items.filter(i => i.tipo === 'colecao').length, c: STATUS_COLOR.colecao },
      { l: 'DISPONÍVEIS', v: items.filter(i => i.tipo === 'venda' && i.status === 'disponivel').length, c: STATUS_COLOR.disponivel },
      { l: 'VENDIDAS', v: items.filter(i => i.tipo === 'venda' && i.status === 'vendido').length, c: STATUS_COLOR.vendido }
    ],
    [items]
  );

  const list = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    return items
      .filter(i => tipo === 'todas' || i.tipo === tipo)
      .filter(i => {
        if (!words.length) return true;
        const h = haystack(i);
        return words.every(w => h.includes(w));
      })
      .sort((a, b) => b.n - a.n);
  }, [items, q, tipo]);

  const setStatus = async (item, status) => {
    const prev = item.status;
    setItems(l => l.map(x => (x.id === item.id ? { ...x, status } : x)));
    try {
      await api(`/api/admin/items/${item.id}`, 'PATCH', { status });
      notify(`${item.nome}: ${STATUS.find(s => s.v === status).l.toLowerCase()}.`);
    } catch (e) {
      setItems(l => l.map(x => (x.id === item.id ? { ...x, status: prev } : x)));
      notify(e.message, true);
    }
  };

  return (
    <section className="a-view">
      <div className="a-top">
        <div>
          <h1>MINIATURAS</h1>
          <p>Tudo que aparece no site sai daqui. O contador “miniaturas” do site soma todas as cadastradas.</p>
        </div>
        <button className="a-btn red" type="button" onClick={onNew}>
          + Nova miniatura
        </button>
      </div>

      <div className="a-stats">
        {stats.map(s => (
          <div className="a-stat" key={s.l}>
            <span>
              {s.c ? <i style={{ background: s.c }} /> : null}
              {s.l}
            </span>
            <b>{s.v}</b>
          </div>
        ))}
      </div>

      <div className="a-filters">
        <label className="a-search">
          <Search />
          <span className="sr-only">Buscar</span>
          <input type="search" placeholder="Buscar por nome, marca, cor, nº…" value={q} onChange={e => setQ(e.target.value)} />
        </label>
        <div className="a-segs" role="group" aria-label="Tipo">
          {[
            ['todas', 'Todas'],
            ['venda', 'À venda'],
            ['colecao', 'Coleção']
          ].map(([v, l]) => (
            <button key={v} type="button" aria-pressed={tipo === v} onClick={() => setTipo(v)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="a-table">
        {list.length ? (
          <table>
            <thead>
              <tr>
                <th>Nº</th>
                <th>Foto</th>
                <th>Miniatura</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Aparece em</th>
                <th>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map(i => (
                <tr key={i.id}>
                  <td className="a-num c-num">{String(i.n).padStart(2, '0')}</td>
                  <td className="c-img">
                    <div className="a-thumb">{i.img ? <img src={i.img} alt="" /> : <span className="a-num">—</span>}</div>
                  </td>
                  <td className="a-mname">
                    <b>{i.nome}</b>
                    <span>{[i.marca, i.linha].filter(Boolean).join(' · ') || '—'}</span>
                  </td>
                  <td className="c-tipo">
                    <span className={'a-tipo ' + i.tipo}>{i.tipo === 'venda' ? 'À venda' : 'Coleção'}</span>
                  </td>
                  <td className="c-st">
                    {i.tipo === 'venda' ? (
                      <select
                        className="a-st"
                        style={{ '--c': STATUS_COLOR[i.status] }}
                        value={i.status}
                        onChange={e => setStatus(i, e.target.value)}
                        aria-label={`Status de ${i.nome}`}
                      >
                        {STATUS.map(s => (
                          <option key={s.v} value={s.v}>
                            {s.l}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select className="a-st" style={{ '--c': STATUS_COLOR.colecao }} disabled value="c" aria-label="Coleção">
                        <option value="c">Coleção</option>
                      </select>
                    )}
                  </td>
                  <td className="c-where">
                    <div className="a-where">
                      {settings.hero_id === i.id ? <span className="is-hero">TOPO</span> : null}
                      <span>{i.tipo === 'venda' ? 'VENDA' : 'COLEÇÃO'}</span>
                      {i.estante && i.img ? <span>ESTANTE</span> : null}
                      {i.img ? <span>EXPLORAR</span> : null}
                    </div>
                  </td>
                  <td className="c-acts">
                    <div className="a-acts">
                      <button className="a-icon" type="button" onClick={() => onEdit(i)} aria-label={`Editar ${i.nome}`}>
                        <Edit />
                      </button>
                      <button className="a-icon del" type="button" onClick={() => onDelete(i)} aria-label={`Excluir ${i.nome}`}>
                        <Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="a-empty">{items.length ? 'Nada encontrado com esse filtro.' : 'Nenhuma miniatura cadastrada ainda.'}</p>
        )}
      </div>
    </section>
  );
}
