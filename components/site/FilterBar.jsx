'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { FilterIcon, SearchIcon } from './Icons';

export default function FilterBar({ t, lang, q, setQ, filter, setFilter, opts }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const id = useId();
  const total = filter.marca.length + filter.cor.length + filter.origem.length;

  useEffect(() => {
    if (!open) return;
    const onDown = e => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    const onKey = e => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = (key, v) =>
    setFilter(f => ({ ...f, [key]: f[key].includes(v) ? f[key].filter(x => x !== v) : [...f[key], v] }));

  const groups = [
    { key: 'marca', label: t.filter.brand, values: opts.marca, show: v => v },
    { key: 'cor', label: t.filter.color, values: opts.cor, show: v => v },
    { key: 'origem', label: t.filter.origin, values: opts.origem, show: v => t.origem(v) }
  ].filter(g => g.values.length);

  return (
    <div className="fbar" ref={box}>
      <label className="search">
        <span className="sr-only">{t.searchLabel}</span>
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={t.search} />
        <SearchIcon />
      </label>
      <button
        className="fbtn"
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={t.filter.open + (total ? ` (${t.filter.count(total)})` : '')}
        onClick={() => setOpen(o => !o)}
      >
        <FilterIcon />
        {total ? <span className="badge">{total}</span> : null}
      </button>
      {open ? (
        <>
          <div className="fpop-scrim" onClick={() => setOpen(false)} />
          <div className="fpop" id={id} role="dialog" aria-label={t.filter.open}>
            {groups.map(g => (
              <div className="fgroup" key={g.key}>
                <span>{g.label}</span>
                <div className="fchips">
                  {g.values.map(v => (
                    <button
                      key={v}
                      type="button"
                      className="fchip"
                      aria-pressed={filter[g.key].includes(v)}
                      onClick={() => toggle(g.key, v)}
                    >
                      {g.show(v)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="ffoot">
              <button type="button" className="lbtn" onClick={() => setFilter({ marca: [], cor: [], origem: [] })}>
                {t.filter.clear}
              </button>
              <button type="button" className="rbtn" onClick={() => setOpen(false)}>
                {t.filter.apply}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
