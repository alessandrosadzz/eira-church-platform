# DIRECOES-VISUAIS.md — Propostas de Direção Visual

## Sistema de Gestão de Eventos — Eira Church (White Label Platform)

Este documento apresenta duas direções visuais antagônicas e profissionais para a nova identidade visual solicitada pelo usuário: **Tipografia Manrope Display e Interface, Paleta Preto, Branco e Amarelo Destaque**, rigorosamente projetada para fugir de templates genéricos de IA e garantir conformidade **WCAG 2.2 Nível AA**.

---

## Direção 1: "Brutalismo Editorial Contemporâneo" *(Recomendada)*

### 1. Conceito & Inspiração
- **Arquétipo Estético**: Vanguarda editorial suíça, posters de festivais contemporâneos e design industrial de precisão (*Off-White, A24, Teenage Engineering, Basquiat Books, Brand New UnderConsideration*).
- **Sensação Transmitida**: Vigor, autenticidade, relevância cultural e firmeza arquitetônica. Elimina qualquer semelhança com softwares institucionais monótonos.
- **Princípio Construtivo**: Linhas estruturais explícitas de 1px (`#0A0A0A` e `#E4E4E7`), tipografia Manrope Display em escala monumental (`text-5xl` a `text-7xl`), números tabulares em tamanho expressivo e blocos de cor sólidos com alto contraste.

### 2. Tokens Fundamentais
- **Fundo**: Branco Puro `#FFFFFF` alternando com blocos sólidos em Preto Absoluto `#0A0A0A`.
- **Texto Principal**: Preto Profundo `#0A0A0A` (sobre fundo claro) e Branco `#FFFFFF` (sobre blocos pretos).
- **Amarelo Destaque**: Amarelo Elétrico `#FACC15` (utilizado com tipografia preta `#000000`, gerando relação de contraste brutal de **11.2:1**, muito acima do 4.5:1 exigido pela WCAG).
- **Estrutura & Bordas**: Bordas nítidas de 1px com raio sutil de 6px a 8px (`rounded-md`). Sombras duras de deslocamento tátil (`box-shadow: 3px 3px 0px #0A0A0A` em botões de ação e cards em hover).
- **Ícones**: Traço geométrico limpo de 1.75px em SVG puro (Lucide/Phosphor), sem círculos coloridos pastel ao redor.

### 3. Aplicação na Experiência
- **Hero da Home**: Título em Manrope 800 extra-bold com kerning fechado (`tracking-tighter`), acompanhado de badge angular preto com texto amarelo: `[EIRA CHURCH // EVENTOS OFICIAIS]`.
- **Grid de Eventos**: Assimetria intencional — o evento principal (ex.: Retiro de Jovens ou Acampamento Hype) ganha um card de destaque em largura dupla (wide card) com banner cinematográfico 16:9, enquanto os demais eventos ocupam módulos estruturados de alta densidade.
- **Formulário de Inscrição**: Campos com bordas pretas nítidas de 1.5px, foco com anel amarelo de 2px de alto contraste (`focus-visible:ring-2 focus-visible:ring-[#FACC15] focus-visible:ring-offset-2`).

### 4. Riscos & Mitigações
- **Risco**: Risco de parecer austero ou excessivamente duro para os membros mais velhos da congregação.
- **Mitigação**: Espaçamentos generosos (padding 24px/32px), microcopy acolhedor e amigável nos formulários e cantos ligeiramente suavizados (8px) para garantir ergonomia visual.

---

## Direção 2: "Neo-Minimalismo Solar & Orgânico"

### 1. Conceito & Inspiração
- **Arquétipo Estético**: Design escandinavo de alta precisão e interfaces táteis modernas (*Linear, Arc Browser, Leica, Aesop, Nothing Tech*).
- **Sensação Transmitida**: Acolhimento, calor humano comunitário, clareza serena e sofisticação atemporal.
- **Princípio Construtivo**: Superfícies puras, transições de camadas suaves, contrastes generosos sem rigidez angular e acentos solares luminosos.

### 2. Tokens Fundamentais
- **Fundo**: Off-white arquitetônico suave `#FAFAFA`, com cartões em Branco Puro `#FFFFFF`.
- **Texto Principal**: Preto Carvão `#121214` e Cinza Grafite `#4B5563` para legendas secundárias.
- **Amarelo Destaque**: Amarelo Âmbar Solar `#EAB308` combinado com tonalidade suave de fundo `#FEF08A` para tags de status e destaques.
- **Estrutura & Bordas**: Bordas ultrafinas `#E5E7EB` com cantos generosamente arredondados de 16px a 20px (`rounded-2xl`).
- **Sombras**: Sombras multicamadas orgânicas e difusas (`0 1px 3px rgba(0,0,0,0.05), 0 10px 25px -5px rgba(0,0,0,0.04)`).
- **Ícones**: Traço arredondado e amigável de 1.5px em preto carvão.

### 3. Aplicação na Experiência
- **Hero da Home**: Título em Manrope 700 bold, equilibrado com subtítulo generoso e respirável.
- **Grid de Eventos**: Cartões com cantos de 20px, elevação tátil sutil ao passar o mouse (`translateY(-3px)` com sombra aveludada) e barra de progresso de vagas com acabamento arredondado em amarelo solar.
- **Formulário de Inscrição**: Modais amplos com sensação de folha de papel física e feedback visual fluido.

### 4. Riscos & Mitigações
- **Risco**: Risco de soar excessivamente corporativo ou perder parte do apelo de dinamismo para o público adolescente (Hype).
- **Mitigação**: Uso de badges de categoria com micro-interações de pulso e banners vibrantes para manter o entusiasmo juvenil.

---

## Quadro Comparativo

| Critério | Direção 1: Brutalismo Editorial *(Recomendada)* | Direção 2: Neo-Minimalismo Solar |
|---|---|---|
| **Fonte Display** | Manrope Extra-Bold (800) / Tracking Tighter | Manrope Bold (700) / Tracking Normal |
| **Bordas e Raio** | 1px a 1.5px / Raio 6px a 8px (Estruturado) | 1px / Raio 16px a 20px (Orgânico) |
| **Sombras** | Deslocamento tátil sólido (`3px 3px 0px #000`) | Difusas e aveludadas multicamadas |
| **Tom do Amarelo** | Amarelo Canário Elétrico (`#FACC15`) | Amarelo Âmbar Solar (`#EAB308`) |
| **Personalidade** | Marcante, jovem, urbana, sem cara de template | Acolhedora, serena, universal para famílias |
| **Fit com Redes** | Excepcional para Hype (Teens) e One Way (Jovens) | Excepcional para Padrão (Adultos/Famílias) |
| **Potencial White Label** | Altíssimo diferencial frente a softwares tradicionais | Seguro e universal para qualquer igreja |

---

## Nossa Recomendação Técnica & Próximos Passos
**Recomendamos fortemente a Direção 1 ("Brutalismo Editorial Contemporâneo")**, pois confere à **Eira Church** uma identidade autoral que foge imediatamente do lugar-comum de ferramentas de igreja, tornando o sistema um produto comercial de altíssimo valor percebido para expansão White Label.

Qual direção você escolhe para aprofundarmos no **DESIGN.md** e **DESIGN-SYSTEM.md**?
- **Opção 1**: Brutalismo Editorial Contemporâneo (Recomendada)
- **Opção 2**: Neo-Minimalismo Solar & Orgânico
