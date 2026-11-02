'use client';

import { useEffect, useRef, useState } from 'react';

export default function Stats({ t, count, desde }) {
  const ref = useRef(null);
  const [n, setN] = useState(count);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches || count < 2) return;
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = Math.min(1600, 500 + count * 12);
        const step = now => {
          const p = Math.min(1, (now - start) / dur);
          setN(Math.round(count * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [count]);

  return (
    <div className="stats" ref={ref}>
      <span>
        <b aria-hidden="true">{n}</b>
        <span className="sr-only">{count}</span> {t.stats.minis(count)}
      </span>
      {desde ? (
        <>
          <i aria-hidden="true" />
          <span>
            {t.stats.since} <b>{desde}</b>
          </span>
        </>
      ) : null}
    </div>
  );
}
