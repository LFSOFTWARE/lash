// Gera prototipo.html (para abrir no navegador) e prototipo.figma.html (imagens embutidas, sem animação)
// a partir de prototipo.src.html.  Uso: node design/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));

// Ícones Lucide (traço) + glifos de marca (WhatsApp e Instagram)
const P = {
  'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
  'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  play: '<path d="M6 3l14 9-14 9V3z" fill="currentColor"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h6M16 13H8M16 17H8M10 9H8"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  grip: '<circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z"/><path d="m9 12 2 2 4-4"/>',
  package: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>',
  cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  trending: '<path d="M22 7 13.5 15.5l-5-5L2 17"/><path d="M16 7h6v6"/>',
  pencil: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  video: '<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  whatsapp: '<path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
};
const icon = (n, size = 20) => {
  if (!P[n]) throw new Error('ícone desconhecido: ' + n);
  return `<svg class="i" aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${P[n]}</svg>`;
};

const WA = 'https://wa.me/5511947692668';
const logo = '<a class="logo" href="#topo" translate="no">Camilla <span>Lash</span></a>';

const partials = {
  nav: () => `<header class="nav"><div class="row between wrap">${logo}
    <nav class="row links" aria-label="Principal"><a href="#sobre">Sobre</a><a href="#atendimentos">Atendimentos</a><a href="#curso">Curso</a><a href="#materiais">Apostila</a><a href="#resultados">Resultados</a><a href="#duvidas">Dúvidas</a></nav>
    <div class="row g12"><a class="btn sec" href="#entrar">${icon('user', 18)}Área da aluna</a><a class="btn pri" href="${WA}">${icon('whatsapp', 18)}Agendar no WhatsApp</a></div></div></header>`,
  foot: () => `<footer class="foot"><div class="row between">${logo}
    <div class="row g24 muted"><span class="row g8">${icon('map-pin', 18)}Osasco-SP</span><a class="row g8 ul" href="https://www.instagram.com/camillagama_lash/">${icon('instagram', 18)}@camillagama_lash</a><a class="row g8 ul" href="${WA}">${icon('whatsapp', 18)}(11)&nbsp;94769-2668</a></div>
    <span class="muted small">© 2026 Camilla Gama · Lash Designer</span></div></footer>`,
  sideAluna: (on) => side([['cursos', 'cap', 'Meus cursos'], ['catalogo', 'grid', 'Catálogo'], ['certificados', 'award', 'Certificados'], ['perfil', 'user', 'Meu perfil']], on,
    `<div class="help col g12"><b>Precisa de ajuda?</b><span class="muted small">Fale direto com a Camilla.</span><a class="btn pri" href="${WA}">${icon('whatsapp', 18)}WhatsApp</a></div>`),
  sideAdmin: (on) => side([['resumo', 'home', 'Resumo'], ['pedidos', 'inbox', 'Pedidos de inscrição'], ['cursos', 'cap', 'Cursos e materiais'], ['alunas', 'users', 'Alunas'], ['contatos', 'whatsapp', 'Contatos']], on,
    `<div class="row g12 who"><img class="av round" src="fotos/pdf-curso-p10-06.jpg" alt="" width="40" height="40"><div class="col"><b class="small">Camilla Gama</b><span class="muted small">Administradora</span></div></div>`),
  mnav: (title) => `<header class="mnav row between"><a class="icb" href="#voltar" aria-label="Voltar">${icon('arrow-left')}</a><b>${title}</b><span class="icb" aria-hidden="true"></span></header>`,
  mtop: () => `<header class="mnav row between">${logo}<button class="icb" type="button" aria-label="Abrir menu">${icon('menu')}</button></header>`,
};
function side(items, on, bottom) {
  return `<aside class="side col">${logo}<nav class="menu col" aria-label="Área">${items.map(([k, ic, t]) => `<a href="#${k}"${k === on ? ' class="on" aria-current="page"' : ''}>${icon(ic)}${t}</a>`).join('')}</nav><div class="bottom">${bottom}</div></aside>`;
}

let html = readFileSync(join(dir, 'prototipo.src.html'), 'utf8');
html = html.replace(/\{\{WA\}\}/g, WA);
html = html.replace(/\{\{(\w+)(?::([^}]*))?\}\}/g, (m, name, arg) => {
  if (name === 'i') { const [n, s] = arg.split(','); return icon(n, s ? +s : 20); }
  if (partials[name]) return partials[name](arg);
  throw new Error('token desconhecido: ' + m);
});
writeFileSync(join(dir, 'prototipo.html'), html);

// Versão para o Figma: imagens em base64, movimento desligado, sem fontes externas
let fig = html.replace('<html lang="pt-BR">', '<html lang="pt-BR" data-motion="off">').replace(/<link[^>]+fonts\.g[^>]+>\s*/g, '');
const cache = {};
fig = fig.replace(/src="(fotos\/[^"]+)"/g, (m, p) => {
  cache[p] ??= 'data:image/jpeg;base64,' + readFileSync(join(dir, p)).toString('base64');
  return `src="${cache[p]}"`;
});
writeFileSync(join(dir, 'prototipo.figma.html'), fig);
console.log('ok', (html.length / 1024).toFixed(0) + ' KB', '| figma', (fig.length / 1024).toFixed(0) + ' KB', '| fotos', Object.keys(cache).length);
