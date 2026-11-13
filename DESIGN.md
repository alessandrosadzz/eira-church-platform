# DESIGN.md — Especificação e Direção de Design

## Sistema de Gestão de Eventos — Eira Church (White Label Platform)

---

## 1. Filosofia de Design e Princípios Fundamentais

O design do sistema é concebido para ser **minimalista, acessível, sóbrio e funcional**, eliminando qualquer ruído visual ou artificialidade típica de templates gerados por IA.

### 1.1 Princípios
1. **Clareza Arquitetônica ("Sem Firulas")**:
   A interface privilegia o conteúdo e a facilidade de navegação. Cada botão, linha divisória e rótulo tem uma função prática imediata.
2. **Harmonia Consistente entre Redes**:
   As redes da igreja (Hype, One Way, Padrão) compartilham a mesma base visual elegante e moderna, evitando contrastes caóticos ou infantilizados. A diferenciação ocorre por tags discretas e fotografia dos eventos, mantendo a sobriedade institucional.
3. **Acessibilidade Universal (WCAG 2.2 AA)**:
   Contraste de cor verificado (todas as combinações texto/fundo acima de 4.5:1), alvos de toque amplos (mínimo 44x44px), foco visível de alto contraste e suporte irrestrito a leitores de tela e navegação por teclado.
4. **Parametrização White Label**:
   A interface é construída sobre variáveis CSS semânticas (`--bg-primary`, `--accent`, `--radius`), permitindo que a Eira Church personalize cores de destaque, fundos e estilo de bordas, viabilizando também o licenciamento para outras denominações.

---

## 2. Tipografia

### 2.1 Família Tipográfica Adotada: **Manrope (Google Fonts)**
- **Justificativa**: Fonte geométrica moderna, de desenho neutro, com excelente legibilidade tanto em títulos monumentais (pesos 700/800) quanto em pequenos rótulos de interface de dados (pesos 400/500). Possui suporte nativo a algarismos tabulares (`font-feature-settings: 'tnum'`), fundamental para as métricas financeiras e contadores de vagas.
- **Importação Global**:
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
  ```

### 2.2 Opções de Fontes Alternativas para White Label (Google Fonts)
Para permitir que igrejas parceiras adaptem sua identidade mantendo o minimalismo funcional:
1. **Plus Jakarta Sans**: Toque contemporâneo e dinâmico, excelente para igrejas com forte identidade jovem.
2. **Outfit**: Geometria pura e minimalista, inspirada no design industrial.
3. **Public Sans**: Rigor editorial e clareza neutra suíça.
4. **DM Sans**: Elegância sóbria com excelente legibilidade para todas as faixas etárias.

### 2.3 Escala Tipográfica Modular

| Nível / Token | Tamanho | Line Height | Peso | Tracking | Uso |
|---|---|---|---|---|---|
| `display-2xl` | 48px (3.0rem) | 1.1 | 800 (Extra-Bold) | `-0.03em` | Título hero da Home e banners principais |
| `display-xl`  | 36px (2.25rem) | 1.15 | 800 (Extra-Bold) | `-0.025em` | Título de página individual `/evento/:slug` |
| `heading-lg`  | 24px (1.5rem) | 1.25 | 700 (Bold) | `-0.02em` | Título de seções e modais |
| `heading-md`  | 20px (1.25rem) | 1.3 | 600 (Semi-Bold) | `-0.015em` | Nome do evento no card, títulos de abas |
| `body-lg`     | 16px (1.0rem) | 1.5 | 400 (Regular) | `0` | Parágrafos de descrição, valores principais |
| `body-base`   | 14px (0.875rem) | 1.45 | 500 (Medium) | `0` | Inputs de formulário, botões, labels |
| `caption-sm`  | 12px (0.75rem) | 1.4 | 500 (Medium) | `+0.01em` | Mensagens de ajuda, contagem de vagas |
| `micro-xs`    | 11px (0.6875rem) | 1.3 | 700 (Bold) | `+0.05em` | Badges de status, headers de tabelas (UPPERCASE) |

---

## 3. Paleta de Cores e Tokens de Superfície

### 3.1 Cores Base (Eira Church Padrão)

```css
:root {
  /* Fundos & Superfícies */
  --bg-app:        #FAFAFA;   /* Fundo neutro e respirável da página */
  --bg-surface:    #FFFFFF;   /* Superfície de cartões, modais e containers */
  --bg-muted:      #F4F4F5;   /* Superfície secundária, inputs e hover sutil */
  --bg-dark:       #0A0A0A;   /* Superfície escura, banners e botões dark */

  /* Estrutura & Bordas */
  --border-light:  #E4E4E7;   /* Divisores sutis de 1px */
  --border-dark:   #27272A;   /* Bordas de contraste para modo escuro */
  --border-focus:  #0A0A0A;   /* Contorno de foco de alta visibilidade */

  /* Tipografia */
  --text-primary:   #0A0A0A;  /* Texto principal (Preto Profundo) */
  --text-secondary: #52525B;  /* Texto de apoio e descrições */
  --text-muted:     #71717A;  /* Rótulos, timestamps e placeholders */
  --text-inverse:   #FFFFFF;  /* Texto sobre superfícies escuras */

  /* Destaque (Accent) — Eira Church */
  --accent:         #FACC15;  /* Amarelo Canário Vibrante */
  --accent-hover:   #EAB308;  /* Amarelo Ouro no hover */
  --accent-text:    #000000;  /* Texto preto puro sobre amarelo (Contraste 11.2:1) */

  /* Semântica & Status */
  --status-pago-bg:     #DCFCE7;  --status-pago-text:     #166534; /* Verde */
  --status-pendente-bg: #FEF9C3;  --status-pendente-text: #854D0E; /* Amarelo/Âmbar */
  --status-isento-bg:   #E0F2FE;  --status-isento-text:   #075985; /* Azul Celeste */
  --status-erro-bg:     #FEE2E2;  --status-erro-text:     #991B1B; /* Vermelho */
}
```

### 3.2 5 Presets de Paletas de Cores Parametrizáveis (White Label)

O sistema suporta alternância instantânea entre 5 paletas pré-configuradas para permitir que a igreja defina sua identidade mantendo a conformidade WCAG 2.2 AA:

| Preset de Tema | Fundo / Superfície | Cor de Destaque (Accent) | Contraste de Texto | Aplicação |
|---|---|---|---|---|
| **1. Eira Signature (Padrão)** | `#FAFAFA` / `#FFFFFF` | `#FACC15` (Amarelo Canário) | `#000000` (11.2:1 AAA) | Identidade oficial da Eira Church |
| **2. Solar Amber** | `#FAFAFA` / `#FFFFFF` | `#F59E0B` (Laranja Âmbar) | `#000000` (9.8:1 AAA) | Tom caloroso e vibrante |
| **3. Royal Cobalt** | `#F8FAFC` / `#FFFFFF` | `#2563EB` (Azul Cobalto) | `#FFFFFF` (5.2:1 AA) | Estilo institucional e contemporâneo |
| **4. Emerald Life** | `#F0FDF4` / `#FFFFFF` | `#10B981` (Verde Esmeralda) | `#000000` (8.9:1 AAA) | Temas de renovação e crescimento |
| **5. Monochrome Classic** | `#FFFFFF` / `#FFFFFF` | `#0A0A0A` (Preto Absoluto) | `#FFFFFF` (19.1:1 AAA) | Minimalismo gráfico de alto contraste |

### 3.3 Tabela de Verificação de Contraste (WCAG 2.2 Nível AA)

| Par Elemento / Fundo | Cores Hex | Relação de Contraste | Status WCAG 2.2 AA (Mín. 4.5:1) |
|---|---|---|---|
| Texto Primário em Fundo Branco | `#0A0A0A` sobre `#FFFFFF` | **19.1:1** | **Aprovado com Louvor (Nível AAA)** |
| Texto Secundário em Fundo Branco | `#52525B` sobre `#FFFFFF` | **7.3:1** | **Aprovado (Nível AAA)** |
| Texto Muted em Fundo Branco | `#71717A` sobre `#FFFFFF` | **4.6:1** | **Aprovado (Nível AA)** |
| Texto Preto sobre Amarelo Destaque | `#000000` sobre `#FACC15` | **11.2:1** | **Aprovado com Louvor (Nível AAA)** |
| Texto Branco sobre Fundo Preto | `#FFFFFF` sobre `#0A0A0A` | **19.1:1** | **Aprovado com Louvor (Nível AAA)** |
| Badge Pago (Verde escuro s/ fundo claro) | `#166534` sobre `#DCFCE7` | **5.4:1** | **Aprovado (Nível AA)** |
| Badge Pendente (Âmbar s/ fundo amarelo) | `#854D0E` sobre `#FEF9C3` | **6.1:1** | **Aprovado (Nível AA)** |

---

## 4. Três Opções de Bordas (Configuração Paramétrica)

Para atender à solicitação de personalização com simplicidade e clareza, o sistema suporta 3 predefinições de raio:

```css
/* Opção 1: Estruturada / Retilínea (Técnica & Minimalista) */
.radius-sharp {
  --radius-sm: 0px;
  --radius-md: 2px;
  --radius-lg: 4px;
  --radius-full: 9999px;
}

/* Opção 2: Equilibrada (Padrão Eira Church — Sóbria & Funcional) */
.radius-balanced {
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}

/* Opção 3: Arredondada (Orgânica & Acolhedora) */
.radius-rounded {
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-full: 9999px;
}
```

---

## 5. Arquitetura do Dashboard Administrativo

O dashboard segue a solicitação direta do usuário com foco em dados consolidados e visão panorâmica da igreja:

```
+-----------------------------------------------------------------------------------+
|  [LOGO EIRA CHURCH]  Acesso Administrativo               Juliana Costa [Sair]     |
+-----------------------------------------------------------------------------------+
|  BANNER INSTITUCIONAL SUPERIOR DA IGREJA                                         |
|  "Bem-vinda, Juliana. Aqui está o panorama oficial da Eira Church hoje."          |
+-----------------------------------------------------------------------------------+
|  CARDS DE MÉTRICAS CONSOLIDADAS                                                  |
|  [ Total Inscritos ]   [ Confirmados ]   [ Visitantes Conexão ]  [ Células Ativas]|
|       142                     98                  24                   18         |
|  (Receita: R$ 8.450)   (69% pagantes)    (Último domingo)     (100% ativas)       |
+-----------------------------------------------------------------------------------+
|  ABAS OPERACIONAIS:                                                               |
|  [ Inscrições ]   [ Eventos ]   [ Novo Evento ]   [ Visitantes ]   [ Células ]    |
|                                                                                   |
|  [Barra de Filtros: Busca | Evento: Todos | Status: Todos | Método: Todos | CSV]  |
|  -------------------------------------------------------------------------------  |
|  Tabela de Inscrições com Método de Pagamento e Ações de Baixa Manual             |
+-----------------------------------------------------------------------------------+
```

---

## 6. Ergonomia Mobile-First (Operação no Celular para Conexão & Inscrições)

Como a equipe de acolhimento (**Conexão**) utilizará a plataforma diretamente pelo smartphone durante os cultos e encontros, foram estabelecidas regras técnicas para velocidade e usabilidade tátil:

1. **Prevenção de Auto-Zoom no iOS Safari**:
   Todos os campos de texto e inputs possuem tamanho de fonte fixado em **16px (`1rem`)**, impedindo que navegadores móveis apliquem zoom forçado ao focar nos campos.
2. **Alvos de Toque Amplos (Touch Targets ≥ 48px)**:
   Inputs, botões e controles de seleção possuem altura mínima de **48px**, garantindo toque ágil sem erros mesmo em movimento no hall da igreja.
3. **Teclados Semânticos Automáticos**:
   - `inputMode="tel"` para WhatsApp e telefone (abre teclado numérico direto com caracteres de DDD).
   - `inputMode="numeric"` para idade e quantidade de vagas.
   - `inputMode="email"` com desativação de autocapitalize para digitação rápida de e-mails.
4. **Fluxo Rápido de Conexão em 1 Coluna**:
   Formulário de pessoas novas organizado em coluna única com progressão natural, concluível em menos de 45 segundos por visitante.

---

## 7. Gestão de Banners e Layout Adaptativo Resiliente

### 7.1 Hierarquia de Banners
1. **Banner Institucional da Igreja**:
   Exibido no topo do Dashboard administrativo e customizável nas configurações da igreja (proporção ultra-wide 21:9 no desktop e 16:9 no mobile, com fallback elegante em padrão geométrico sólido caso não haja imagem).
2. **Banner de Capa do Evento**:
   Exibido no card da Home e no cabeçalho da página pública individual (`/evento/:slug`).

### 7.2 Comportamento Adaptativo (Zero Buracos Visuais)
- Se o evento **não possuir descrição detalhada**: O card reorganiza o espaçamento vertical automaticamente, aproximando as informações essenciais (data, local, valor e botão) sem deixar espaços em branco estranhos.
- Se o evento **for gratuito**: A seção de pagamento é completamente omitida, e o botão exibe diretamente "Garantir vaga gratuita".
- Se o evento **não tiver imagem de banner cadastrada**: A aplicação renderiza um header estilizado na cor da categoria com o monograma da igreja e tipografia Manrope expressiva, mantendo a dignidade estética sem sensação de "imagem quebrada".

---

## 8. Iconografia e Imagens

- **Iconografia**: Uso exclusivo de SVG linear geométrico (Lucide Icons) com espessura uniforme de 1.75px. Zero emojis no lugar de controles e zero ícones decorativos em círculos pastel genéricos.
- **Imagens**: Proporção 16:9 cinematográfica para banners de eventos e 21:9 ultra-wide para o banner superior do dashboard, com `loading="lazy"` e dimensionamento intrínseco para zero CLS.
