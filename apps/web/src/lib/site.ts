// Textos fixos do site. Produtos, pedidos e alunas vêm da API (ou de lib/demo.ts no modo de exemplo).
export const WA = 'https://wa.me/5511947692668';
export const WA_LABEL = '(11) 94769-2668';
export const INSTAGRAM = 'https://www.instagram.com/camillagama_lash/';

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
/** Caminho de arquivo em /public, já com o basePath do GitHub Pages. */
export const foto = (nome: string) => `${base}/fotos/${nome}`;
/** Caminho interno com o basePath (para imagens e links fora do <Link>). */
export const caminho = (p: string) => `${base}${p}`;

/** Link do WhatsApp com mensagem pronta. Sem número, vai para a Camilla. */
export function wa(texto?: string, numero?: string) {
  const n = numero ? (numero.replace(/\D/g, '').length <= 11 ? `55${numero.replace(/\D/g, '')}` : numero.replace(/\D/g, '')) : '5511947692668';
  return `https://wa.me/${n}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;
}

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
