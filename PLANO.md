# Plano — Site + Área de Alunos (Lash & Sobrancelhas)

## 1. Objetivo

Um produto com três partes:

1. **Landing page** — apresenta a profissional, os serviços (cílios e sobrancelhas) e os cursos; converte em contato pelo WhatsApp.
2. **Área do aluno** — a aluna entra, vê os cursos liberados para ela, assiste às aulas e acompanha o progresso.
3. **Painel administrativo** — a instrutora cadastra cursos/aulas, vê os pedidos de inscrição e libera o acesso depois do pagamento.

Sem pagamento online nesta fase: o pagamento é combinado no WhatsApp e a liberação é manual.

## 2. Fluxo principal (inscrição sem pagamento)

1. Visitante abre a página de um curso e clica em **"Quero me inscrever"**.
2. Preenche nome, WhatsApp, e-mail e cria uma senha (a conta já nasce aqui).
3. O sistema grava um **pedido de inscrição** com status `pendente` e abre o WhatsApp da instrutora com mensagem pronta ("Olá! Quero me inscrever no curso X…").
4. O pagamento acontece fora da plataforma.
5. No painel, a instrutora clica em **"Liberar acesso"** no pedido → status `ativa`.
6. A aluna entra e o curso aparece em "Meus cursos". Enquanto pendente, ela vê "Aguardando confirmação" com botão para o WhatsApp.

A instrutora também pode cadastrar uma aluna e liberar um curso direto pelo painel (para quem fechou tudo pelo WhatsApp).

**Apostilas e outros materiais** seguem o mesmo fluxo: a pessoa pede pelo catálogo, combina o pagamento no WhatsApp e, depois da liberação, baixa o arquivo em "Minhas apostilas". O download passa pela API (link assinado e temporário), só para quem tem acesso liberado.

## 2.1 Protótipo

- Marca: **Camilla Lash** (Camilla Gama, Osasco-SP, @camillagama_lash). Regras visuais em [DESIGN.md](DESIGN.md).
- Figma: página `lash-teste` do arquivo `teste-claude` — 7 telas desktop e 6 mobile (os frames `v1 / …` são a primeira versão).
- Fonte das telas: [design/prototipo.src.html](design/prototipo.src.html); `node design/build.mjs` gera `prototipo.html` (com animações) e `prototipo.figma.html` (para o Figma).
- Fotos em `design/fotos/` (Instagram e PDFs dela).
- Conteúdo real usado: curso presencial de Extensão de Cílios — Iniciante (2 dias, 5 técnicas, kit de 20 itens, R$ 1.000 à vista ou 12x) e Apostila Profissional (30 páginas).

**Formatos:** os cursos existem em dois formatos, **presencial e online**, vendidos como itens separados do catálogo.
- Presencial: turma com data (combinada pelo WhatsApp nesta fase), kit e prática com modelo. Na área da aluna aparece em "Turma presencial", com a apostila.
- Online: aulas gravadas com progresso, apostila e certificado.
- Falta definir o preço do online (no protótipo está "valor sob consulta").

## 3. Stack

| Camada | Escolha |
|---|---|
| Front | Next.js (App Router) + TypeScript + Tailwind CSS |
| API | NestJS + TypeScript |
| Banco | MongoDB (Atlas) com Mongoose |
| Autenticação | JWT em cookie httpOnly (access + refresh), senha com argon2 |
| Validação | class-validator na API, Zod + React Hook Form no front |
| Vídeos | Provedor externo com link protegido (ver decisão 1) |
| Imagens | Armazenamento de objetos (Cloudflare R2 ou S3) |
| Repositório | Monorepo pnpm: `apps/web`, `apps/api`, `packages/shared` (tipos) |
| Testes | Jest (API) + Playwright (fluxos de ponta a ponta) |
| Deploy | Vercel (web) + Railway ou Render (API) + MongoDB Atlas |

## 4. Modelo de dados (MongoDB)

- **users** — nome, e-mail (único), whatsapp, senhaHash, papel (`aluna` | `admin`), criadoEm
- **products** — tudo o que está à venda: tipo (`curso` | `apostila` | `planilha` | `combo`), título, slug, descrição, capa, categoria (`cilios` | `sobrancelhas`), preço (só exibição), precoOriginal (opcional), publicado, ordem
  - se `precoOriginal` existir e for maior que `preço`, o site mostra o valor antigo riscado, o preço atual e o selo de desconto (% calculado, arredondado); em branco, mostra só o preço atual
  - se `curso`: formato (`presencial` | `online`), cargaHoraria, nível
    - online: as aulas ficam em modules/lessons
    - presencial: local, itens do kit; a matrícula guarda `dataTurma` (preenchida pela instrutora)
  - se `apostila`/`planilha`: arquivo (PDF etc.), páginas
  - se `combo`: itens[] (ids de outros produtos; liberar o combo libera todos)
- **modules** — courseId (produto do tipo curso), título, ordem
- **lessons** — moduleId, courseId, título, descrição, videoProvider, videoId, duração, materiais[] (PDFs), ordem, aulaGratis
- **enrollments** (pedidos/acessos) — userId, productId, status (`pendente` | `ativa` | `cancelada`), solicitadaEm, liberadaEm, liberadaPor, expiraEm (opcional)
- **progress** — userId, lessonId, courseId, concluida, ultimoSegundo, atualizadoEm
- **leads** — nome, whatsapp, interesse, origem (formulário de contato da landing)

Índices: `users.email`, `courses.slug`, `enrollments (userId, courseId)` único, `progress (userId, lessonId)` único.

## 5. API (NestJS) — módulos

- **auth** — cadastro, login, logout, refresh, esqueci/redefinir senha
- **users** — perfil da aluna; listagem para admin
- **courses / modules / lessons** — leitura pública do catálogo; CRUD só para admin
- **enrollments** — criar pedido, listar os meus; admin lista, libera e cancela
- **progress** — marcar aula concluída, salvar posição do vídeo
- **leads** — receber contato da landing
- **uploads** — URL assinada para capa e materiais

Regra central de segurança: o endereço do vídeo de uma aula só é devolvido se existir matrícula `ativa` para aquela aluna naquele curso (ou se a aula for gratuita). A checagem fica em um guard da API, não no front.

## 6. Páginas (Next.js)

**Público**
- `/` — landing: hero, sobre ela, serviços, cursos em destaque, depoimentos, antes/depois, perguntas frequentes, CTA WhatsApp
- `/catalogo` — cursos, apostilas, planilhas e combos, com filtro por tipo e categoria
- `/cursos/[slug]` e `/apostilas/[slug]` — página de venda (curso com grade de aulas; apostila com amostra e sumário)
- `/inscricao/[slug]` — formulário de inscrição
- `/entrar`, `/cadastro`, `/recuperar-senha`

**Aluna** (`/aluna`)
- Meus cursos (com progresso e pedidos pendentes)
- `/aluna/cursos/[slug]` — player, lista de módulos/aulas, materiais, marcar como concluída
- Perfil

**Admin** (`/admin`)
- Resumo (pedidos pendentes, alunas ativas)
- Pedidos de inscrição — liberar / cancelar
- Cursos — criar, editar, ordenar módulos e aulas, publicar
- Alunas — listar, ver matrículas, liberar curso manualmente
- Contatos (leads)

## 7. Processo de design (as 5 ferramentas + Figma)

| Ferramenta | Onde entra |
|---|---|
| **Figma** (você vai enviar) | Fonte da verdade do visual: cores, tipografia, espaçamentos, componentes. Extraio os tokens para o tema do Tailwind e implemento tela por tela. |
| **Awesome Design** (getdesign.md) | Gerar o `DESIGN.md` do projeto com as regras visuais, para manter consistência nas telas que o Figma não cobrir (painel admin, estados vazios, erros). |
| **Taste Skill** (tasteskill.dev) | Ativa durante a construção das telas para elevar o acabamento: hierarquia, respiro, tipografia, microinterações. |
| **Image to Code** (github) | Converter telas/prints do Figma ou referências em componentes iniciais, depois refinados à mão. |
| **Web Design Guidelines** (skills.sh) | Revisão de cada tela pronta: acessibilidade, responsividade, formulários, foco, contraste. |
| **Playwright CLI** (playwright.dev) | Abrir o site, tirar prints em celular e desktop, comparar com o Figma e rodar os testes dos fluxos. |

Ciclo por tela: Figma → componente → Taste Skill → revisão com Web Design Guidelines → print com Playwright e comparação com o Figma.

Prioridade de layout: **celular primeiro** — o público chega principalmente pelo Instagram.

## 8. Etapas

**Etapa 0 — Base**
Monorepo, Next + Nest + Mongo rodando local (Docker para o Mongo), lint, variáveis de ambiente, instalação das 5 ferramentas, `DESIGN.md` e tema do Tailwind a partir do Figma.

**Etapa 1 — Landing page**
Todas as seções, botão de WhatsApp, formulário de contato, SEO básico (títulos, Open Graph, sitemap). Já pode ir ao ar sozinha.

**Etapa 2 — Contas e catálogo**
Cadastro/login, papéis, catálogo e página do curso lendo do banco, dados de exemplo.

**Etapa 3 — Inscrição e liberação**
Formulário de inscrição, redirecionamento ao WhatsApp, painel de pedidos com "Liberar acesso".

**Etapa 4 — Área da aluna**
Meus cursos, player protegido, progresso, materiais para baixar.

**Etapa 5 — Painel admin completo**
CRUD de cursos, módulos e aulas, upload de capa e materiais, gestão de alunas.

**Etapa 6 — Acabamento e publicação**
Testes de ponta a ponta, revisão de acessibilidade e desempenho, deploy, domínio, conta admin dela.

**Depois (fora do escopo inicial)**
Pagamento online (Pix/cartão), certificado em PDF, comentários nas aulas, avisos por e-mail/WhatsApp, agendamento de atendimentos.

## 9. Decisões em aberto

1. **Onde ficam os vídeos** — é a decisão que mais pesa.
   - *Recomendado: Bunny Stream* — barato (poucos dólares/mês), link assinado que expira, difícil de compartilhar.
   - Vimeo pago — simples, restringe por domínio, custo mensal maior.
   - YouTube não listado — grátis, mas qualquer aluna pode repassar o link.
2. **Nome da marca e domínio** — para textos, SEO e deploy.
3. **Acesso ao curso expira?** — vitalício ou por prazo (ex.: 12 meses). O modelo já prevê `expiraEm`.
4. **Há cursos presenciais?** — se sim, a página do curso precisa de datas/turmas/vagas em vez de aulas em vídeo.
5. **Conteúdo** — fotos dela, antes/depois, depoimentos, lista de cursos e preços.

## 10. O que preciso de você para começar

- Link do Figma
- Os links/instruções de instalação das 5 ferramentas
- Respostas às decisões da seção 9 (posso seguir com as recomendadas)
