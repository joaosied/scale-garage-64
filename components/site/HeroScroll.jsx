'use client';

import { useEffect, useRef, useState } from 'react';
import { igProfile } from '@/lib/i18n';

// Posicao do carro em cada ponto do scroll (x/y em vw/vh, s = escala, ry/rz em graus)
const K = [
  { p: 0.0, x: -3, y: 4, s: 0.94, ry: 12, rz: 0 },
  { p: 0.24, x: -4, y: 4, s: 0.96, ry: 10, rz: 0 },
  { p: 0.42, x: -6, y: 6, s: 1.0, ry: 0, rz: 0 },
  { p: 0.58, x: -7, y: 6, s: 1.01, ry: -2, rz: 0 },
  { p: 0.76, x: -12, y: 3, s: 1.08, ry: -14, rz: -1.5 },
  { p: 1.0, x: -13, y: 2, s: 1.1, ry: -16, rz: -2 }
];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ss = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

function sample(p) {
  let i = 0;
  while (i < K.length - 2 && p > K[i + 1].p) i++;
  const a = K[i];
  const b = K[i + 1];
  const t = ss(0, 1, (p - a.p) / (b.p - a.p));
  const o = {};
  for (const k of ['x', 'y', 's', 'ry', 'rz']) o[k] = lerp(a[k], b[k], t);
  return o;
}

function act(i, p) {
  const local = (p - i / 3) * 3;
  const inn = i === 0 ? 1 : ss(-0.1, 0.08, local);
  const out = i === 2 ? 1 : 1 - ss(0.92, 1.1, local);
  return { v: inn * out, inn, out };
}

export default function HeroScroll({ t, lang, settings, item, ig }) {
  const heroRef = useRef(null);
  const stageRef = useRef(null);
  const carRef = useRef(null);
  const kickerRef = useRef(null);
  const aboutRef = useRef(null);
  const bigRefs = useRef([]);
  const panelRefs = useRef([]);
  const fillRefs = useRef([]);
  const hintRef = useRef(null);
  const giroRef = useRef(null);
  const needleRef = useRef(null);
  const pctRef = useRef(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    const car = carRef.current;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let target = 0;
    let cur = 0;
    let raf = 0;
    let last = -1;

    // o nome ocupa o espaco livre a esquerda da caixa "sobre", sem passar por baixo dela
    const fit = () => {
      const mobile = innerWidth < 720;
      const gut = kickerRef.current.offsetLeft;
      const room = stage.clientWidth - gut * 2 - (mobile ? 0 : aboutRef.current.offsetWidth + 40);
      bigRefs.current.forEach(el => {
        el.style.fontSize = '100px';
        const fs = Math.min((100 * room) / el.scrollWidth, innerWidth * 0.26, 420);
        el.style.fontSize = fs + 'px';
      });
    };

    const render = p => {
      const kx = innerWidth < 720 ? 0.4 : 1;
      const c = sample(p);
      car.style.transform = `translate(-50%,-50%) translate(${c.x * kx}vw,${c.y}vh) rotateY(${c.ry}deg) rotateZ(${c.rz}deg) scale(${c.s})`;
      stage.style.setProperty('--gx', 50 + c.x * kx + '%');

      bigRefs.current.forEach((el, i) => {
        const a = act(i, p);
        el.style.opacity = a.v;
        el.style.transform = `translate(${-p * 2}vw, ${(1 - a.inn) * 70 - (1 - a.out) * 70}px)`;
      });
      panelRefs.current.forEach((el, i) => {
        const a = act(i, p);
        el.style.opacity = a.v;
        el.style.transform = `translateY(${(1 - a.inn) * 14 - (1 - a.out) * 14}px)`;
        el.style.pointerEvents = a.v > 0.5 ? 'auto' : 'none';
        el.setAttribute('aria-hidden', a.v > 0.5 ? 'false' : 'true');
      });

      const now = p < 1 / 3 ? 0 : p < 2 / 3 ? 1 : 2;
      if (now !== last) {
        last = now;
        setStep(now);
      }
      fillRefs.current.forEach((f, i) => {
        f.style.transform = `scaleX(${clamp((p - i / 3) * 3)})`;
      });
      const g = Math.round(p * 180);
      giroRef.current.textContent = g + '°';
      needleRef.current.style.transform = `rotate(${-120 + (g / 180) * 240}deg)`;
      pctRef.current.textContent = `scroll (${Math.round(p * 100)}%)`;
      hintRef.current.style.opacity = 1 - ss(0.01, 0.06, p);
    };

    const tick = () => {
      raf = 0;
      cur = reduce ? target : cur + (target - cur) * 0.12;
      if (Math.abs(target - cur) < 0.0004) cur = target;
      render(cur);
      if (cur !== target) raf = requestAnimationFrame(tick);
    };

    const measure = () => {
      const total = hero.offsetHeight - innerHeight;
      target = clamp(-hero.getBoundingClientRect().top / total);
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      fit();
      measure();
    };

    addEventListener('scroll', measure, { passive: true });
    addEventListener('resize', onResize);
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    measure();
    cur = target;
    render(cur);

    return () => {
      removeEventListener('scroll', measure);
      removeEventListener('resize', onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const goTo = i => {
    const hero = heroRef.current;
    const total = hero.offsetHeight - innerHeight;
    const top = hero.getBoundingClientRect().top + scrollY;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollTo({ top: top + total * (i / 3 + 1 / 6), behavior: reduce ? 'auto' : 'smooth' });
  };

  const sobre = settings.sobre;
  const k = lang === 'en' ? 'en' : 'pt';
  const words = ['SCALE', 'GARAGE', '64'];

  return (
    <section className="hero" ref={heroRef} aria-label="Scale Garage 64">
      <div className="stage" ref={stageRef}>
        <div className="kicker" ref={kickerRef}>
          <b>{t.hero.about}</b>
          <span>{t.hero.kicker}</span>
        </div>

        {words.map((w, i) => (
          <div
            key={w}
            className={'big' + (i === 2 ? ' red' : '')}
            aria-hidden="true"
            style={i ? { opacity: 0 } : undefined}
            ref={el => (bigRefs.current[i] = el)}
          >
            {w}
          </div>
        ))}
        <h1 className="sr-only">Scale Garage 64</h1>

        <div className="car" ref={carRef}>
          <span className="floor" />
          {item?.img ? <img src={item.img} alt={item.nome} /> : null}
        </div>

        <aside className="about" ref={aboutRef}>
          <h3>
            <span>{t.hero.titles[step]}</span>
          </h3>
          <div className="about-body">
            {sobre.map((s, i) => (
              <div className="panel" key={i} style={i ? { opacity: 0 } : undefined} ref={el => (panelRefs.current[i] = el)}>
                <h2>{s['t_' + k] || s.t_pt}</h2>
                <p>{s['p_' + k] || s.p_pt}</p>
                {i === 1 ? (
                  <div className="chips">
                    {['JP', 'CN', 'US'].map((c, j) => (
                      <span key={c}>
                        <b>{c}</b>
                        {t.hero.origins[j]}
                      </span>
                    ))}
                  </div>
                ) : null}
                {i === 2 ? (
                  <div className="acts">
                    <a className="hbtn fill" href="#venda">
                      {t.hero.seeSale} <span aria-hidden="true">→</span>
                    </a>
                    <a className="hbtn out" href={igProfile(ig)} target="_blank" rel="noopener noreferrer">
                      INSTAGRAM
                    </a>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </aside>

        <div className="hint" aria-hidden="true" ref={hintRef}>
          {t.hero.hint}
        </div>

        <div className="hbottom">
          <div className="gauge">
            <svg viewBox="0 0 46 46" aria-hidden="true">
              <circle cx="23" cy="23" r="21.5" fill="none" stroke="rgba(242,242,242,.28)" strokeWidth="1" />
              <circle cx="23" cy="23" r="17" fill="none" stroke="rgba(242,242,242,.4)" strokeWidth="2" strokeDasharray="1 4.3" />
              <line ref={needleRef} className="needle" x1="23" y1="23" x2="23" y2="9" stroke="#D92B26" strokeWidth="2" strokeLinecap="round" />
              <circle cx="23" cy="23" r="2.5" fill="#F2F2F2" />
            </svg>
            <div>
              <div className="giro">
                {t.hero.turn}
                <b ref={giroRef}>0°</b>
              </div>
              <div className="htabs">
                {t.hero.tabs.map((label, i) => (
                  <button key={i} className={'htab' + (step === i ? ' on' : '')} type="button" onClick={() => goTo(i)}>
                    {label}
                    <span className="fill" ref={el => (fillRefs.current[i] = el)} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="pct" ref={pctRef}>
            scroll (0%)
          </div>
        </div>

        <div className="grain" aria-hidden="true" />
      </div>
    </section>
  );
}
