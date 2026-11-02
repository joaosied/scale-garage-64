'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_SETTINGS } from '@/lib/seed';
import { api } from './api';
import ItemsView from './ItemsView';
import ItemDrawer from './ItemDrawer';
import HighlightsView from './HighlightsView';
import BrandsView from './BrandsView';
import TextsView from './TextsView';

const VIEWS = [
  { id: 'itens', label: 'Miniaturas' },
  { id: 'destaques', label: 'Destaques' },
  { id: 'marcas', label: 'Marcas' },
  { id: 'textos', label: 'Textos do site' }
];

export default function AdminApp({ initial, dbReady, loadError }) {
  const [view, setView] = useState('itens');
  const [items, setItems] = useState(initial.items);
  const [brands, setBrands] = useState(initial.brands);
  const [settings, setSettings] = useState(initial.settings || DEFAULT_SETTINGS);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const toastTimer = useRef(0);

  const notify = useCallback((msg, bad = false) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, bad });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const confirm = useCallback(
    opts =>
      new Promise(resolve => {
        setDialog({ ...opts, resolve });
      }),
    []
  );

  const closeDialog = ok => {
    dialog?.resolve(ok);
    setDialog(null);
  };

  useEffect(() => {
    if (!dialog) return;
    const onKey = e => e.key === 'Escape' && closeDialog(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const counts = useMemo(
    () => ({ itens: items.length, destaques: items.filter(i => i.estante).length, marcas: brands.length }),
    [items, brands]
  );

  const saveItem = saved => {
    setItems(list => {
      const i = list.findIndex(x => x.id === saved.id);
      if (i < 0) return [saved, ...list];
      const copy = list.slice();
      copy[i] = saved;
      return copy;
    });
  };

  const removeItem = async item => {
    const ok = await confirm({
      title: `Excluir “${item.nome}”?`,
      text: 'Ela sai do site na hora, junto com a foto. O número dela no catálogo não volta a ser usado.',
      yes: 'Excluir'
    });
    if (!ok) return;
    try {
      await api(`/api/admin/items/${item.id}`, 'DELETE');
      setItems(list => list.filter(x => x.id !== item.id));
      notify('Miniatura excluída.');
    } catch (e) {
      notify(e.message, true);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
    location.href = '/admin/login';
  };

  const shared = { items, setItems, brands, setBrands, settings, setSettings, notify, confirm };

  return (
    <div className="a-app">
      <aside className="a-side">
        <div className="a-logo">
          <b>
            SG<em>64</em>
          </b>
          <span>ADMIN</span>
        </div>
        <nav className="a-nav" aria-label="Seções do admin">
          {VIEWS.map(v => (
            <button key={v.id} type="button" aria-current={view === v.id ? 'page' : undefined} onClick={() => setView(v.id)}>
              {v.label}
              {counts[v.id] != null ? <span className="a-count">{counts[v.id]}</span> : null}
            </button>
          ))}
        </nav>
        <div className="a-sidefoot">
          <a href="/" target="_blank" rel="noopener noreferrer">
            Ver o site ↗
          </a>
          <button type="button" onClick={logout}>
            Sair
          </button>
          <span>As mudanças aparecem no site em alguns segundos.</span>
        </div>
      </aside>

      <main className="a-main">
        {!dbReady ? (
          <div className="a-warn">
            O banco de dados ainda não está ligado. Você está vendo as miniaturas de exemplo e nada vai ser salvo. Coloque
            SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel (passo a passo no README).
          </div>
        ) : null}
        {loadError ? (
          <div className="a-warn">
            Não deu pra carregar os dados: {loadError}. Confira se você rodou o arquivo supabase/schema.sql no Supabase.
          </div>
        ) : null}

        {view === 'itens' ? (
          <ItemsView {...shared} onNew={() => setEditing({})} onEdit={setEditing} onDelete={removeItem} />
        ) : null}
        {view === 'destaques' ? <HighlightsView {...shared} /> : null}
        {view === 'marcas' ? <BrandsView {...shared} /> : null}
        {view === 'textos' ? <TextsView {...shared} /> : null}
      </main>

      {editing ? (
        <ItemDrawer
          item={editing.id ? editing : null}
          brands={brands}
          nextNumber={items.reduce((m, i) => Math.max(m, i.n || 0), 0) + 1}
          onClose={() => setEditing(null)}
          onSaved={saved => {
            saveItem(saved);
            setEditing(null);
            notify(editing.id ? 'Miniatura atualizada.' : `Miniatura nº ${String(saved.n).padStart(2, '0')} cadastrada.`);
          }}
        />
      ) : null}

      {dialog ? (
        <div className="a-dlg" onClick={e => e.target === e.currentTarget && closeDialog(false)}>
          <div className="a-box" role="alertdialog" aria-modal="true" aria-labelledby="dlg-t">
            <h3 id="dlg-t">{dialog.title}</h3>
            {dialog.text ? <p>{dialog.text}</p> : null}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="a-btn ghost" type="button" onClick={() => closeDialog(false)} autoFocus>
                Cancelar
              </button>
              <button className="a-btn red" type="button" onClick={() => closeDialog(true)}>
                {dialog.yes || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className={'a-toast' + (toast.bad ? ' bad' : '')} role="status">
          {toast.msg}
        </div>
      ) : null}
    </div>
  );
}
