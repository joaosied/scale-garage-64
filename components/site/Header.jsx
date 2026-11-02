'use client';

import { useEffect, useState } from 'react';
import { igProfile } from '@/lib/i18n';
import { GlobeIcon } from './Icons';

const LINKS = [
  { id: 'topo', key: 'home', opt: true },
  { id: 'venda', key: 'venda' },
  { id: 'colecao', key: 'colecao' },
  { id: 'explorar', key: 'explore' }
];

export default function Header({ t, ig, onLang }) {
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState('topo');

  useEffect(() => {
    const onScroll = () => {
      setSolid(scrollY > innerHeight * 1.2);
      let cur = 'topo';
      for (const l of LINKS) {
        const el = document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = l.id;
      }
      setActive(cur);
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={'hdr' + (solid ? ' solid' : '')}>
      <a className="hdr-ig" href={igProfile(ig)} target="_blank" rel="noopener noreferrer">
        {t.instagram}
      </a>
      <nav className="hdr-nav" aria-label="Menu">
        {LINKS.map(l => (
          <a key={l.id} href={'#' + l.id} className={l.opt ? 'opt' : undefined} aria-current={active === l.id ? 'true' : undefined}>
            {t.nav[l.key]}
          </a>
        ))}
      </nav>
      <button className="hdr-lang" type="button" onClick={onLang} aria-label={t.langLabel}>
        <GlobeIcon />
        <span>{t.lang}</span>
      </button>
    </header>
  );
}
