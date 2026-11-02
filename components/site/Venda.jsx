'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { EMPTY_FILTER, applyFilters, options } from '@/lib/filters';
import FilterBar from './FilterBar';
import SaleCard from './SaleCard';

const ORDER = { disponivel: 0, encomenda: 1, reservado: 2, vendido: 3 };

export default function Venda({ t, lang, items, ig }) {
  const all = useMemo(
    () => items.filter(i => i.tipo === 'venda').sort((a, b) => ORDER[a.status] - ORDER[b.status] || b.n - a.n),
    [items]
  );
  const opts = useMemo(() => options(all), [all]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState(EMPTY_FILTER);
  const list = useMemo(() => applyFilters(all, q, filter), [all, q, filter]);

  const track = useRef(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const calc = () => {
      const n = Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
      setPages(n);
      setPage(Math.min(n - 1, Math.round(el.scrollLeft / el.clientWidth)));
    };
    el.scrollLeft = 0;
    calc();
    el.addEventListener('scroll', calc, { passive: true });
    addEventListener('resize', calc);
    return () => {
      el.removeEventListener('scroll', calc);
      removeEventListener('resize', calc);
    };
  }, [list.length]);

  const go = i => track.current?.scrollTo({ left: i * track.current.clientWidth, behavior: 'smooth' });

  return (
    <section className="sec" id="venda">
      <div className="wrap">
        <span className="tag">{t.venda.tag}</span>
        <div className="sec-head">
          <h2 className="title">{t.venda.title}</h2>
          {all.length ? <FilterBar t={t} lang={lang} q={q} setQ={setQ} filter={filter} setFilter={setFilter} opts={opts} /> : null}
        </div>
        {!all.length ? (
          <p className="empty-msg">{t.venda.none}</p>
        ) : !list.length ? (
          <p className="empty-msg">{t.venda.empty}</p>
        ) : (
          <>
            <div className="track" ref={track}>
              {list.map(item => (
                <SaleCard key={item.id} item={item} t={t} ig={ig} />
              ))}
            </div>
            {pages > 1 ? (
              <div className="dots">
                {Array.from({ length: pages }, (_, i) => (
                  <button key={i} type="button" aria-label={t.card.page(i + 1)} aria-current={i === page ? 'true' : undefined} onClick={() => go(i)} />
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
