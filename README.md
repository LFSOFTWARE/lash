# lash

Site e área de alunas da **Camilla Lash** (Camilla Gama, lash designer em Osasco-SP).

- `apps/web`: front em Next.js + Tailwind. A versão de teste está publicada no GitHub Pages e usa dados de exemplo; ainda não chama a API.
- `apps/api`: API em NestJS + MongoDB (catálogo, inscrição pelo WhatsApp, área da aluna e painel). Veja [apps/api/README.md](apps/api/README.md).

## Páginas

| Rota | Tela |
|---|---|
| `/` | Landing |
| `/catalogo` | Tudo: cursos presenciais, cursos online e apostilas, com preços |
| `/cursos` | Todos os cursos (presenciais e online), com preços |
| `/apostilas` | Todas as apostilas, com preços |
| `/cursos/extensao-de-cilios` | Página do curso (Presencial / Online) |
| `/inscricao` → `/inscricao/enviada` | Inscrição e confirmação |
| `/entrar` | Login da aluna |
| `/aluna`, `/aluna/aula` | Área da aluna |
| `/admin`, `/admin/curso` | Painel da instrutora |

Todas as telas são responsivas: o mesmo conteúdo no desktop e no celular.

## Rodar localmente

Requer Node 20, pnpm e Docker (para o MongoDB).

```bash
pnpm install
pnpm dev                 # front em http://localhost:3000

docker compose up -d     # MongoDB
cp apps/api/.env.example apps/api/.env
pnpm seed                # dados iniciais
pnpm dev:api             # API em http://localhost:3333/api (docs em /api/docs)
pnpm test:api            # testes da API
```

`pnpm build` gera o site estático em `apps/web/out`.

## Publicação

Cada push na `main` roda `.github/workflows/pages.yml`, que gera o site e publica no GitHub Pages.
Mudanças em `apps/api` rodam `.github/workflows/api.yml`, com os testes da API contra um MongoDB. A API ainda não está publicada.

## Documentos

- [PLANO.md](PLANO.md): plano do produto (Next.js, NestJS, MongoDB) e o fluxo de inscrição pelo WhatsApp.
- [DESIGN.md](DESIGN.md): regras visuais da marca.
- `design/`: protótipo em HTML usado para gerar as telas do Figma.
