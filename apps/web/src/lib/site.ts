// Dados do site. Nesta versão de teste tudo é estático; depois vem da API (NestJS + MongoDB).
export const WA = 'https://wa.me/5511947692668';
export const WA_LABEL = '(11) 94769-2668';
export const INSTAGRAM = 'https://www.instagram.com/camillagama_lash/';

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
/** Caminho de arquivo em /public, já com o basePath do GitHub Pages. */
export const foto = (nome: string) => `${base}/fotos/${nome}`;

export const CURSO = {
  titulo: 'Extensão de Cílios — Iniciante',
  preco: 'R$ 1.000',
  // Exemplo para demonstrar o campo opcional "preço original". Trocar pelo valor real ou remover.
  precoOriginal: 'R$ 1.200',
  desconto: '−17%',
};

export type Produto = {
  id: string;
  tipo: 'curso' | 'apostila';
  formato?: 'presencial' | 'online';
  titulo: string;
  texto: string;
  tag: string;
  img: string;
  alt: string;
  pos: string;
  preco: string;
  precoOriginal?: string;
  desconto?: string;
  parcelas?: string;
  href: string;
  cta: string;
};

// Catálogo. Os preços do online, da apostila e de sobrancelhas são EXEMPLOS até a Camilla definir.
export const PRODUTOS: Produto[] = [
  {
    id: 'cilios-presencial', tipo: 'curso', formato: 'presencial', titulo: 'Extensão de Cílios — Iniciante',
    texto: 'Intensivo de 2 dias em Osasco: cinco técnicas, kit com 20 itens, apostila e prática com modelo.',
    tag: 'Presencial · 2 dias', img: 'pdf-curso-p3-03.jpg', alt: 'Extensão de cílios vista de perfil', pos: '50% 35%',
    preco: CURSO.preco, precoOriginal: CURSO.precoOriginal, desconto: CURSO.desconto, parcelas: 'à vista ou em até 12x',
    href: '/cursos/extensao-de-cilios', cta: 'Ver curso',
  },
  {
    id: 'cilios-online', tipo: 'curso', formato: 'online', titulo: 'Extensão de Cílios — Iniciante',
    texto: 'As mesmas cinco técnicas em 12 aulas gravadas, com apostila e certificado.',
    tag: 'Online · 12 aulas', img: 'post-04.jpg', alt: 'Cílios com extensão em volume', pos: '50% 40%',
    preco: 'R$ 497', parcelas: 'à vista ou em até 12x',
    href: '/cursos/extensao-de-cilios', cta: 'Ver curso',
  },
  {
    id: 'sobrancelhas-presencial', tipo: 'curso', formato: 'presencial', titulo: 'Design de Sobrancelhas',
    texto: 'Mapeamento, desenho e acabamento sob medida. Próximas turmas pelo WhatsApp.',
    tag: 'Presencial · 1 dia', img: 'post-12.jpg', alt: 'Cliente com sobrancelhas desenhadas', pos: '50% 20%',
    preco: 'R$ 600', parcelas: 'à vista ou em até 12x',
    href: '/inscricao', cta: 'Quero me inscrever',
  },
  {
    id: 'apostila-cilios', tipo: 'apostila', titulo: 'Apostila Profissional de Extensão de Cílios',
    texto: 'Biossegurança, tipos de técnica, ciclo dos fios e mapeamento em 30 páginas.',
    tag: 'PDF · 30 páginas', img: 'pdf-apostila-p1-07.jpg', alt: 'Capa da apostila profissional de extensão de cílios', pos: '50% 18%',
    preco: 'R$ 97',
    href: '/inscricao', cta: 'Quero comprar',
  },
];
export const CURSOS = PRODUTOS.filter((p) => p.tipo === 'curso');
export const APOSTILAS = PRODUTOS.filter((p) => p.tipo === 'apostila');

export const DIA1 = [
  'Preparação e higienização dos cílios naturais',
  'Materiais e instrumentos',
  'Mapeamento e escolha dos fios',
  'Segredos para maior durabilidade',
  'Acoplamento e isolamento',
  'Direcionamento correto dos fios',
  'Treino no copo, boneca e esponja',
];
export const DIA2 = [
  'Preparação da modelo e análise do olhar',
  'Aplicação completa em modelo real, com acompanhamento',
  'Correções e dicas para resultados de excelência',
  'Finalização, cuidados e manutenção',
];
export const TECNICAS = ['Fio a Fio', 'Volume Brasileiro', 'Volume Europeu (4D)', 'Volume Mega Europeu', 'Volume Marrom'];
export const KIT = [
  'Pinça de isolamento', 'Pinça de precisão', 'Esponjas para treino', 'Pump espumador', 'Pump para enxágue',
  'Fitas micropore', 'Fita transpore', 'Cola profissional', 'Higienizador de cílios', 'Mini ventilador portátil',
  'Caneta marcadora', 'Caixa de cílios 4D', 'Caixa de cílios Y', 'Escovinhas para cílios', 'Microbrush',
  'Florzinha para cola', 'Pads em gel', 'Higrômetro', 'Máscaras descartáveis', 'Toucas descartáveis',
];

export const MODULOS = [
  { nome: 'Fundamentos', aulas: ['Biossegurança', 'Tufo, tela e extensão', 'Tipos de técnicas', 'Ciclo de vida dos cílios'] },
  { nome: 'Técnicas', aulas: ['Fio a Fio', 'Volume Brasileiro', 'Volume Europeu (4D)', 'Volume Mega Europeu', 'Volume Marrom'] },
  { nome: 'Prática', aulas: ['Mapeamento e escolha dos fios', 'Acoplamento e isolamento', 'Direcionamento dos fios'] },
];
/** Aula em que a aluna de exemplo está (as anteriores estão concluídas). */
export const AULA_ATUAL = 'Ciclo de vida dos cílios';
