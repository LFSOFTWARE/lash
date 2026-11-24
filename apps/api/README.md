# API — Camilla Lash

NestJS + MongoDB (Mongoose). Serve o catálogo, a inscrição pelo WhatsApp, a área da aluna e o painel da instrutora.

## Rodar

```bash
docker compose up -d          # na raiz: MongoDB em localhost:27017
cp apps/api/.env.example apps/api/.env
pnpm seed                     # admin, catálogo, grade do curso online e uma aluna de exemplo
pnpm dev:api                  # http://localhost:3333/api
```

- Documentação interativa (Swagger): http://localhost:3333/api/docs
- Testes de ponta a ponta (precisam do Mongo rodando): `pnpm test:api`

Contas do seed, só para desenvolvimento:

| Conta | E-mail | Senha |
|---|---|---|
| Admin | `ADMIN_EMAIL` (padrão `camilla@example.com`) | `ADMIN_SENHA` (padrão `admin12345`) |
| Aluna | `aluna@example.com` | `aluna12345` |

## Regras

- **Preços em centavos.** `precoOriginal` é opcional; se for maior que `preco`, a resposta traz `desconto` em %, arredondado. Enviar `null` apaga o campo.
- **Sem pagamento online.** A inscrição cria a conta e um pedido `pendente` e devolve `whatsappUrl` com a mensagem pronta. Depois do pagamento, a instrutora clica em "Liberar acesso" e o pedido fica `ativa`.
- **Acesso:** a aluna tem acesso a um produto se tiver pedido `ativa` (e não vencido em `expiraEm`) nele ou num combo que o inclua.
- **Vídeo:** só sai para quem tem acesso, ou se a aula for grátis. A checagem é na API. No Bunny Stream com `BUNNY_TOKEN_KEY`, o link é assinado e expira.
- **Arquivos** (apostilas, materiais): nunca são públicos. O download é por link temporário de 5 minutos. O armazenamento pode ser local (`STORAGE_DRIVER=local`) ou S3 / Cloudflare R2 (`s3`). As capas são públicas.
- **Login:** JWT. O access token dura 15 minutos e o refresh token 30 dias. Ambos vão em cookies httpOnly e também no corpo da resposta, para uso como `Authorization: Bearer`. Logout e troca de senha encerram todas as sessões.
- **Esqueci a senha:** ainda não há envio de e-mail. A instrutora gera o link pelo painel (`POST /admin/alunas/:id/link-senha`), que já vem com a mensagem de WhatsApp pronta.

## Rotas (prefixo `/api`)

**Público**

| Método | Rota | O que faz |
|---|---|---|
| GET | `/health` | API e banco no ar |
| GET | `/produtos?tipo=&formato=&categoria=` | Catálogo publicado |
| GET | `/produtos/:slug` | Página do produto; o curso online vem com a grade (títulos e nomes dos materiais, sem os vídeos) |
| POST | `/inscricoes` | Cria a conta e o pedido; devolve `whatsappUrl` e os tokens |
| POST | `/leads` | Formulário de contato da landing |
| GET | `/aulas/:id/video` | Player (aula grátis ou aluna com acesso) |

**Conta**: `POST /auth/cadastro`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/esqueci-senha`, `/auth/redefinir-senha` e `GET /auth/me`.

**Aluna** (login)

| Método | Rota | O que faz |
|---|---|---|
| GET | `/aluna/pedidos` | Meus cursos e apostilas, com status e progresso |
| POST | `/aluna/pedidos` | Pedir outro produto |
| GET | `/aluna/produtos` | Produtos liberados, com os itens de combos já abertos |
| GET | `/aluna/cursos/:slug` | Curso com módulos, aulas, progresso e próxima aula |
| PUT | `/aluna/progresso/:aulaId` | `{ concluida?, ultimoSegundo? }` |
| GET | `/aluna/produtos/:id/download` | Link temporário da apostila |
| GET | `/aluna/aulas/:id/materiais/:i` | Link temporário de um material da aula |
| PATCH | `/aluna/perfil` | Nome e WhatsApp |
| PUT | `/aluna/senha` | Trocar a senha |

**Painel** (admin)

| Método | Rota | O que faz |
|---|---|---|
| GET | `/admin/resumo` | Números do topo e os pedidos pendentes recentes |
| GET | `/admin/pedidos?status=&tipo=&busca=&pagina=` | Pedidos com aluna e produto |
| POST | `/admin/pedidos/:id/liberar` | Liberar acesso (`dataTurma`, `expiraEm` opcionais) |
| POST | `/admin/pedidos/:id/cancelar` | Cancelar |
| PATCH | `/admin/pedidos/:id` | Data da turma, validade, anotação |
| POST | `/admin/pedidos` | Liberar direto para uma aluna existente ou nova |
| GET | `/admin/alunas`, `/admin/alunas/:id` | Alunas e os pedidos de cada uma |
| POST | `/admin/alunas/:id/link-senha` | Link para criar senha nova, com mensagem de WhatsApp |
| GET, POST, PATCH, DELETE | `/admin/produtos[/:id]` | Produtos (apagar só sem pedidos) |
| GET, POST | `/admin/produtos/:id/modulos` | Grade do curso online |
| PUT | `/admin/produtos/:id/modulos/ordem` | Reordenar módulos |
| PATCH, DELETE | `/admin/modulos/:id` | Editar ou apagar um módulo |
| POST | `/admin/modulos/:id/aulas` | Nova aula |
| PUT | `/admin/modulos/:id/aulas/ordem` | Reordenar aulas |
| PATCH, DELETE | `/admin/aulas/:id` | Editar, mover ou apagar uma aula |
| POST | `/admin/uploads` | Enviar arquivo (multipart, campo `arquivo`; `publico=true` para capa) |
| GET, PATCH | `/admin/leads[/:id]` | Contatos da landing |

## Produção

- Defina `NODE_ENV=production`, os três segredos (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `FILES_SECRET`), `MONGODB_URI` (Atlas), `WEB_ORIGIN`, `WEB_URL` e `API_URL`.
- Front e API em domínios diferentes: use `COOKIE_SAMESITE=none` com HTTPS, ou use só o `Authorization: Bearer`.
- Use `STORAGE_DRIVER=s3`: o disco de Railway e Render se apaga a cada deploy.
- Build: `pnpm build:api`; start: `pnpm --filter api start`.
- Depois do primeiro deploy, rode `pnpm seed` uma vez com `ADMIN_EMAIL` e `ADMIN_SENHA` reais.
