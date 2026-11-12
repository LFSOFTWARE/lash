# DESIGN.md — Camilla Lash

Sistema visual do site e da área da aluna de Camilla Gama (lash designer e instrutora, Osasco-SP).
Derivado do material dela: apresentação do curso (rosa-claro, malva, ameixa) e apostila (bege, serifada).
Qualquer tela nova deve seguir este arquivo.

## 1. Tema visual e atmosfera

Delicado, limpo e profissional. Muito respiro, fotos reais do trabalho dela, quase nada de enfeite.
A interface é ~90% neutra (rosa-claro quase branco e tinta ameixa); a cor de marca aparece pouco e por isso pesa.
Nada de gradiente, vidro, emoji, sombra em repouso ou roxo.

## 2. Paleta e papéis

| Token | Hex | Papel |
|---|---|---|
| `bg` | `#FBF5F4` | Fundo padrão |
| `bg-2` | `#F5E7E8` | Faixas alternadas, campos de destaque suave |
| `surface` | `#FFFFFF` | Cartões, campos, barras |
| `ink` | `#33202A` | Texto, ícones; linhas a 14% |
| `muted` | `#7B636B` | Rótulos, metadados, segunda metade de títulos |
| `accent` | `#9B4A60` | Botão primário, links, foco, progresso |
| `accent-d` | `#7E3A4E` | Hover/pressionado do accent |
| `deep` | `#5F3542` | Uma única faixa de marca por página (ex.: "Como funciona") |
| `ok` / `ok-bg` | `#2F6B4F` / `#E4F0E9` | Status liberado/concluído |
| `warn` / `warn-bg` | `#8A5A0B` / `#FAEED3` | Status aguardando |

Um único accent. Fora do botão primário, links e foco, ele ocupa menos de 3% da tela.

## 3. Tipografia

- **Títulos:** Cormorant Garamond 500, entrelinha 1.05–1.1, tracking −0.01em, `text-wrap: balance`.
- **Texto e interface:** DM Sans 400/500/600.

| Papel | Desktop | Mobile |
|---|---|---|
| h1 | 72px | 44px |
| h2 | 48px | 34px |
| h3 | 28px | 24px |
| lead | 19px / 1.6 | 17px |
| corpo | 16px / 1.6 | 16px |
| pequeno | 14px | 14px |
| rótulo | 13px / 500 | 13px |

Caixa normal (sem versalete com tracking). Nada abaixo de 13px. Medida máxima ~62 caracteres.
Destaque em título é por contraste: a segunda metade vai em `muted`. Números em colunas usam `tabular-nums`.

## 4. Componentes

- **Botão** — pílula, 44px (48px no mobile), 15px/600. Primário: `accent` + branco. Secundário: contorno `ink` 25%.
  Hover sobe 1px e escurece; pressionado desce 1px com `scale(.985)`; foco com anel `accent` de 2px afastado 2px.
- **Link de texto** — `accent`, sublinhado que se desenha no hover; seta anda 3px.
- **Cartão** — `surface`, linha `ink` 14%, raio 20px, sem sombra. Cartão clicável sobe 2px no hover.
- **Foto** — raio 20px, `object-fit: cover`; zoom 1.03 dentro da moldura no hover.
- **Etiqueta** — pílula 26px, 13px/500, fundo `bg-2`; variantes `ok` e `warn`.
- **Campo** — 48px, raio 12px, linha `ink` 14%, rótulo acima sempre visível; foco troca a linha por `accent`.
- **Barra de progresso** — 6px, trilho `bg-2`, preenchimento `accent`.
- **Ícones** — Lucide em linha, traço 1.75, herdam a cor do texto, `aria-hidden`. WhatsApp e Instagram usam o glifo da marca. Ícones não animam.

## 5. Layout

- Escala de espaço: 4, 8, 12, 16, 24, 32, 48, 64, 96, 120.
- Largura de conteúdo 1280px (margem lateral 80px em 1440; 20px no mobile).
- Seção: 120px em cima e 72px embaixo (72/40 no mobile). Título → conteúdo: 48px (32px no mobile).
- Navegação fixa de 72px (56px no mobile). Cartões a 24px (12px no mobile).
- Cada seção cabe em uma ou duas telas e começa pelo título.

## 6. Profundidade

Plano. Hierarquia por cor de fundo (`bg` → `bg-2` → `surface`) e por linha fina, não por sombra.
Sombra só aparece em elemento flutuante de verdade (menu, modal).

## 7. Faça e não faça

**Faça:** fotos reais dela e do trabalho; números e textos verdadeiros (7 anos, 2 dias, 5 técnicas, kit de 20 itens);
rótulos de botão específicos ("Quero me inscrever", "Liberar acesso"); estados vazios e de espera explícitos.

**Não faça:** depoimento, número ou preço inventado; rótulo "eyebrow" em versalete; numeração 01/02/03;
gradiente; emoji como ícone; grade de cartões de ícone genéricos; carrossel; revelar cartões no scroll; itálico decorativo.

## 8. Movimento

Três camadas, só `transform` e `opacity`:
1. **Entrada do hero**, uma vez: título, texto e botões sobem 12px em sequência (~1s no total).
2. **Um momento por página:** barra de progresso que preenche (área da aluna) ou acordeão das dúvidas (landing).
3. **Hover e pressionado** em todo link, botão, cartão e foto (150ms entrar, 120ms sair, 90ms pressionar).

Sem quique, parallax, marquee ou scroll forçado. `prefers-reduced-motion` e `data-motion="off"` deixam tudo no quadro final.

## 9. Responsivo

Conferir em 1440, 1024, 768 e 390. No mobile: uma coluna, botões de largura total, alvos de toque ≥ 44px,
menu em folha de tela cheia, barra de abas fixa na área da aluna.

## Guia rápido para agentes

> Fundo `#FBF5F4`, tinta `#33202A`, accent `#9B4A60`. Títulos Cormorant Garamond 500, texto DM Sans.
> Botão pílula 44px. Cartão branco, linha fina, raio 20, sem sombra. Ícones Lucide traço 1.75.
> Use só fotos e dados reais da Camilla; se faltar, deixe o espaço marcado em vez de inventar.
