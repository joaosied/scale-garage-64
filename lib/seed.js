// Dados usados quando o banco ainda nao foi configurado (e como valores iniciais).

export const DEFAULT_SETTINGS = {
  instagram: 'scale_garage64',
  desde: 2026,
  hero_id: 3,
  sobre: [
    {
      t_pt: 'Uma garagem em escala 1:64',
      p_pt: 'Miniaturas de colecionador escolhidas uma a uma. Parte delas está à venda e parte é a nossa coleção pessoal, que fica aqui só pra mostrar.',
      t_en: 'A garage in 1:64 scale',
      p_en: 'Collector miniatures picked one by one. Some of them are for sale and some are our personal collection, here just to show.'
    },
    {
      t_pt: 'Direto do Japão, China e EUA',
      p_pt: 'A gente importa as miniaturas direto de fora. Não achou o modelo que procura na vitrine? Fala com a gente que a gente busca.',
      t_en: 'Straight from Japan, China and the USA',
      p_en: "We import our miniatures directly from abroad. Can't find the model you want in the showcase? Message us and we'll hunt it down."
    },
    {
      t_pt: 'Escolheu? Chama no Instagram',
      p_pt: 'Toda venda é combinada direto com a gente: valor, frete e prazo. Sem carrinho e sem cadastro.',
      t_en: 'Found it? Message us on Instagram',
      p_en: 'Every sale is arranged directly with us: price, shipping and timing. No cart and no sign-up.'
    }
  ],
  importacao_pt:
    'A Scale Garage 64 importa miniaturas 1:64 direto do Japão, da China e dos Estados Unidos. Trabalhamos com as marcas que os colecionadores mais procuram, dos lançamentos às peças difíceis de achar por aqui. Se o modelo que você quer não está na vitrine, chama a gente no Instagram que a gente encontra pra você.',
  importacao_en:
    "Scale Garage 64 imports 1:64 miniatures straight from Japan, China and the United States. We work with the brands collectors look for the most, from new releases to pieces that are hard to find. If the model you want isn't in the showcase, message us on Instagram and we'll find it for you."
};

export const DEFAULT_BRANDS = [
  { id: 1, nome: 'Hot Wheels', logo_url: null, cor_fundo: '#F39C2C', ordem: 1 },
  { id: 2, nome: 'Greenlight', logo_url: null, cor_fundo: '#2F8E3F', ordem: 2 },
  { id: 3, nome: 'Mini GT', logo_url: null, cor_fundo: '#BDBDBD', ordem: 3 },
  { id: 4, nome: 'Matchbox', logo_url: null, cor_fundo: '#E8642B', ordem: 4 },
  { id: 5, nome: 'Trends Hobby', logo_url: null, cor_fundo: '#1E3C8F', ordem: 5 },
  { id: 6, nome: 'Mini Station', logo_url: null, cor_fundo: '#A8E2EA', ordem: 6 },
  { id: 7, nome: 'Pop Race', logo_url: null, cor_fundo: '#E23B30', ordem: 7 },
  { id: 8, nome: 'Kaido House', logo_url: null, cor_fundo: '#FFFFFF', ordem: 8 }
];

const base = {
  montadora: 'Porsche', marca: '', ano: null, tiragem: '', novo: false, estante: true,
  descricao_pt: '', descricao_en: '', comp: null, detalhes: []
};

export const DEFAULT_ITEMS = [
  {
    ...base, id: 1, n: 1, nome: 'Porsche 993 GT2', linha: 'ADVAN nº 83', marca: 'Hot Wheels', cor: 'Preto e vermelho',
    origem: 'Japão', tipo: 'venda', status: 'disponivel', novo: true, ordem_estante: 1, img: '/seed/advan.webp', comp: 4245,
    descricao_pt: 'Porsche 993 GT2 com a pintura de corrida ADVAN nº 83, rodas raiadas douradas e asa traseira grande.',
    descricao_en: 'Porsche 993 GT2 in the ADVAN #83 racing livery, with gold mesh wheels and a big rear wing.',
    detalhes: [
      { x: 0.145, y: 0.58, pt: 'Farol', en: 'Headlight' },
      { x: 0.345, y: 0.78, pt: 'Roda', en: 'Wheel' },
      { x: 0.535, y: 0.57, pt: 'Nº 83', en: '#83' },
      { x: 0.88, y: 0.14, pt: 'Asa', en: 'Wing' }
    ]
  },
  { ...base, id: 2, n: 2, nome: 'Porsche 911 Turbo', linha: 'Preto', cor: 'Preto', origem: 'Japão', tipo: 'venda', status: 'disponivel', ordem_estante: 2, img: '/seed/turbo.webp' },
  { ...base, id: 3, n: 3, nome: 'Porsche 911 Targa', linha: 'Cobre cromado', cor: 'Cobre', origem: 'Japão', tipo: 'venda', status: 'disponivel', ordem_estante: 3, img: '/seed/targa.webp' },
  { ...base, id: 4, n: 4, nome: 'Porsche 911 RWB', linha: 'Rauh-Welt rosa', cor: 'Rosa', origem: 'Japão', tipo: 'colecao', status: 'disponivel', ordem_estante: 4, img: '/seed/rwb.webp' },
  { ...base, id: 5, n: 5, nome: 'Porsche 911 GT2', linha: 'Vermelho', cor: 'Vermelho', origem: 'Japão', tipo: 'colecao', status: 'disponivel', ordem_estante: 5, img: '/seed/gt2red.webp' }
];
