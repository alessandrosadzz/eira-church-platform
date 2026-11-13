# DESIGN-SYSTEM.md — Sistema de Design, Tokens e Componentes

## Eira Church — Design System Minimalista & Funcional (White Label Edition)

---

## 1. Tokens de Design (Design Tokens)

### 1.1 Cores e Contraste

```css
:root {
  /* Superfícies Neutras */
  --color-white:        #FFFFFF;
  --color-black:        #0A0A0A;
  --color-zinc-50:      #FAFAFA;
  --color-zinc-100:     #F4F4F5;
  --color-zinc-200:     #E4E4E7;
  --color-zinc-400:     #A1A1AA;
  --color-zinc-500:     #71717A;
  --color-zinc-700:     #3F3F46;
  --color-zinc-900:     #18181B;

  /* Cores Semânticas do Sistema */
  --bg-app:             var(--color-zinc-50);
  --bg-surface:         var(--color-white);
  --bg-muted:           var(--color-zinc-100);
  --bg-dark:            var(--color-black);

  --text-primary:       var(--color-black);
  --text-secondary:     var(--color-zinc-700);
  --text-muted:         var(--color-zinc-500);
  --text-inverse:       var(--color-white);

  --border-subtle:      var(--color-zinc-200);
  --border-strong:      var(--color-black);

  /* Destaque (Accent Primário: Amarelo Eira) */
  --accent-base:        #FACC15;  /* Amarelo Canário */
  --accent-hover:       #EAB308;  /* Amarelo Ouro */
  --accent-active:      #CA8A04;  /* Âmbar Escuro */
  --accent-contrast:    #000000;  /* Texto preto (11.2:1 contrast ratio) */

  /* Alternativas Paramétricas de Destaque para White Label */
  --accent-blue:        #2563EB;
  --accent-emerald:     #059669;
  --accent-amber:       #F59E0B;

  /* Status Semânticos */
  --badge-pago-bg:      #DCFCE7;  --badge-pago-text:     #166534;
  --badge-pendente-bg:  #FEF9C3;  --badge-pendente-text: #854D0E;
  --badge-isento-bg:    #E0F2FE;  --badge-isento-text:   #075985;
  --badge-alerta-bg:    #FEE2E2;  --badge-alerta-text:   #991B1B;
}

/* 5 Presets White Label Parametrizáveis */
[data-theme="solar-amber"] {
  --accent-base: #F59E0B; --accent-hover: #D97706; --accent-contrast: #000000;
}
[data-theme="royal-cobalt"] {
  --accent-base: #2563EB; --accent-hover: #1D4ED8; --accent-contrast: #FFFFFF;
}
[data-theme="emerald-life"] {
  --accent-base: #10B981; --accent-hover: #059669; --accent-contrast: #000000;
}
[data-theme="monochrome"] {
  --accent-base: #0A0A0A; --accent-hover: #27272A; --accent-contrast: #FFFFFF;
}
```

### 1.2 Espaçamentos (Spacing Scale)

| Token | Pixels | Rem | Uso Recomendado |
|---|---|---|---|
| `space-1` | 4px | 0.25rem | Espaçamento entre ícone e texto |
| `space-2` | 8px | 0.5rem | Padding interno de badges, gap entre tags |
| `space-3` | 12px | 0.75rem | Padding vertical de inputs e botões compactos |
| `space-4` | 16px | 1.0rem | Padding padrão de formulários e botões |
| `space-6` | 24px | 1.5rem | Padding de cards, modais e containers |
| `space-8` | 32px | 2.0rem | Margem entre seções e cabeçalhos |
| `space-12`| 48px | 3.0rem | Espaçamento entre blocos de conteúdo |
| `space-16`| 64px | 4.0rem | Padding superior do Hero e rodapé |

### 1.3 Opções de Bordas e Raios (Border Radius)

```css
/* Opção Padrão Selecionada: Equilibrada (Balanced) */
:root {
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 8px;     /* Inputs, botões e badges */
  --radius-lg: 12px;    /* Cards de eventos e modais */
  --radius-xl: 16px;    /* Containers destacados e banners */
  --radius-full: 9999px;/* Pills de status e avatares */
}
```

### 1.4 Sombras Físicas & Elevação (Elevation)

Ao contrário de sombras caóticas de IA, usamos elevação física arquitetônica precisa:

```css
:root {
  /* Elevação 1: Cartões em repouso */
  --shadow-card: 0 1px 2px rgba(10, 10, 10, 0.05);

  /* Elevação 2: Hover em cartões e botões táteis */
  --shadow-hover: 0 4px 12px rgba(10, 10, 10, 0.08);

  /* Elevação 3: Modais e Toasts */
  --shadow-modal: 0 12px 32px -4px rgba(10, 10, 10, 0.14);

  /* Elevação Destaque (Deslocamento Físico Opcional) */
  --shadow-hard: 3px 3px 0px var(--color-black);
}
```

### 1.5 Motion e Durações (Transições Funcionais)

```css
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 150ms;   /* Hover de botões, inputs, foco */
  --duration-normal: 200ms; /* Abertura de dropdowns, abas */
  --duration-modal: 250ms;  /* Entrada e saída de modais e toasts */
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 1.6 Camadas de Z-Index

```css
:root {
  --z-base: 1;
  --z-sticky: 100;    /* Cabeçalhos fixos */
  --z-backdrop: 200;  /* Backdrop escuro do modal */
  --z-modal: 300;     /* Janela do modal */
  --z-toast: 400;     /* Notificações no canto inferior direito */
}
```

---

## 2. Grid e Breakpoints Responsivos

- **Mobile First**: Design nativo para telas pequenas a partir de 320px.
- **Breakpoints**:
  - `sm`: 640px (smartphones horizontais e phablets)
  - `md`: 768px (tablets e iPads)
  - `lg`: 1024px (laptops e telas intermediárias)
  - `xl`: 1280px (desktops padrão)
- **Container Máximo**: `max-w-6xl` (1152px) centralizado com padding lateral seguro de 16px no mobile e 24px no desktop.

---

## 3. Especificação Completa dos Componentes de UI

### 3.1 Botões (`Button`)

- **Variante Primária Destaque (`variant="primary"`)**:
  - Fundo: Amarelo Canário `#FACC15`
  - Texto: Preto Puro `#000000` (Manrope Bold, 14px)
  - Hover: Fundo `#EAB308` + elevação sutil
  - Foco: `outline-none ring-2 ring-black ring-offset-2`
  - Ativo: Fundo `#CA8A04`
  - Desabilitado: Opacidade 0.4, cursor não permitido
  - Alvo de toque: Altura mínima de 44px
- **Variante Dark (`variant="dark"`)**:
  - Fundo: Preto Profundo `#0A0A0A`
  - Texto: Branco `#FFFFFF`
  - Hover: Fundo `#27272A`
  - Foco: `ring-2 ring-[#FACC15] ring-offset-2`
- **Variante Secundária (`variant="secondary"`)**:
  - Fundo: Branco `#FFFFFF`, borda de 1px `#E4E4E7`
  - Texto: Preto `#0A0A0A`
  - Hover: Fundo `#F4F4F5`
- **Variante Destrutiva / Perigo (`variant="danger"`)**:
  - Fundo: `#FEE2E2`, texto `#991B1B`, borda `#FCA5A5`
  - Hover: Fundo `#FCA5A5`

### 3.2 Campos de Entrada (`Input`, `Select`, `Textarea`)

- **Ergonomia Tátil Mobile (Conexão no Celular)**:
  - Altura mínima de **48px** para alvos de toque rápidos e sem erro.
  - Tamanho de fonte fixado em **16px (`1rem`)**, prevenindo o zoom involuntário no iOS Safari.
  - Atributos semânticos de teclado integrados: `inputMode="tel"` para WhatsApp, `inputMode="numeric"` para idade/vagas e `inputMode="email"`.
- **Estado Padrão**: Fundo `#FFFFFF`, borda de 1px `#E4E4E7`, texto `#0A0A0A`, padding horizontal 16px, `rounded-md`.
- **Estado de Hover**: Borda escurecida para `#A1A1AA`.
- **Estado de Foco**: `outline-none border-black ring-2 ring-[#FACC15] ring-offset-1`.
- **Estado de Erro**: Borda `#EF4444`, texto de erro com `role="alert"` e `aria-describedby` vinculado ao input.
- **Estado Desabilitado**: Fundo `#F4F4F5`, texto `#A1A1AA`, cursor not-allowed.

### 3.3 Cartão de Evento (`EventCard`)

- **Estrutura**: Fundo `#FFFFFF`, borda de 1px `#E4E4E7`, raio 12px, overflow oculto.
- **Banner 16:9**: Imagem superior proporcional, tag da rede (Hype, One Way, Padrão) posicionada com alto contraste.
- **Corpo do Card**:
  - Título do Evento em Manrope 700 (20px).
  - Informações de data e local acompanhadas de ícones SVG limpos.
  - Barra de progresso de vagas: trilha cinza `#E4E4E7` com preenchimento em `#FACC15` (ou `#EF4444` quando restarem < 10% de vagas).
  - Preço: "Gratuito" ou valor formatado em BRL com números tabulares.
  - Ação: Botão "Fazer inscrição" (ou "Esgotado" desabilitado).

### 3.4 Modal de Inscrição Multi-Step (`InscricaoModal`)

- **Backdrop**: Fundo preto com 40% de opacidade e desfoque suave de 2px (`backdrop-blur-sm`).
- **Container**: Centralizado, largura máxima de 520px, raio de 12px, scroll interno seguro.
- **Acessibilidade**:
  - `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-event-title"`.
  - Focus trap ativo no interior do modal.
  - Fechamento imediato com a tecla `Escape` ou clique no botão X ou overlay.
- **Indicador de Etapas (Step Indicator)**:
  - Etapa Concluída: Círculo preto com ícone de check branco.
  - Etapa Atual: Círculo com anel preto e fundo amarelo (`aria-current="step"`).
  - Etapa Futura: Círculo cinza neutro com número em texto muted.

### 3.5 Sistema de Notificações Toast (`Toast`)

- **Posicionamento**: Canto inferior direito (`bottom-6 right-6`), empilhamento vertical com espaçamento de 8px.
- **Duração**: Auto-dismiss em 4 segundos com barra de progresso visual decrescente.
- **Acessibilidade**:
  - `role="status"` e `aria-live="polite"` para sucesso e informação.
  - `role="alert"` para falhas ou vagas esgotadas.

### 3.6 Tabela de Inscrições do Dashboard (`DataTable`)

- **Cabeçalho**: Fundo `#FAFAFA`, texto em caixa alta de 11px, `font-bold`, cor `#71717A`, tracking `0.05em`, borda inferior `#E4E4E7`.
- **Linhas**: Altura mínima de 56px, hover suave em `#F4F4F5`, divisão por linhas de 1px.
- **Colunas**:
  - *Participante*: Nome em negrito com idade/data de nascimento e WhatsApp logo abaixo.
  - *Rede / Evento*: Nome do evento com tag discreta da rede.
  - *Status*: Badge semântico (Pendente, Pago, Isento).
  - *Método*: Badge com ícone indicador (Pix, Cartão, Dinheiro/Secretaria).
  - *Ações*: Botão de confirmação de pagamento com `aria-label="Confirmar pagamento de [Nome do Participante]"`.

---

## 4. Princípios de Redação e Microcopy

| Situação | Mensagem Recomendada (Clara e Acolhedora) | Abordagem Proibida (Slop de IA) |
|---|---|---|
| **Vagas Restantes** | "Últimas 8 vagas disponíveis." | "Corra! Desbloqueie sua vaga antes que seja tarde demais!" |
| **Evento Esgotado** | "Inscrições encerradas. Todas as vagas foram preenchidas." | "Que pena, o evento explodiu de sucesso e está lotado!" |
| **Erro de Validação** | "Informe o nome completo do responsável legal." | "Oops! Ocorreu um erro no preenchimento do formulário." |
| **Confirmação Gratuita** | "Inscrição confirmada! Guarde seu comprovante abaixo." | "Parabéns! Sua jornada transformadora começou agora!" |
| **Aguardando Pix** | "Aponte a câmera do banco ou copie o código Pix abaixo." | "Finalize seu pagamento para garantir seu lugar no topo!" |
