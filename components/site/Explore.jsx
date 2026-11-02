'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { STATUS_COLOR, desc, igDirect, subLine } from '@/lib/i18n';
import { haystack, norm } from '@/lib/filters';
import { SearchIcon } from './Icons';

const ZOOM = 2.5;

export default function Explore({ t, lang, items, ig, selectedId, defaultItem }) {
  const pool = useMemo(() => items.filter(i => i.img).sort((a, b) => a.n - b.n), [items]);
  const [curId, setCurId] = useState(defaultItem?.id ?? pool[0]?.id ?? null);
  const item = pool.find(i => i.id === curId) || pool[0] || null;

  const [q, setQ] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const [focus, setFocus] = useState(0);
  const [lupa, setLupa] = useState(true);
  const listId = useId();

  const stage = useRef(null);
  const img = useRef(null);
  const tilt = useRef(null);
  const loupe = useRef(null);
  const pickBox = useRef(null);

  useEffect(() => {
    if (selectedId?.id != null) setCurId(selectedId.id);
  }, [selectedId]);

  useEffect(() => {
    setFocus(0);
  }, [curId]);

  useEffect(() => {
    if (!listOpen) return;
    const onDown = e => pickBox.current && !pickBox.current.contains(e.target) && setListOpen(false);
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [listOpen]);

  const matches = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    return pool.filter(i => {
      if (!words.length) return true;
      const h = haystack(i);
      return words.every(w => h.includes(w));
    });
  }, [pool, q]);

  const choose = i => {
    setCurId(i.id);
    setQ('');
    setListOpen(false);
  };

  const onKey = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setListOpen(true);
      setHi(h => Math.min(matches.length - 1, h + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHi(h => Math.max(0, h - 1));
    } else if (e.key === 'Enter') {
      if (listOpen && matches[hi]) {
        e.preventDefault();
        choose(matches[hi]);
      }
    } else if (e.key === 'Escape') {
      setListOpen(false);
    }
  };

  if (!item) return null;

  const k = lang === 'en' ? 'en' : 'pt';
  const description = desc(item, lang);
  const details = [
    { n: t.explore.whole, title: t.explore.wholeT, u: 0.5, v: 0.5, z: 1 },
    ...item.detalhes.map(d => ({ n: (d[k] || d.pt || '').toUpperCase(), title: (d[k] || d.pt || '').toUpperCase(), u: d.x, v: d.y, z: ZOOM }))
  ];
  const d = details[Math.min(focus, details.length - 1)];
  const focusStyle = d.z === 1 ? undefined : { transform: `scale(${d.z}) translate(${(0.5 - d.u) * 100}%, ${(0.5 - d.v) * 100}%)` };
  const stKey = item.tipo === 'colecao' ? 'colecao' : item.status;

  const onMove = e => {
    if (e.pointerType === 'touch') return;
    const s = stage.current.getBoundingClientRect();
    const x = (e.clientX - s.left) / s.width;
    const y = (e.clientY - s.top) / s.height;
    tilt.current.style.transform = `rotateY(${(x - 0.5) * 16}deg) rotateX(${-(y - 0.5) * 10}deg)`;
    const L = loupe.current;
    if (!lupa) return;
    const r = img.current.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    if (px < 0 || py < 0 || px > r.width || py > r.height) {
      L.style.display = 'none';
      return;
    }
    const Z = 2.2;
    L.style.display = 'block';
    const R = L.offsetWidth / 2 || 90;
    L.style.left = e.clientX - s.left - R + 'px';
    L.style.top = e.clientY - s.top - R + 'px';
    L.style.backgroundSize = `${r.width * Z}px ${r.height * Z}px`;
    L.style.backgroundPosition = `${-(px * Z - R)}px ${-(py * Z - R)}px`;
  };
  const onLeave = () => {
    if (tilt.current) tilt.current.style.transform = '';
    if (loupe.current) loupe.current.style.display = 'none';
  };

  const real = item.comp;
  const mini = real ? Math.round(real / 64) : null;

  return (
    <section className="sec" id="explorar">
      <div className="wrap">
        <span className="tag">{t.explore.tag}</span>
        <div className="sec-head">
          <h2 className="title">{t.explore.title}</h2>
          <div className="xpick" ref={pickBox}>
            <label className="search">
              <span className="sr-only">{t.explore.pick}</span>
              <input
                type="text"
                role="combobox"
                aria-expanded={listOpen}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={listOpen && matches[hi] ? `${listId}-${matches[hi].id}` : undefined}
                value={q}
                placeholder={t.explore.pick}
                onChange={e => {
                  setQ(e.target.value);
                  setHi(0);
                  setListOpen(true);
                }}
                onFocus={() => setListOpen(true)}
                onKeyDown={onKey}
              />
              <SearchIcon />
            </label>
            {listOpen ? (
              <ul className="xlist" id={listId} role="listbox">
                {matches.length ? (
                  matches.map((i, idx) => (
                    <li
                      key={i.id}
                      id={`${listId}-${i.id}`}
                      role="option"
                      aria-selected={idx === hi}
                      onMouseEnter={() => setHi(idx)}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => choose(i)}
                    >
                      <img src={i.img} alt="" />
                      <div>
                        <b>{i.nome}</b>
                        <span>{subLine(i) || t.status[i.tipo === 'colecao' ? 'colecao' : i.status]}</span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="none" role="option" aria-selected="false">
                    {t.explore.noResults}
                  </li>
                )}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="xgrid">
          <div className="xview">
            <div className="vstage" ref={stage} onPointerMove={onMove} onPointerLeave={onLeave}>
              <div className="vpos">
                <div className="vfocus" style={focusStyle}>
                  <div className="vtilt" ref={tilt}>
                    <span className="floor" />
                    <img ref={img} src={item.img} alt={item.nome} />
                  </div>
                </div>
              </div>
              <div className="loupe" ref={loupe} style={{ backgroundImage: `url("${item.img}")` }} />
              <div className="vcap">
                <b>{d.title}</b>
                <span>{d.z === 1 ? [item.nome, subLine(item)].filter(Boolean).join(' · ') : item.nome}</span>
              </div>
              <button
                className="ghost lupa-t"
                type="button"
                aria-pressed={lupa}
                onClick={() => {
                  setLupa(v => !v);
                  if (loupe.current) loupe.current.style.display = 'none';
                }}
              >
                {t.explore.loupe}
              </button>
            </div>
            {details.length > 1 ? (
              <div className="thumbs">
                {details.map((x, i) => (
                  <button key={i} className="thumb" type="button" aria-pressed={i === focus} onClick={() => setFocus(i)}>
                    <span
                      className="tv"
                      style={{
                        backgroundImage: `url("${item.img}")`,
                        backgroundSize: `${(x.z === 1 ? 1 : 2.4) * 100}% auto`,
                        backgroundPosition: `${x.u * 100}% ${x.v * 100}%`
                      }}
                    />
                    <span>{x.n}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="xinfo">
            <span className="pill" style={{ '--c': STATUS_COLOR[stKey], justifySelf: 'start' }}>
              <i />
              {t.status[stKey]}
            </span>
            <div>
              <h3 className="name">{item.nome.toUpperCase()}</h3>
              {item.linha ? <p className="sub">{item.linha}</p> : null}
            </div>
            {description ? <p className="d">{description}</p> : null}
            <dl className="spec">
              {[
                ['marca', item.marca],
                ['montadora', item.montadora],
                ['cor', item.cor],
                ['ano', item.ano],
                ['tiragem', item.tiragem],
                ['origem', t.origem(item.origem)],
                ['escala', '1:64'],
                ['tamanho', mini ? t.spec.size(mini, real.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR')) : null],
                ['tipo', item.tipo === 'colecao' ? t.spec.colecao : t.spec.venda]
              ]
                .filter(([, v]) => v)
                .map(([key, v]) => (
                  <div key={key} style={{ display: 'contents' }}>
                    <dt>{t.spec[key]}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>
            {item.tipo === 'venda' && item.status !== 'vendido' ? (
              <a className="cta" href={igDirect(ig)} target="_blank" rel="noopener noreferrer" style={{ justifySelf: 'start' }}>
                {t.card.interest} <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </aside>
        </div>
        <p className="xhint">{t.explore.hint}</p>
      </div>
    </section>
  );
}
