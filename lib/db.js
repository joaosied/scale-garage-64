import { createClient } from '@supabase/supabase-js';
import { DEFAULT_BRANDS, DEFAULT_ITEMS, DEFAULT_SETTINGS } from './seed';

export const BUCKET = 'fotos';

export function hasDb() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// Cliente com a service role: so roda no servidor, nunca vai pro navegador.
export function db() {
  if (!hasDb()) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (url, opts = {}) => fetch(url, { ...opts, cache: 'no-store' }) }
  });
}

export const ITEM_FIELDS = [
  'nome', 'montadora', 'linha', 'marca', 'cor', 'ano', 'tiragem', 'origem', 'tipo', 'status',
  'novo', 'estante', 'ordem_estante', 'descricao_pt', 'descricao_en', 'comp', 'img', 'detalhes'
];

export function toItem(r) {
  return {
    id: r.id,
    n: r.numero_catalogo,
    nome: r.nome,
    montadora: r.montadora || '',
    linha: r.linha || '',
    marca: r.marca || '',
    cor: r.cor || '',
    ano: r.ano,
    tiragem: r.tiragem || '',
    origem: r.origem,
    tipo: r.tipo,
    status: r.status,
    novo: !!r.novo,
    estante: !!r.estante,
    ordem_estante: r.ordem_estante,
    descricao_pt: r.descricao_pt || '',
    descricao_en: r.descricao_en || '',
    comp: r.comprimento_mm,
    img: r.imagem_url,
    detalhes: Array.isArray(r.detalhes) ? r.detalhes : []
  };
}

const ORIGENS = ['Japão', 'China', 'EUA'];
const TIPOS = ['venda', 'colecao'];
const STATUS = ['disponivel', 'reservado', 'vendido', 'encomenda'];
const clean = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const intOrNull = v => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

// Converte o que vem do admin para colunas do banco, so com campos conhecidos.
export function toRow(body) {
  const row = {};
  if ('nome' in body) row.nome = clean(body.nome, 120);
  if ('montadora' in body) row.montadora = clean(body.montadora, 60) || null;
  if ('linha' in body) row.linha = clean(body.linha, 120) || null;
  if ('marca' in body) row.marca = clean(body.marca, 80) || null;
  if ('cor' in body) row.cor = clean(body.cor, 60) || null;
  if ('ano' in body) row.ano = intOrNull(body.ano);
  if ('tiragem' in body) row.tiragem = clean(body.tiragem, 40) || null;
  if ('origem' in body && ORIGENS.includes(body.origem)) row.origem = body.origem;
  if ('tipo' in body && TIPOS.includes(body.tipo)) row.tipo = body.tipo;
  if ('status' in body && STATUS.includes(body.status)) row.status = body.status;
  if ('novo' in body) row.novo = !!body.novo;
  if ('estante' in body) row.estante = !!body.estante;
  if ('ordem_estante' in body) row.ordem_estante = intOrNull(body.ordem_estante);
  if ('descricao_pt' in body) row.descricao_pt = clean(body.descricao_pt, 1200) || null;
  if ('descricao_en' in body) row.descricao_en = clean(body.descricao_en, 1200) || null;
  if ('comp' in body) row.comprimento_mm = intOrNull(body.comp);
  if ('img' in body) row.imagem_url = clean(body.img, 600) || null;
  if ('detalhes' in body && Array.isArray(body.detalhes)) {
    row.detalhes = body.detalhes.slice(0, 12).map(d => ({
      x: Math.min(1, Math.max(0, Number(d.x) || 0)),
      y: Math.min(1, Math.max(0, Number(d.y) || 0)),
      pt: clean(d.pt, 40),
      en: clean(d.en, 40)
    }));
  }
  return row;
}

export async function getCatalog() {
  const client = db();
  if (!client) {
    return { items: DEFAULT_ITEMS, brands: DEFAULT_BRANDS, settings: DEFAULT_SETTINGS, demo: true };
  }
  const [it, br, st] = await Promise.all([
    client.from('miniaturas').select('*').order('numero_catalogo', { ascending: false }),
    client.from('marcas').select('*').order('ordem', { ascending: true }),
    client.from('configuracoes').select('*').eq('id', 1).maybeSingle()
  ]);
  if (it.error) throw new Error('miniaturas: ' + it.error.message);
  if (br.error) throw new Error('marcas: ' + br.error.message);
  const s = st.data || {};
  return {
    items: (it.data || []).map(toItem),
    brands: br.data || [],
    settings: {
      instagram: s.instagram || DEFAULT_SETTINGS.instagram,
      desde: s.desde ?? DEFAULT_SETTINGS.desde,
      hero_id: s.hero_id ?? null,
      sobre: Array.isArray(s.sobre) && s.sobre.length === 3 ? s.sobre : DEFAULT_SETTINGS.sobre,
      importacao_pt: s.importacao_pt || DEFAULT_SETTINGS.importacao_pt,
      importacao_en: s.importacao_en || DEFAULT_SETTINGS.importacao_en
    },
    demo: false
  };
}
