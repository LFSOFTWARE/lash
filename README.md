# lash

Site e área de alunas da **Camilla Lash** (Camilla Gama, lash designer em Osasco-SP).

Esta é a **versão de teste do front-end**: páginas estáticas em Next.js + Tailwind, publicadas no GitHub Pages.
Dados de alunas, pedidos e aulas são exemplos; ainda não há API nem banco.

## Páginas

| Rota | Tela |
|---|---|
| `/` | Landing |
| `/catalogo` | Cursos presenciais, cursos online e apostilas |
| `/cursos/extensao-de-cilios` | Página do curso (Presencial / Online) |
| `/inscricao` → `/inscricao/enviada` | Inscrição e confirmação |
| `/entrar` | Login da aluna |
| `/aluna`, `/aluna/aula` | Área da aluna |
| `/admin`, `/admin/curso` | Painel da instrutora |

Todas as telas são responsivas: o mesmo conteúdo no desktop e no celular.

## Rodar localmente

Requer Node 20 e pnpm.

```bash
pnpm install
pnpm dev
```

`pnpm build` gera o site estático em `apps/web/out`.

## Publicação

Cada push na `main` roda `.github/workflows/pages.yml`, que gera o site e publica no GitHub Pages.

## Documentos

- [PLANO.md](PLANO.md): plano do produto (Next.js, NestJS, MongoDB) e o fluxo de inscrição pelo WhatsApp.
- [DESIGN.md](DESIGN.md): regras visuais da marca.
- `design/`: protótipo em HTML usado para gerar as telas do Figma.
