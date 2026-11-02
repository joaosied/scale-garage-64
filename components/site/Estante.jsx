'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { STATUS_COLOR, igDirect, subLine } from '@/lib/i18n';

export default function Estante({ t, lang, items, ig, onExplore }) {
  const list = useMemo(
    () =>
      items
        .filter(i => i.estante && i.img)
        .sort((a, b) => (a.ordem_estante ?? 9999) - (b.ordem_estante ?? 9999) || a.n - b.n),
    [items]
  );
  const [current, setCurrent] = useState(null);
  const [takenId, setTakenId] = useState(null);
  const pImg = useRef(null);
  const closeBtn = useRef(null);
  const slots = useRef({});

  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  const flip = (fromEl, toEl, reverse, done) => {
    if (!fromEl || !toEl || reduce() || !toEl.animate) return done && done();
    const a = fromEl.getBoundingClientRect();
    const z = toEl.getBoundingClientRect();
    if (!z.width) return done && done();
    const tr = `translate(${a.left - z.left}px,${a.top - z.top}px) scale(${a.width / z.width})`;
    const anim = toEl.animate(reverse ? [{ transform: 'none' }, { transform: tr }] : [{ transform: tr }, { transform: 'none' }], {
      duration: 520,
      easing: 'cubic-bezier(.2,.8,.2,1)'
    });
    anim.onfinish = () => done && done();
  };

  const takeOut = item => {
    setCurrent(item);
    setTakenId(item.id);
  };

  useEffect(() => {
    if (!current) return;
    const slot = slots.current[current.id];
    const img = pImg.current;
    const run = () => {
      flip(slot?.querySelector('img'), img, false);
      closeBtn.current?.focus({ preventScroll: true });
    };
    if (img.complete) requestAnimationFrame(run);
    else img.onload = () => requestAnimationFrame(run);
  }, [current]);

  const putBack = () => {
    if (!current) return;
    const slot = slots.current[current.id];
    const img = slot?.querySelector('img');
    setTakenId(null);
    if (img) img.style.visibility = 'hidden';
    flip(img, pImg.current, true, () => {
      setCurrent(null);
      if (img) img.style.visibility = '';
      slot?.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && current && putBack();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const c = current;
  const stKey = c ? (c.tipo === 'colecao' ? 'colecao' : c.status) : null;

  return (
    <section className="sec" id="estante">
      <div className="wrap">
        <span className="tag">{t.estante.tag}</span>
        <h2 className="title">{t.estante.title}</h2>
        <p className="sec-sub">{t.estante.sub}</p>
        {!list.length ? (
          <p className="empty-msg">{t.estante.empty}</p>
        ) : (
          <div className="case-wrap">
            <div className="case">
              <span className="led" />
              <div className="shelves">
                {list.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    className={'slot' + (takenId === item.id ? ' taken' : '')}
                    aria-label={`${t.estante.take} ${item.nome}`}
                    ref={el => (slots.current[item.id] = el)}
                    onClick={() => takeOut(item)}
                  >
                    <span className="cone" />
                    <span className="car-box">
                      <img src={item.img} alt="" loading="lazy" />
                    </span>
                    <span className="plate">{item.nome.toUpperCase()}</span>
                  </button>
                ))}
                <div className="slot free" aria-hidden="true">
                  <span className="car-box">
                    <span className="v">
                      {t.estante.free[0]}
                      <br />
                      {t.estante.free[1]}
                    </span>
                  </span>
                </div>
              </div>
              <span className="glass" />
            </div>

            <div className={'pick' + (c ? ' on' : '')} role="dialog" aria-modal="false" aria-label={c ? c.nome : ''} aria-hidden={!c}>
              <button className="close" type="button" ref={closeBtn} onClick={putBack} aria-label={t.estante.backLabel} tabIndex={c ? 0 : -1}>
                ×
              </button>
              <div className="pimg">
                <span className="floor" />
                <img ref={pImg} src={c?.img || list[0].img} alt={c ? c.nome : ''} />
              </div>
              {c ? (
                <div className="pinfo">
                  <span className="pill" style={{ '--c': STATUS_COLOR[stKey] }}>
                    <i />
                    {t.status[stKey]}
                  </span>
                  <h3 className="name">{c.nome.toUpperCase()}</h3>
                  <p className="sub">{subLine(c) || '1:64'}</p>
                  <dl className="spec">
                    {c.marca ? (
                      <>
                        <dt>{t.spec.marca}</dt>
                        <dd>{c.marca}</dd>
                      </>
                    ) : null}
                    <dt>{t.spec.origem}</dt>
                    <dd>{t.origem(c.origem)}</dd>
                    <dt>{t.spec.escala}</dt>
                    <dd>1:64</dd>
                  </dl>
                  <div className="row">
                    {c.tipo === 'venda' && c.status !== 'vendido' ? (
                      <a className="cta" href={igDirect(ig)} target="_blank" rel="noopener noreferrer">
                        {t.card.interest} <span aria-hidden="true">↗</span>
                      </a>
                    ) : null}
                    <button className="ghost" type="button" onClick={() => {
                        setCurrent(null);
                        setTakenId(null);
                        onExplore(c.id);
                      }}>
                      {t.explore.tag.toUpperCase()} →
                    </button>
                    <button className="ghost" type="button" onClick={putBack}>
                      {t.estante.back}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
