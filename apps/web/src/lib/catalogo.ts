import { useEffect, useState } from 'react';
import { api, textoErro, usaApi } from './api';
import { catalogoDemo } from './demo';
import { caminho, foto } from './site';
import type { ApiProduto } from './tipos';

/** R$ 1.000 (sem centavos quando é valor redondo) ou R$ 49,90. */
export function reais(centavos: number) {
  const v = centavos / 100;
  return Number.isInteger(v) ? `R$ ${v.toLocaleString('pt-BR')}` : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Capa vinda da API: URL completa (upload) ou caminho em /public (seed). */
export function imagem(src?: string) {
  if (!src) return foto('post-04.jpg');
  if (/^(https?:|blob:)/.test(src)) return src;
  return src.startsWith('/') ? caminho(src) : foto(src);
}

/** Enquadramento das fotos do site, por produto. */
const POSICAO: Record<string, string> = {
  'extensao-de-cilios-presencial': '50% 35%',
  'extensao-de-cilios-online': '50% 40%',
  'design-de-sobrancelhas-presencial': '50% 20%',
  'apostila-extensao-de-cilios': '50% 18%',
};
export const posicao = (slug: string) => POSICAO[slug] ?? '50% 40%';

/** O curso de extensão de cílios tem página própria, com os dois formatos. */
export const PAGINA_CILIOS = '/cursos/extensao-de-cilios';
export const linkProduto = (p: Pick<ApiProduto, 'slug' | 'tipo'>) =>
  p.tipo === 'curso' && p.slug.startsWith('extensao-de-cilios-') ? PAGINA_CILIOS : `/inscricao?produto=${p.slug}`;

export const ehApostila = (p: Pick<ApiProduto, 'tipo'>) => p.tipo === 'apostila' || p.tipo === 'planilha';

export function etiqueta(p: Pick<ApiProduto, 'tipo' | 'formato' | 'cargaHoraria' | 'paginas'>) {
  if (p.tipo === 'curso') return [p.formato === 'online' ? 'Online' : 'Presencial', p.cargaHoraria].filter(Boolean).join(' · ');
  if (p.tipo === 'apostila') return p.paginas ? `PDF · ${p.paginas} páginas` : 'PDF';
  return p.tipo === 'planilha' ? 'Planilha' : 'Combo';
}

export type Cartao = {
  id: string;
  slug: string;
  tipo: ApiProduto['tipo'];
  formato?: ApiProduto['formato'];
  titulo: string;
  texto: string;
  tag: string;
  img: string;
  pos: string;
  preco: string;
  precoOriginal?: string;
  desconto?: string;
  parcelas?: string;
  href: string;
  cta: string;
};

export function cartao(p: ApiProduto): Cartao {
  const href = linkProduto(p);
  return {
    id: p.id,
    slug: p.slug,
    tipo: p.tipo,
    formato: p.formato,
    titulo: p.titulo,
    texto: p.resumo ?? '',
    tag: etiqueta(p),
    img: imagem(p.capa),
    pos: posicao(p.slug),
    preco: reais(p.preco),
    precoOriginal: p.precoOriginal && p.precoOriginal > p.preco ? reais(p.precoOriginal) : undefined,
    desconto: p.desconto ? `−${p.desconto}%` : undefined,
    parcelas: p.condicoes,
    href,
    cta: href === PAGINA_CILIOS ? 'Ver curso' : p.tipo === 'curso' ? 'Quero me inscrever' : 'Quero comprar',
  };
}

// ---------- Catálogo publicado (GET /produtos), carregado uma vez por visita ----------

let cache: ApiProduto[] | null = null;
let carregando: Promise<ApiProduto[]> | null = null;

export function invalidarCatalogo() {
  cache = null;
  carregando = null;
}

function carregar() {
  carregando ??= api<ApiProduto[]>('/produtos')
    .then((l) => (cache = l))
    .catch((e) => {
      carregando = null;
      throw e;
    });
  return carregando;
}

/** Produtos publicados. No modo de exemplo já começa preenchido (o HTML estático sai com os preços). */
export function useCatalogo() {
  const [produtos, setProdutos] = useState<ApiProduto[] | null>(() => cache ?? (usaApi ? null : catalogoDemo()));
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => {
    let vivo = true;
    carregar()
      .then((l) => vivo && setProdutos(l))
      .catch((e) => vivo && setErro(textoErro(e)));
    return () => {
      vivo = false;
    };
  }, []);
  return { produtos, erro };
}

export type Filtro = { tipo?: 'curso' | 'apostila' | 'combo'; formato?: 'presencial' | 'online' };
export const filtrar = (lista: ApiProduto[], f: Filtro = {}) =>
  lista.filter((p) => (!f.tipo || (f.tipo === 'apostila' ? ehApostila(p) : p.tipo === f.tipo)) && (!f.formato || p.formato === f.formato));
