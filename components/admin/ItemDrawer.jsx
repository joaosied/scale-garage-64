'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { STATUS_COLOR, T } from '@/lib/i18n';
import SaleCard from '@/components/site/SaleCard';
import { ColCard } from '@/components/site/Colecao';
import { api, upload } from './api';
import { prepImage } from './image';
import { Close, Trash } from './Icons';
import { STATUS } from './ItemsView';

const OTHER = '__outra';
const EMPTY = {
  nome: '',
  montadora: '',
  linha: '',
  marca: '',
  cor: '',
  ano: '',
  tiragem: '',
  origem: 'Japão',
  tipo: 'venda',
  status: 'disponivel',
  novo: false,
  estante: true,
  descricao_pt: '',
  descricao_en: '',
  comp: '',
  img: null,
  detalhes: []
};

function Toggle({ label, help, checked, onChange }) {
  return (
    <label className="a-toggle">
      <span>
        <b>{label}</b>
        <small>{help}</small>
      </span>
      <span className="a-sw">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span />
      </span>
    </label>
  );
}

export default function ItemDrawer({ item, brands, nextNumber, onClose, onSaved }) {
  const [f, setF] = useState(() => {
    const base = { ...EMPTY, ...(item || {}) };
    for (const k of ['ano', 'comp']) base[k] = base[k] == null ? '' : String(base[k]);
    base.detalhes = (base.detalhes || []).map(d => ({ ...d }));
    return base;
  });
  const brandNames = useMemo(() => brands.map(b => b.nome), [brands]);
  const [marcaSel, setMarcaSel] = useState(() => (!f.marca ? '' : brandNames.includes(f.marca) ? f.marca : OTHER));
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(item?.img || null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [badName, setBadName] = useState(false);
  const [pvMode, setPvMode] = useState('normal');
  const nameRef = useRef(null);
  const ptsRef = useRef(null);

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = e => e.key === 'Escape' && !busy && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => preview?.startsWith('blob:') && URL.revokeObjectURL(preview), [preview]);

  const pickFile = async e => {
    const fl = e.target.files?.[0];
    e.target.value = '';
    if (!fl) return;
    setErr('');
    try {
      const blob = await prepImage(fl, { max: 1600 });
      setFile(blob);
      setPreview(URL.createObjectURL(blob));
      if (f.detalhes.length) set('detalhes', []);
    } catch (e2) {
      setErr(e2.message);
    }
  };

  const addPoint = e => {
    if (f.detalhes.length >= 12) return;
    const r = ptsRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 1000) / 1000;
    const y = Math.round(((e.clientY - r.top) / r.height) * 1000) / 1000;
    set('detalhes', [...f.detalhes, { x, y, pt: '', en: '' }]);
  };
  const setPoint = (i, k, v) => set('detalhes', f.detalhes.map((d, j) => (j === i ? { ...d, [k]: v } : d)));
  const delPoint = i => set('detalhes', f.detalhes.filter((_, j) => j !== i));

  const save = async () => {
    if (!f.nome.trim()) {
      setBadName(true);
      nameRef.current?.focus();
      return;
    }
    setBusy(true);
    setErr('');
    try {
      let img = f.img;
      if (file) img = await upload(file, 'miniaturas', 'miniatura');
      const body = {
        ...f,
        img,
        status: f.tipo === 'colecao' ? 'disponivel' : f.status,
        detalhes: f.detalhes.filter(d => d.pt.trim() || d.en.trim())
      };
      delete body.id;
      delete body.n;
      const j = item ? await api(`/api/admin/items/${item.id}`, 'PATCH', body) : await api('/api/admin/items', 'POST', body);
      onSaved(j.item);
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  };

  const real = parseInt(f.comp, 10);
  const pvItem = {
    ...f,
    id: item?.id ?? 0,
    n: item?.n ?? nextNumber,
    nome: f.nome || 'NOME DO MODELO',
    img: preview,
    ano: f.ano ? parseInt(f.ano, 10) : null,
    status: f.tipo === 'colecao' ? 'disponivel' : f.status
  };
  const t = T.pt;

  return (
    <>
      <div className="a-scrim" onClick={() => !busy && onClose()} />
      <div className="a-drawer" role="dialog" aria-modal="true" aria-labelledby="dr-t">
        <div className="a-dhead">
          <div>
            <h2 id="dr-t">{item ? 'EDITAR MINIATURA' : 'NOVA MINIATURA'}</h2>
            <p>
              Nº {String(pvItem.n).padStart(2, '0')} no catálogo
              {item ? '' : ' (o número é dado na hora de salvar)'}
            </p>
          </div>
          <button className="a-icon" type="button" onClick={onClose} aria-label="Fechar" disabled={busy}>
            <Close />
          </button>
        </div>

        <div className="a-dbody">
          <div className="a-form">
            <fieldset>
              <legend>FOTO</legend>
              <label className="a-drop">
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={pickFile} />
                {preview ? <img src={preview} alt="Foto da miniatura" /> : null}
                <span className="a-hint">
                  {preview ? (
                    <b>Trocar foto</b>
                  ) : (
                    <>
                      <b>Escolher foto</b>
                      <br />
                      PNG com fundo transparente fica melhor. A borda vazia é cortada sozinha.
                    </>
                  )}
                </span>
              </label>
            </fieldset>

            <fieldset>
              <legend>INFORMAÇÕES</legend>
              <div className={'a-field' + (badName ? ' bad' : '')}>
                <label htmlFor="f-nome">Nome do modelo *</label>
                <input
                  id="f-nome"
                  ref={nameRef}
                  className="a-f"
                  value={f.nome}
                  maxLength={120}
                  placeholder="Ex.: Porsche 911 Turbo"
                  onChange={e => {
                    set('nome', e.target.value);
                    setBadName(false);
                  }}
                />
                {badName ? <small style={{ color: '#FF8A84' }}>Coloca o nome da miniatura.</small> : null}
              </div>
              <div className="a-grid2">
                <div className="a-field">
                  <label htmlFor="f-mont">Montadora do carro real</label>
                  <input id="f-mont" className="a-f" value={f.montadora} maxLength={60} placeholder="Ex.: Porsche" onChange={e => set('montadora', e.target.value)} />
                </div>
                <div className="a-field">
                  <label htmlFor="f-linha">Pintura / versão</label>
                  <input id="f-linha" className="a-f" value={f.linha} maxLength={120} placeholder="Ex.: ADVAN nº 83" onChange={e => set('linha', e.target.value)} />
                </div>
              </div>
              <div className="a-grid2">
                <div className="a-field">
                  <label htmlFor="f-marca">Marca da miniatura</label>
                  <select
                    id="f-marca"
                    className="a-f"
                    value={marcaSel}
                    onChange={e => {
                      const v = e.target.value;
                      setMarcaSel(v);
                      set('marca', v === OTHER ? '' : v);
                    }}
                  >
                    <option value="">Sem marca</option>
                    {brandNames.map(n => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                    <option value={OTHER}>Outra…</option>
                  </select>
                  {marcaSel === OTHER ? (
                    <input
                      className="a-f"
                      value={f.marca}
                      maxLength={80}
                      placeholder="Digite o nome da marca"
                      aria-label="Nome da outra marca"
                      autoFocus
                      onChange={e => set('marca', e.target.value)}
                    />
                  ) : null}
                </div>
                <div className="a-field">
                  <label htmlFor="f-cor">Cor</label>
                  <input id="f-cor" className="a-f" value={f.cor} maxLength={60} placeholder="Ex.: Vermelho" onChange={e => set('cor', e.target.value)} />
                  <small>Aparece no filtro de cor do site.</small>
                </div>
              </div>
              <div className="a-grid3">
                <div className="a-field">
                  <label htmlFor="f-ano">Ano</label>
                  <input id="f-ano" className="a-f" inputMode="numeric" value={f.ano} maxLength={4} placeholder="Ex.: 2024" onChange={e => set('ano', e.target.value.replace(/\D/g, ''))} />
                </div>
                <div className="a-field">
                  <label htmlFor="f-tir">Tiragem</label>
                  <input id="f-tir" className="a-f" value={f.tiragem} maxLength={40} placeholder="Ex.: 1 de 3600" onChange={e => set('tiragem', e.target.value)} />
                </div>
                <div className="a-field">
                  <label htmlFor="f-comp">Comprimento do carro real</label>
                  <div className="a-mm">
                    <input id="f-comp" className="a-f" inputMode="numeric" value={f.comp} maxLength={5} placeholder="Ex.: 4245" onChange={e => set('comp', e.target.value.replace(/\D/g, ''))} />
                    <em>mm</em>
                  </div>
                  <small>{real ? `Na escala 1:64 dá ${Math.round(real / 64)} mm.` : 'Opcional. Mostra o tamanho no Explorar.'}</small>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>ONDE ENTRA NO SITE</legend>
              <div className="a-field">
                <span className="a-lab">Tipo</span>
                <div className="a-seg" role="group" aria-label="Tipo">
                  {[
                    ['venda', 'À venda'],
                    ['colecao', 'Coleção pessoal']
                  ].map(([v, l]) => (
                    <button key={v} type="button" aria-pressed={f.tipo === v} onClick={() => set('tipo', v)}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="a-field">
                <span className="a-lab">Status</span>
                <div className={'a-seg' + (f.tipo === 'colecao' ? ' off' : '')} role="group" aria-label="Status">
                  {STATUS.map(s => (
                    <button key={s.v} type="button" aria-pressed={f.status === s.v} onClick={() => set('status', s.v)}>
                      <i style={{ background: STATUS_COLOR[s.v] }} />
                      {s.l}
                    </button>
                  ))}
                </div>
                {f.tipo === 'colecao' ? <small>Coleção pessoal não tem status de venda.</small> : null}
              </div>
              <div className="a-field">
                <span className="a-lab">Importado de</span>
                <div className="a-seg" role="group" aria-label="Origem">
                  {['Japão', 'China', 'EUA'].map(o => (
                    <button key={o} type="button" aria-pressed={f.origem === o} onClick={() => set('origem', o)}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div className="a-grid2">
                <Toggle label="Mostrar na estante" help="Entra na Estante digital." checked={f.estante} onChange={v => set('estante', v)} />
                <Toggle label="Selo de novidade" help="Aparece no card de venda." checked={f.novo} onChange={v => set('novo', v)} />
              </div>
            </fieldset>

            <fieldset>
              <legend>DESCRIÇÃO (EXPLORAR)</legend>
              <div className="a-grid2">
                <div className="a-field">
                  <label htmlFor="f-dpt">Em português</label>
                  <textarea id="f-dpt" className="a-f" value={f.descricao_pt} maxLength={1200} onChange={e => set('descricao_pt', e.target.value)} />
                </div>
                <div className="a-field">
                  <label htmlFor="f-den">Em inglês</label>
                  <textarea id="f-den" className="a-f" value={f.descricao_en} maxLength={1200} onChange={e => set('descricao_en', e.target.value)} />
                  <small>Se ficar vazio, o site em inglês mostra a versão em português.</small>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>DETALHES PRA DAR ZOOM (EXPLORAR)</legend>
              {preview ? (
                <>
                  <small style={{ color: 'var(--a-mute)', fontSize: 12.5 }}>
                    Clique na foto em cima de um detalhe (farol, roda, número…) pra criar um atalho de zoom. Até 12.
                  </small>
                  <div className="a-pts" ref={ptsRef} onClick={addPoint} role="presentation">
                    <img src={preview} alt="" />
                    {f.detalhes.map((d, i) => (
                      <span key={i} className="a-pt" style={{ left: d.x * 100 + '%', top: d.y * 100 + '%' }}>
                        {i + 1}
                      </span>
                    ))}
                  </div>
                  {f.detalhes.length ? (
                    <div className="a-ptlist">
                      {f.detalhes.map((d, i) => (
                        <div className="a-ptrow" key={i}>
                          <b>{i + 1}</b>
                          <input className="a-f" value={d.pt} maxLength={40} placeholder="Nome (ex.: Farol)" aria-label={`Detalhe ${i + 1} em português`} onChange={e => setPoint(i, 'pt', e.target.value)} />
                          <input className="a-f" value={d.en} maxLength={40} placeholder="Inglês (ex.: Headlight)" aria-label={`Detalhe ${i + 1} em inglês`} onChange={e => setPoint(i, 'en', e.target.value)} />
                          <button className="a-icon del" type="button" onClick={() => delPoint(i)} aria-label={`Remover detalhe ${i + 1}`}>
                            <Trash />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <small style={{ color: 'var(--a-mute)', fontSize: 12.5 }}>Escolha a foto primeiro.</small>
              )}
            </fieldset>
          </div>

          <aside className="a-prev" aria-label="Prévia do card">
            <div className="a-pvhead">
              <span>ASSIM VAI APARECER NO SITE</span>
              {f.tipo === 'colecao' ? (
                <div className="a-segs" role="group" aria-label="Estado do card">
                  {[
                    ['normal', 'Normal'],
                    ['open', 'Mouse em cima']
                  ].map(([v, l]) => (
                    <button key={v} type="button" aria-pressed={pvMode === v} onClick={() => setPvMode(v)} style={{ fontSize: 11, padding: '5px 8px' }}>
                      {l}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div style={{ pointerEvents: 'none' }}>
              {f.tipo === 'venda' ? (
                <div style={{ position: 'relative' }}>
                  <SaleCard item={pvItem} t={t} ig="" />
                  {!preview ? <div className="a-nophoto" style={{ top: 70, bottom: 80 }}>Sem foto ainda</div> : null}
                </div>
              ) : (
                <ColCard item={pvItem} t={t} open={pvMode === 'open'} setOpen={() => {}} onExplore={() => {}} />
              )}
            </div>
            <p className="a-note">
              {f.tipo === 'venda' ? 'Card da seção “Miniaturas à venda”.' : 'Card da seção “Nossa coleção”. Passe pra “Mouse em cima” pra ver a ficha.'}
            </p>
          </aside>
        </div>

        <div className="a-dfoot">
          {err ? (
            <p className="a-err" role="alert">
              {err}
            </p>
          ) : null}
          <button className="a-btn ghost" type="button" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button className="a-btn red" type="button" onClick={save} disabled={busy}>
            {busy ? 'Salvando…' : item ? 'Salvar alterações' : 'Cadastrar miniatura'}
          </button>
        </div>
      </div>
    </>
  );
}
