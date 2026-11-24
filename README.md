# lash

Site e área de alunas da **Camilla Lash** (Camilla Gama, lash designer em Osasco-SP).

- `apps/web`: front em Next.js + Tailwind, ligado à API. Sem `NEXT_PUBLIC_API_URL`, roda em **modo de exemplo** (dados na memória da página, nada é salvo); é assim que está publicado no GitHub Pages enquanto a API não tem hospedagem.
- `apps/api`: API em NestJS + MongoDB (catálogo, inscrição pelo WhatsApp, área da aluna e painel). Veja [apps/api/README.md](apps/api/README.md).

## Páginas

| Rota | Tela |
|---|---|
| `/` | Landing |
| `/catalogo` | Tudo: cursos presenciais, cursos online e apostilas, com preços |
| `/cursos` | Todos os cursos (presenciais e online), com preços |
| `/apostilas` | Todas as apostilas, com preços |
| `/cursos/extensao-de-cilios` | Página do curso (Presencial / Online) |
| `/inscricao?produto=slug` → `/inscricao/enviada` | Inscrição (cria a conta e o pedido) e confirmação com o WhatsApp |
| `/entrar`, `/redefinir-senha?token=` | Login, esqueci a senha e criar senha pelo link da Camilla |
| `/aluna` | Meus cursos, turmas, apostilas, certificados e perfil |
| `/aluna/aula?curso=slug&aula=id` | Sala de aula: vídeo, materiais e progresso |
| `/admin` | Pedidos: liberar, cancelar e liberar direto para uma aluna |
| `/admin/alunas` | Alunas, pedidos de cada uma e link para criar senha |
| `/admin/curso?id=` | Produtos: informações, preço, capa, PDF e a grade de aulas do curso online |

Todas as telas são responsivas: o mesmo conteúdo no desktop e no celular.

## Rodar localmente

Requer Node 20, pnpm e Docker (para o MongoDB).

```bash
pnpm install
docker compose up -d     # MongoDB
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local   # front fala com a API local
pnpm seed                # dados iniciais
pnpm dev:api             # API em http://localhost:3333/api (docs em /api/docs)
pnpm dev                 # front em http://localhost:3000
pnpm test:api            # testes da API
```

Sem o `apps/web/.env.local`, o front abre em modo de exemplo. Nesse modo, qualquer e-mail e senha entram, e um e-mail com “camilla” abre o painel.

O front guarda a sessão no navegador e manda o token como `Authorization: Bearer`. Assim funciona mesmo com o site e a API em domínios diferentes.

`pnpm build` gera o site estático em `apps/web/out`.

## Publicação

Cada push na `main` roda `.github/workflows/pages.yml`, que gera o site e publica no GitHub Pages (em modo de exemplo). Quando a API estiver no ar, crie a variável de repositório `NEXT_PUBLIC_API_URL`, por exemplo `https://api.seudominio.com/api`, e o próximo build passa a usar a API.
Mudanças em `apps/api` rodam `.github/workflows/api.yml`, com os testes da API contra um MongoDB. A API ainda não está publicada.

## Documentos

- [PLANO.md](PLANO.md): plano do produto (Next.js, NestJS, MongoDB) e o fluxo de inscrição pelo WhatsApp.
- [DESIGN.md](DESIGN.md): regras visuais da marca.
- `design/`: protótipo em HTML usado para gerar as telas do Figma.
