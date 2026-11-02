export const STATUS_COLOR = {
  disponivel: '#3BBF6A',
  reservado: '#E8B730',
  vendido: '#8E8E8E',
  encomenda: '#6C8CFF',
  colecao: '#6C8CFF'
};

const ORIGEM_EN = { 'Japão': 'Japan', China: 'China', EUA: 'USA' };

export const T = {
  pt: {
    nav: { home: 'Home', venda: 'Venda', colecao: 'Coleção', explore: 'Explorar' },
    lang: 'EN',
    langLabel: 'Switch to English',
    instagram: 'Instagram',
    hero: {
      kicker: 'MINIATURAS 1:64',
      about: 'SOBRE',
      titles: ['01 · QUEM SOMOS', '02 · IMPORTAÇÃO', '03 · COMO COMPRAR'],
      tabs: ['01 QUEM SOMOS', '02 IMPORTAÇÃO', '03 COMO COMPRAR'],
      origins: ['JAPÃO', 'CHINA', 'EUA'],
      seeSale: 'VER À VENDA',
      hint: 'ROLE PRA BAIXO ↓',
      turn: 'GIRO'
    },
    stats: { minis: n => (n === 1 ? 'MINIATURA' : 'MINIATURAS'), since: 'COLECIONANDO DESDE' },
    venda: { tag: 'À venda', title: 'MINIATURAS À VENDA', empty: 'Nenhuma miniatura à venda com esse filtro.', none: 'As próximas miniaturas à venda aparecem aqui.' },
    search: 'Escreva aqui',
    searchLabel: 'Buscar miniatura',
    filter: {
      open: 'Filtrar',
      brand: 'Marca',
      color: 'Cor',
      origin: 'Importado de',
      clear: 'Limpar',
      apply: 'Ver resultados',
      count: n => `${n} ${n === 1 ? 'filtro' : 'filtros'}`
    },
    card: {
      importedFrom: 'IMPORTADO DO',
      interest: 'TENHO INTERESSE',
      sold: 'VENDIDO',
      new: 'NOVIDADE',
      prev: 'Anterior',
      next: 'Próximo',
      page: n => `Página ${n}`
    },
    status: { disponivel: 'Disponível', reservado: 'Reservado', vendido: 'Vendido', encomenda: 'Sob encomenda', colecao: 'Coleção' },
    importacao: { title: 'IMPORTAMOS PRA VOCÊ', contact: 'Entrar em contato!', brands: 'Marcas que importamos' },
    estante: {
      tag: 'Estante',
      title: 'ESTANTE DIGITAL',
      sub: 'Passe o mouse pra acender a luz. Clique pra tirar o carro da prateleira.',
      free: 'VAGA DISPONÍVEL',
      back: 'DEVOLVER',
      backLabel: 'Devolver pra estante',
      take: 'Tirar da estante:',
      empty: 'A estante ainda está vazia.'
    },
    colecao: {
      tag: 'Coleção',
      title: 'PROCURE MODELOS EM NOSSA COLEÇÃO',
      more: 'VER MAIS',
      empty: 'Nenhum modelo encontrado.',
      none: 'A coleção aparece aqui assim que for cadastrada.',
      notSale: 'SÓ COLEÇÃO'
    },
    explore: {
      tag: 'Explorar',
      title: 'EXPLORE UMA MINIATURA',
      pick: 'Qual miniatura você quer explorar?',
      whole: 'INTEIRO',
      wholeT: 'O CARRO INTEIRO',
      loupe: 'LUPA',
      hint: 'Mexa o mouse pra inclinar. Use a lupa ou os atalhos pra ver os detalhes.',
      hintTouch: 'Toque nos atalhos pra dar zoom nos detalhes.',
      noResults: 'Nada encontrado.'
    },
    spec: {
      marca: 'Marca', montadora: 'Montadora', cor: 'Cor', ano: 'Ano', tiragem: 'Tiragem',
      origem: 'Origem', escala: 'Escala', tamanho: 'Tamanho', tipo: 'Tipo',
      venda: 'À venda', colecao: 'Coleção pessoal',
      size: (mini, real) => `${mini} mm (o real tem ${real} mm)`
    },
    footer: { rights: 'Miniaturas 1:64 importadas do Japão, China e EUA.' },
    origem: o => o
  },
  en: {
    nav: { home: 'Home', venda: 'For sale', colecao: 'Collection', explore: 'Explore' },
    lang: 'PT',
    langLabel: 'Mudar para português',
    instagram: 'Instagram',
    hero: {
      kicker: '1:64 MINIATURES',
      about: 'ABOUT',
      titles: ['01 · WHO WE ARE', '02 · IMPORTS', '03 · HOW TO BUY'],
      tabs: ['01 WHO WE ARE', '02 IMPORTS', '03 HOW TO BUY'],
      origins: ['JAPAN', 'CHINA', 'USA'],
      seeSale: 'SEE FOR SALE',
      hint: 'SCROLL DOWN ↓',
      turn: 'TURN'
    },
    stats: { minis: n => (n === 1 ? 'MINIATURE' : 'MINIATURES'), since: 'COLLECTING SINCE' },
    venda: { tag: 'For sale', title: 'MINIATURES FOR SALE', empty: 'No miniatures for sale match this filter.', none: 'The next miniatures for sale will show up here.' },
    search: 'Type here',
    searchLabel: 'Search miniature',
    filter: {
      open: 'Filter',
      brand: 'Brand',
      color: 'Color',
      origin: 'Imported from',
      clear: 'Clear',
      apply: 'See results',
      count: n => `${n} ${n === 1 ? 'filter' : 'filters'}`
    },
    card: {
      importedFrom: 'IMPORTED FROM',
      interest: "I'M INTERESTED",
      sold: 'SOLD',
      new: 'NEW',
      prev: 'Previous',
      next: 'Next',
      page: n => `Page ${n}`
    },
    status: { disponivel: 'Available', reservado: 'Reserved', vendido: 'Sold', encomenda: 'On order', colecao: 'Collection' },
    importacao: { title: 'WE IMPORT FOR YOU', contact: 'Get in touch!', brands: 'Brands we import' },
    estante: {
      tag: 'Shelf',
      title: 'DIGITAL SHELF',
      sub: 'Hover to turn on the light. Click to take the car off the shelf.',
      free: 'AVAILABLE SPOT',
      back: 'PUT BACK',
      backLabel: 'Put back on the shelf',
      take: 'Take off the shelf:',
      empty: 'The shelf is still empty.'
    },
    colecao: {
      tag: 'Collection',
      title: 'BROWSE MODELS IN OUR COLLECTION',
      more: 'SEE MORE',
      empty: 'No models found.',
      none: 'The collection will show up here once it is added.',
      notSale: 'COLLECTION ONLY'
    },
    explore: {
      tag: 'Explore',
      title: 'EXPLORE A MINIATURE',
      pick: 'Which miniature do you want to explore?',
      whole: 'WHOLE',
      wholeT: 'THE WHOLE CAR',
      loupe: 'LOUPE',
      hint: 'Move the mouse to tilt it. Use the loupe or the shortcuts to see the details.',
      hintTouch: 'Tap the shortcuts to zoom into the details.',
      noResults: 'Nothing found.'
    },
    spec: {
      marca: 'Brand', montadora: 'Make', cor: 'Color', ano: 'Year', tiragem: 'Run',
      origem: 'Origin', escala: 'Scale', tamanho: 'Size', tipo: 'Type',
      venda: 'For sale', colecao: 'Personal collection',
      size: (mini, real) => `${mini} mm (the real one is ${real} mm)`
    },
    footer: { rights: '1:64 miniatures imported from Japan, China and the USA.' },
    origem: o => ORIGEM_EN[o] || o
  }
};

export function igProfile(user) {
  return `https://instagram.com/${user}`;
}

export function igDirect(user) {
  return `https://ig.me/m/${user}`;
}

export function desc(item, lang) {
  return (lang === 'en' ? item.descricao_en : item.descricao_pt) || item.descricao_pt || '';
}

export function subLine(item) {
  return [item.marca, item.linha].filter(Boolean).join(' · ');
}
