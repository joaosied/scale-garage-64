-- =====================================================================
-- Scale Garage 64 — banco de dados
-- Rode este arquivo inteiro UMA vez no Supabase: SQL Editor > New query > Run.
-- Pode rodar de novo sem problema: nada é duplicado.
-- =====================================================================

-- ---------- numeração do catálogo (nunca reaproveita número) ----------
create sequence if not exists public.miniaturas_numero_seq start 1;

-- ---------- miniaturas ----------
create table if not exists public.miniaturas (
  id              bigint generated always as identity primary key,
  numero_catalogo integer not null unique default nextval('public.miniaturas_numero_seq'),
  nome            text not null check (char_length(nome) between 1 and 120),
  montadora       text,
  linha           text,
  marca           text,
  cor             text,
  ano             integer check (ano between 1900 and 2100),
  tiragem         text,
  origem          text not null default 'Japão' check (origem in ('Japão', 'China', 'EUA')),
  tipo            text not null default 'venda' check (tipo in ('venda', 'colecao')),
  status          text not null default 'disponivel' check (status in ('disponivel', 'reservado', 'vendido', 'encomenda')),
  novo            boolean not null default false,
  estante         boolean not null default true,
  ordem_estante   integer,
  descricao_pt    text,
  descricao_en    text,
  comprimento_mm  integer check (comprimento_mm > 0),
  imagem_url      text,
  detalhes        jsonb not null default '[]'::jsonb,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);
alter sequence public.miniaturas_numero_seq owned by public.miniaturas.numero_catalogo;

create index if not exists miniaturas_tipo_status_idx on public.miniaturas (tipo, status);
create index if not exists miniaturas_estante_idx on public.miniaturas (ordem_estante) where estante;

create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists miniaturas_atualizado_em on public.miniaturas;
create trigger miniaturas_atualizado_em
  before update on public.miniaturas
  for each row execute function public.set_atualizado_em();

-- ---------- marcas ----------
create table if not exists public.marcas (
  id        bigint generated always as identity primary key,
  nome      text not null unique,
  logo_url  text,
  cor_fundo text,
  ordem     integer not null default 0
);

-- ---------- configurações do site (uma linha só) ----------
create table if not exists public.configuracoes (
  id            smallint primary key default 1 check (id = 1),
  instagram     text not null default 'scale_garage64',
  desde         integer,
  hero_id       bigint references public.miniaturas (id) on delete set null,
  sobre         jsonb,
  importacao_pt text,
  importacao_en text
);
create index if not exists configuracoes_hero_id_idx on public.configuracoes (hero_id);

-- ---------- segurança ----------
-- RLS ligado e sem políticas públicas: ninguém lê nem escreve direto pelo navegador.
-- O site e o admin acessam pelo servidor da Vercel, com a service role.
alter table public.miniaturas    enable row level security;
alter table public.marcas        enable row level security;
alter table public.configuracoes enable row level security;

-- Acesso pela API: só a service role (usada no servidor da Vercel).
revoke all on table public.miniaturas, public.marcas, public.configuracoes from anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.miniaturas, public.marcas, public.configuracoes to service_role;
grant usage, select on sequence public.miniaturas_numero_seq to service_role;

-- ---------- fotos ----------
insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

-- ---------- dados iniciais ----------
insert into public.marcas (nome, cor_fundo, ordem) values
  ('Hot Wheels', '#F39C2C', 1),
  ('Greenlight', '#2F8E3F', 2),
  ('Mini GT', '#BDBDBD', 3),
  ('Matchbox', '#E8642B', 4),
  ('Trends Hobby', '#1E3C8F', 5),
  ('Mini Station', '#A8E2EA', 6),
  ('Pop Race', '#E23B30', 7),
  ('Kaido House', '#FFFFFF', 8)
on conflict (nome) do nothing;

insert into public.configuracoes (id, instagram, desde, sobre, importacao_pt, importacao_en)
values (1, 'scale_garage64', 2026, '[{"t_pt":"Uma garagem em escala 1:64","p_pt":"Miniaturas de colecionador escolhidas uma a uma. Parte delas está à venda e parte é a nossa coleção pessoal, que fica aqui só pra mostrar.","t_en":"A garage in 1:64 scale","p_en":"Collector miniatures picked one by one. Some of them are for sale and some are our personal collection, here just to show."},{"t_pt":"Direto do Japão, China e EUA","p_pt":"A gente importa as miniaturas direto de fora. Não achou o modelo que procura na vitrine? Fala com a gente que a gente busca.","t_en":"Straight from Japan, China and the USA","p_en":"We import our miniatures directly from abroad. Can''t find the model you want in the showcase? Message us and we''ll hunt it down."},{"t_pt":"Escolheu? Chama no Instagram","p_pt":"Toda venda é combinada direto com a gente: valor, frete e prazo. Sem carrinho e sem cadastro.","t_en":"Found it? Message us on Instagram","p_en":"Every sale is arranged directly with us: price, shipping and timing. No cart and no sign-up."}]'::jsonb,
  'A Scale Garage 64 importa miniaturas 1:64 direto do Japão, da China e dos Estados Unidos. Trabalhamos com as marcas que os colecionadores mais procuram, dos lançamentos às peças difíceis de achar por aqui. Se o modelo que você quer não está na vitrine, chama a gente no Instagram que a gente encontra pra você.',
  'Scale Garage 64 imports 1:64 miniatures straight from Japan, China and the United States. We work with the brands collectors look for the most, from new releases to pieces that are hard to find. If the model you want isn''t in the showcase, message us on Instagram and we''ll find it for you.')
on conflict (id) do nothing;

-- 5 miniaturas de exemplo (só entram se a tabela estiver vazia). Edite ou apague pelo admin.
insert into public.miniaturas
  (nome, montadora, linha, marca, cor, origem, tipo, status, novo, estante, ordem_estante, descricao_pt, descricao_en, comprimento_mm, imagem_url, detalhes)
select * from (values
  ('Porsche 993 GT2', 'Porsche', 'ADVAN nº 83', 'Hot Wheels', 'Preto e vermelho', 'Japão', 'venda', 'disponivel', true, true, 1, 'Porsche 993 GT2 com a pintura de corrida ADVAN nº 83, rodas raiadas douradas e asa traseira grande.', 'Porsche 993 GT2 in the ADVAN #83 racing livery, with gold mesh wheels and a big rear wing.', 4245, '/seed/advan.webp', '[{"x":0.145,"y":0.58,"pt":"Farol","en":"Headlight"},{"x":0.345,"y":0.78,"pt":"Roda","en":"Wheel"},{"x":0.535,"y":0.57,"pt":"Nº 83","en":"#83"},{"x":0.88,"y":0.14,"pt":"Asa","en":"Wing"}]'::jsonb),
  ('Porsche 911 Turbo', 'Porsche', 'Preto', null, 'Preto', 'Japão', 'venda', 'disponivel', false, true, 2, null, null, null::integer, '/seed/turbo.webp', '[]'::jsonb),
  ('Porsche 911 Targa', 'Porsche', 'Cobre cromado', null, 'Cobre', 'Japão', 'venda', 'disponivel', false, true, 3, null, null, null::integer, '/seed/targa.webp', '[]'::jsonb),
  ('Porsche 911 RWB', 'Porsche', 'Rauh-Welt rosa', null, 'Rosa', 'Japão', 'colecao', 'disponivel', false, true, 4, null, null, null::integer, '/seed/rwb.webp', '[]'::jsonb),
  ('Porsche 911 GT2', 'Porsche', 'Vermelho', null, 'Vermelho', 'Japão', 'colecao', 'disponivel', false, true, 5, null, null, null::integer, '/seed/gt2red.webp', '[]'::jsonb)
) as v
where not exists (select 1 from public.miniaturas);

update public.configuracoes
set hero_id = (select id from public.miniaturas order by numero_catalogo limit 1)
where id = 1 and hero_id is null;
