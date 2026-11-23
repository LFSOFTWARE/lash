/** Desconto em % (arredondado) quando o preço original é maior que o atual; senão null. */
export function desconto(preco: number, precoOriginal?: number | null): number | null {
  if (!precoOriginal || precoOriginal <= preco) return null;
  return Math.round((1 - preco / precoOriginal) * 100);
}

export function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Número no formato do wa.me: com DDI 55 quando vier só DDD + número. */
export function waNumero(digitos: string) {
  return digitos.length <= 11 ? `55${digitos}` : digitos;
}

export function waLink(numero: string, mensagem: string) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

/** 100000 → "R$ 1.000,00" */
export function reais(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
