# Teams Hero Scroll Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer a secao `TOP TIER S TEAMS` se materializar sem borda visivel sobre o hero, que desfoca e desaparece durante o scroll, liberando o fluxo normal antes de `TOP RANKING`.

**Architecture:** Um contenedor local agrupa apenas o hero e a primeira `surface`, fornecendo a distancia da transicao. CSS sticky, filtro progressivo e mascara linear controlam desfoque, escurecimento, deslocamento e dissolucao; JavaScript calcula o progresso real da pagina com atualizacoes agrupadas por `requestAnimationFrame`.

**Tech Stack:** HTML5, CSS, JavaScript sem dependencias, Node.js built-in test runner, ASP.NET Core.

## Global Constraints

- Alterar somente a transicao entre o hero e `TOP TIER S TEAMS`.
- Manter `TOP RANKING`, cards, modal e conteudo posterior no fluxo normal.
- Nao interceptar eventos de wheel, teclado ou touch.
- Respeitar `prefers-reduced-motion: reduce`.
- Nao adicionar biblioteca externa.
- Usar intensidade cinematografica media, sem linha horizontal visivel na entrada da secao.
- A verificacao final de build, inicializacao e HTTP 200 sera executada por outro agente.

---

### Task 1: Estrutura e contrato da transicao

**Files:**
- Create: `frontend/tests/teams-hero-scroll-transition.test.js`
- Modify: `frontend/teams.html`
- Modify: `frontend/visual/styles/velotv-events.css`

**Interfaces:**
- Consumes: `.teams-hero` e a primeira `.surface` existentes.
- Produces: `.teams-intro-transition`, `.teams-intro-stage` e a propriedade CSS `--hero-transition-progress` no contenedor.

- [ ] **Step 1: Escrever o teste estrutural que falha**

Criar um teste com `node:test` que leia os dois arquivos e confirme: contenedor isolando exatamente hero e primeira surface; estilo sticky; uso da variavel de progresso; regra de movimento reduzido; script com `requestAnimationFrame`; `TOP RANKING` fora do contenedor.

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `node --test frontend/tests/teams-hero-scroll-transition.test.js`

Expected: FAIL porque `.teams-intro-transition` ainda nao existe.

- [ ] **Step 3: Implementar o HTML e CSS minimos**

Em `teams.html`, envolver somente o hero e a primeira surface:

```html
<div class="teams-intro-transition">
  <div class="teams-intro-stage">
    <section class="page-hero teams-hero">...</section>
    <section class="surface teams-overview">...</section>
  </div>
</div>
<section class="surface player-ranking-section">...</section>
```

Em `velotv-events.css`, adicionar regras locais que criem altura de scroll, fixem o stage, desloquem a overview de baixo para cima e reduzam a opacidade do hero conforme `--hero-transition-progress`. Em movimento reduzido, restaurar display e posicionamento normais.

- [ ] **Step 4: Adicionar o controlador de progresso**

No script existente de `teams.html`, selecionar `.teams-intro-transition`, calcular `progress = clamp(-rect.top / (rect.height - innerHeight), 0, 1)` e escrever o valor no CSS. Registrar listeners passivos de `scroll`, listener de `resize` e agrupar chamadas em `requestAnimationFrame`.

- [ ] **Step 5: Executar o teste e confirmar sucesso**

Run: `node --test frontend/tests/teams-hero-scroll-transition.test.js`

Expected: PASS para estrutura, isolamento, progresso e movimento reduzido.

### Task 2: Verificacao funcional e entrega

**Files:**
- Verify: `frontend/teams.html`
- Verify: `frontend/visual/styles/velotv-events.css`
- Verify: `frontend/tests/teams-hero-scroll-transition.test.js`

**Interfaces:**
- Consumes: aplicacao ASP.NET Core em `http://localhost:5152`.
- Produces: evidencia de build limpo, inicializacao limpa e respostas HTTP 200.

- [ ] **Step 1: Executar verificacoes locais antes da delegacao**

Run: `node --test frontend/tests/teams-hero-scroll-transition.test.js`

Expected: todos os testes PASS.

Run: `git diff --check`

Expected: nenhuma saida e exit code 0.

- [ ] **Step 2: Delegar a verificacao final a outro agente**

O agente deve executar `dotnet build`, iniciar `dotnet run --no-build --urls http://localhost:5152`, aguardar a porta responder por condicao, requisitar `/teams.html` e `/visual/styles/velotv-events.css`, confirmar HTTP 200, relatar qualquer warning/erro de build ou inicializacao e encerrar somente o processo iniciado por ele.

- [ ] **Step 3: Validar a animacao no navegador**

Abrir `http://localhost:5152/teams.html`, verificar o topo, metade e fim da transicao, retorno ao rolar para cima, fluxo normal em `TOP RANKING`, modal dos cards e viewport mobile.

- [ ] **Step 4: Registrar as alteracoes**

```bash
git add frontend/teams.html frontend/visual/styles/velotv-events.css frontend/tests/teams-hero-scroll-transition.test.js docs/superpowers/plans/2026-07-14-teams-hero-scroll-transition.md
git commit -m "feat: add teams hero scroll transition"
```

### Task 3: Dissolucao sombreada e desfoque do hero

**Files:**
- Modify: `frontend/tests/teams-hero-scroll-transition.test.js`
- Modify: `frontend/teams.html`
- Modify: `frontend/visual/styles/velotv-events.css`

**Interfaces:**
- Consumes: `progress` calculado por `updateIntroTransition()`.
- Produces: `--hero-transition-blur`, `--hero-transition-brightness` e `--teams-overview-feather`.

- [ ] **Step 1: Estender o teste para o acabamento visual**

Adicionar assercoes que exijam filtro com blur/brightness no hero, mascara padrao e WebKit na overview, atualizacao das tres variaveis pelo JavaScript e remocao de filtro/mascara em movimento reduzido.

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `node frontend/tests/teams-hero-scroll-transition.test.js`

Expected: FAIL porque as variaveis de blur, brilho e feather ainda nao existem.

- [ ] **Step 3: Implementar o efeito minimo**

Adicionar defaults das variaveis ao contenedor, aplicar `filter: blur(...) brightness(...)` ao hero e aplicar `mask-image`/`-webkit-mask-image` em degradê na overview. Atualizar as variaveis no mesmo `requestAnimationFrame`, usando ate 16px de blur, brilho minimo de 0.58 e feather inicial de 30vh que chega proximo de zero ao fim.

- [ ] **Step 4: Preservar movimento reduzido**

No media query existente, fixar blur em 0, brilho em 1, feather em 0 e remover explicitamente filtro e mascara.

- [ ] **Step 5: Executar teste e diff check**

Run: `node frontend/tests/teams-hero-scroll-transition.test.js`

Expected: 4 testes PASS, 0 falhas.

Run: `git diff --check`

Expected: exit code 0.
