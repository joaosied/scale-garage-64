'use client';

import { useMemo, useState } from 'react';
import { EMPTY_FILTER, applyFilters, options } from '@/lib/filters';
import FilterBar from './FilterBar';

const STEP = 8;

export function ColCard({ item, t, open, setOpen, onExplore }) {
  const meta = [item.marca, item.linha].filter(Boolean);
  return (
    <div className="cslot">
      <article
        className={'ccard' + (open ? ' open' : '')}
        tabIndex={0}
        onMouseEnter={() => setOpen(item.id)}
        onMouseLeave={() => setOpen(null)}
        onFocus={() => setOpen(item.id)}
        onBlur={e => !e.currentTarget.contains(e.relatedTarget) && setOpen(null)}
        onClick={() => {
          if (!matchMedia('(hover: hover)').matches) setOpen(open ? null : item.id);
        }}
      >
        <span className="cnum" aria-hidden="true">
          {String(item.n).padStart(2, '0')}
        </span>
        <div className="cstage">{item.img ? <img src={item.img} alt={item.nome} loading="lazy" /> : null}</div>
        <div className="cinfo">
          <b>{item.nome.toUpperCase()}</b>
          <span>
            {meta.length ? (
              meta.map((m, i) => (
                <span key={i}>
                  {i ? <i> · </i> : null}
                  {m}
                </span>
              ))
            ) : (
              '1:64'
            )}
          </span>
          <div className="cspecs">
            <dl>
              <div>
                <dt>{t.spec.ano.toUpperCase()}</dt>
                <dd>{item.ano || '—'}</dd>
              </div>
              <div>
                <dt>{t.spec.cor.toUpperCase()}</dt>
                <dd>{item.cor || '—'}</dd>
              </div>
              <div>
                <dt>{t.spec.escala.toUpperCase()}</dt>
                <dd>1:64</dd>
              </div>
              <div>
                <dt>{t.spec.tiragem.toUpperCase()}</dt>
                <dd>{item.tiragem || '—'}</dd>
              </div>
            </dl>
            <div className="cpills">
              <span className="cp on">{t.colecao.notSale}</span>
              <button
                type="button"
                className="cp"
                onClick={e => {
                  e.stopPropagation();
                  onExplore(item.id);
                }}
              >
                {t.explore.tag.toUpperCase()} →
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function Colecao({ t, lang, items, onExplore }) {
  const all = useMemo(() => items.filter(i => i.tipo === 'colecao').sort((a, b) => a.n - b.n), [items]);
  const opts = useMemo(() => options(all), [all]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState(EMPTY_FILTER);
  const [shown, setShown] = useState(STEP);
  const [open, setOpen] = useState(null);
  const list = useMemo(() => applyFilters(all, q, filter), [all, q, filter]);

  const setQ2 = v => {
    setQ(v);
    setShown(STEP);
  };
  const setFilter2 = v => {
    setFilter(v);
    setShown(STEP);
  };

  return (
    <section className="sec" id="colecao">
      <div className="wrap">
        <span className="tag">{t.colecao.tag}</span>
        <h2 className="title">{t.colecao.title}</h2>
        {all.length ? (
          <div style={{ marginTop: 18 }}>
            <FilterBar t={t} lang={lang} q={q} setQ={setQ2} filter={filter} setFilter={setFilter2} opts={opts} />
          </div>
        ) : null}
        {!all.length ? (
          <p className="empty-msg">{t.colecao.none}</p>
        ) : !list.length ? (
          <p className="empty-msg">{t.colecao.empty}</p>
        ) : (
          <>
            <div className="cgrid">
              {list.slice(0, shown).map(item => (
                <ColCard key={item.id} item={item} t={t} open={open === item.id} setOpen={setOpen} onExplore={onExplore} />
              ))}
            </div>
            {list.length > shown ? (
              <div className="more">
                <button type="button" className="ghost" onClick={() => setShown(s => s + STEP)}>
                  {t.colecao.more} ({list.length - shown})
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
