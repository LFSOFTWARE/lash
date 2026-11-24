// Formatos das respostas da API (apps/api). Preços sempre em centavos.

export type Papel = 'aluna' | 'admin';
export type Usuaria = { id: string; nome: string; email: string; whatsapp: string; papel: Papel; criadoEm?: string };

export type Tipo = 'curso' | 'apostila' | 'planilha' | 'combo';
export type Formato = 'presencial' | 'online';
export type Categoria = 'cilios' | 'sobrancelhas';

export type ApiProduto = {
  id: string;
  tipo: Tipo;
  titulo: string;
  slug: string;
  resumo?: string;
  descricao?: string;
  capa?: string;
  categoria: Categoria;
  preco: number;
  precoOriginal?: number;
  condicoes?: string;
  publicado: boolean;
  ordem: number;
  formato?: Formato;
  cargaHoraria?: string;
  nivel?: string;
  conteudo?: string[];
  local?: string;
  kit?: string[];
  paginas?: number;
  itens: string[];
  desconto?: number;
  temArquivo: boolean;
  arquivo?: string;
};

export type Status = 'pendente' | 'ativa' | 'cancelada';

export type ProdutoResumo = Pick<ApiProduto, 'id' | 'titulo' | 'slug' | 'tipo' | 'formato' | 'capa' | 'preco'>;

export type Pedido = {
  id: string;
  status: Status;
  solicitadaEm: string;
  liberadaEm?: string;
  canceladaEm?: string;
  expiraEm?: string;
  dataTurma?: string;
  observacao?: string;
  productId: string;
  produto?: ProdutoResumo;
  vencida?: boolean;
  progresso?: Progresso;
};

export type PedidoAdmin = Pedido & { aluna: { id: string; nome: string; email: string; whatsapp: string; whatsappUrl: string } };
export type Pagina<T> = { itens: T[]; total: number; pagina: number; porPagina: number };

export type Progresso = { concluidas: number; total: number; percentual: number };

export type AulaGrade = { id: string; titulo: string; descricao?: string; duracao?: number; aulaGratis?: boolean; materiais: string[]; concluida: boolean; ultimoSegundo: number };
export type CursoAluna = {
  produto: ApiProduto;
  modulos: { id: string; titulo: string; aulas: AulaGrade[] }[];
  progresso: Progresso;
  proximaAulaId: string | null;
};

export type Provedor = 'bunny' | 'vimeo' | 'youtube';
export type AulaAdmin = { id: string; titulo: string; descricao?: string; videoProvider?: Provedor; videoId?: string; duracao?: number; aulaGratis?: boolean; materiais: { nome: string; arquivo: string }[]; ordem: number };
export type ModuloAdmin = { id: string; titulo: string; ordem: number; aulas: AulaAdmin[] };

export type Resumo = { pedidosPendentes: number; acessosAtivos: number; alunasAtivas: number; produtosPublicados: number; contatosNaoAtendidos: number; pendentesRecentes: PedidoAdmin[] };
export type AlunaAdmin = Usuaria & { whatsappUrl: string; pedidos: { pendente: number; ativa: number; cancelada: number } };

export type RespostaLogin = { usuaria: Usuaria; accessToken: string; refreshToken: string };
export type RespostaPedido = { pedido: Pedido; whatsappUrl: string };
