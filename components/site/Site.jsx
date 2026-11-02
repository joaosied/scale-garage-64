'use client';

import { useEffect, useMemo, useState } from 'react';
import { T } from '@/lib/i18n';
import Header from './Header';
import HeroScroll from './HeroScroll';
import Stats from './Stats';
import Venda from './Venda';
import Importacao from './Importacao';
import Estante from './Estante';
import Colecao from './Colecao';
import Explore from './Explore';
import Footer from './Footer';

const LANG_KEY = 'sg64_lang';

export default function Site({ items, brands, settings }) {
  const [lang, setLang] = useState('pt');
  const [exploreId, setExploreId] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === 'en' || saved === 'pt') setLang(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
  }, [lang]);

  const toggleLang = () => {
    const next = lang === 'pt' ? 'en' : 'pt';
    setLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {}
  };

  const t = T[lang];
  const ig = settings.instagram;

  const heroItem = useMemo(
    () => items.find(i => i.id === settings.hero_id && i.img) || items.find(i => i.img) || null,
    [items, settings.hero_id]
  );

  const openExplore = id => {
    setExploreId({ id, k: Date.now() });
    document.getElementById('explorar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Header t={t} ig={ig} onLang={toggleLang} />
      <main id="topo">
        <HeroScroll t={t} lang={lang} settings={settings} item={heroItem} ig={ig} />
        <Stats t={t} count={items.length} desde={settings.desde} />
        <Venda t={t} lang={lang} items={items} ig={ig} onExplore={openExplore} />
        <Importacao t={t} lang={lang} brands={brands} settings={settings} ig={ig} />
        <Estante t={t} lang={lang} items={items} ig={ig} onExplore={openExplore} />
        <Colecao t={t} lang={lang} items={items} onExplore={openExplore} />
        <Explore t={t} lang={lang} items={items} ig={ig} selectedId={exploreId} defaultItem={heroItem} />
      </main>
      <Footer t={t} ig={ig} />
    </>
  );
}
