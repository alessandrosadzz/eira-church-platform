# ASSUMPTIONS.md — Premissas do Projeto Eira Church (Ecossistema Integrado de Gestão)

Este documento registra todas as premissas adotadas pela equipe para viabilizar o planejamento e execução com precisão técnica, acessibilidade e alinhamento total à visão da Eira Church e sua expansão White Label.

---

## 1. Visão Geral do Ecossistema da Eira Church
A plataforma foi concebida sob uma arquitetura modular de três sistemas complementares, com foco de entrega imediata no **Módulo 1**:

1. **Módulo 1 (Foco Imediato / MVP Core)**: **Sistema de Gestão de Eventos & Inscrições**
   - Criação de eventos com banners, categorização por redes (Hype, One Way, Padrão).
   - Inscrições públicas com links compartilháveis únicos (`/evento/:slug`).
   - Formulário inteligente multi-step (validação condicional de menores de idade < 18 anos e restrições médicas).
   - Gestão financeira via Mercado Pago (Pix e Cartão) e baixa manual (Dinheiro/Secretaria).
   - Painel administrativo com controle de vagas em tempo real, métricas e exportação CSV com BOM UTF-8.
2. **Módulo 2 (Expansão / Conexão & Visitantes — Mobile-First Extremo no Celular)**:
   - Operado primariamente em smartphones pela equipe de voluntários durante os cultos e eventos.
   - Ergonomia tátil mobile: inputs com mínimo 48px de altura, fonte 16px para evitar auto-zoom no Safari iOS, teclado numérico imediato (`inputMode="tel"`) e fluxo concluído em menos de 45 segundos.
   - Captura de dados: Nome, WhatsApp, Bairro/Cidade de residência, "Quem te convidou?".
   - Painel de novos convertidos e visitantes para a equipe pastoral.
3. **Módulo 3 (Expansão / Rede de Células & Integração Inteligente)**:
   - Cadastro geográfico e demográfico de células pelos líderes (Hype/Teens, One Way/Jovens, Homens, Mulheres, Casais, Adultos).
   - Link de localização via Google Maps para compartilhamento instantâneo.
   - Direcionamento automatizado via WhatsApp da pessoa nova/inscrita para a célula compatível mais próxima de sua residência.
   - Níveis de permissão (Roles): `admin` (Secretaria/Geral), `pastor` (Supervisão global) e `lider` (Gestão restrita da sua própria célula).

---

## 2. Personalização White Label & Gestão de Banners
- **Customização por Igreja**:
  - Nome da igreja editável (exibido no topo, metadados e rodapé).
  - Logotipo oficial da igreja (upload de imagem ou URL).
  - Banner superior institucional da igreja (exibido no topo do dashboard e páginas institucionais).
- **Gestão de Banners de Eventos**:
  - Cada evento possui seu próprio banner principal (proporção 16:9 cinematográfica).
  - Na página individual (`/evento/:slug`), o banner é apresentado como capa de destaque.
  - **Layout Resiliente e Adaptativo**: Caso o administrador decida não preencher descrições longas ou informações adicionais, a interface reorganiza o espaçamento graciosamente, mantendo o visual limpo, centralizado e sem áreas vazias ou placeholders.
- **5 Presets de Paletas de Cores Parametrizáveis**:
  1. *Eira Signature*: Preto Profundo, Branco Puro e Amarelo Destaque (#FACC15).
  2. *Solar Amber*: Preto Carvão, Branco Puro e Laranja Âmbar (#F59E0B).
  3. *Royal Cobalt*: Azul Meia-Noite, Branco Puro e Azul Cobalto (#2563EB).
  4. *Emerald Life*: Verde Petróleo Escuro, Branco Puro e Verde Esmeralda (#10B981).
  5. *Monochrome Classic*: Preto Absoluto, Branco Puro e Grafite Neutro (#52525B).

---

## 2. Estrutura Ministerial e Segmentação por Redes
- **Hype**: Ministério de Adolescentes e Teens (12 a 17 anos). Requer autorização e contato obrigatório dos pais/responsáveis.
- **One Way**: Rede de Jovens e Universitários (18 a 29 anos). Foco em agilidade mobile e Pix instantâneo.
- **Padrão**: Eventos Gerais, Família, Casais, Homens e Mulheres.
- **Células Integradas**: No formulário de eventos, pode ser ativado o campo dinâmico: *"Você já participa de alguma célula na Eira Church? Se não, gostaria de receber uma indicação no seu bairro?"*.

---

## 3. Identidade Visual (Diretriz Atualizada do Usuário)
- **Tipografia**:
  - **Display / Headings**: **Manrope** em pesos de destaque (`wght 700, 800`), tracking fechado (`-0.03em`), postura minimalista, contemporânea e de alto impacto visual.
  - **Interface / Corpo**: **Manrope** em pesos regulares e médios (`wght 400, 500, 600`), excelente legibilidade em telas de qualquer tamanho e números tabulares (`tabular-nums`) para dados e tabelas.
- **Paleta de Cores**:
  - **Superfície & Fundo**: Branco Puro (`#FFFFFF`) e Off-White estrutural (`#FAFAFA` / `#F4F4F5`).
  - **Texto Principal & Estrutura**: Preto Profundo (`#0A0A0A` e `#171717`) com divisores sutis de 1px (`#E4E4E7`).
  - **Cor de Destaque**: Amarelo Ouro / Vibrante (`#FACC15` / `#EAB308`). Relação de contraste de **11.2:1** com texto preto puro (`#000000`), excedendo as exigências da WCAG 2.2 AA.
  - **Acentos de Identificação**: Cores semânticas refinadas para categorias e células mantidas em harmonia neutra.

---

## 4. Lógica de Menores de Idade e Cuidados de Saúde
- **Validação de Maioridade**: A partir da data de nascimento, se o participante tiver **menos de 18 anos** (idade ≤ 17 anos), o formulário expande condicionalmente e torna obrigatórios:
  - `nome_responsavel`: Nome completo do pai, mãe ou responsável legal.
  - `telefone_responsavel`: WhatsApp / Telefone direto do responsável para contato emergencial.
- **Cuidados de Saúde e Intolerâncias**:
  - Campo `observacoes_saude` integrado dinamicamente nos eventos para mapeamento de alergias alimentares (glúten, lactose, etc.) e cuidados médicos.

---

## 5. Gestão Financeira, Métodos de Pagamento & Mercado Pago
- **Eventos Gratuitos**: `valor = 0`. O formulário avança diretamente para a confirmação e emissão de comprovante (método gravado como `isento`).
- **Eventos Pagos**: `valor > 0`. Métodos ativos online: **Pix** (QR Code dinâmico do Mercado Pago) e **Cartão de Crédito** (via MP Card Brick seguro).
- **Rastreamento Transparente do Método de Pagamento**:
  - Todo registro armazena o método utilizado (`metodo_pag`: `'pix'`, `'cartao'`, `'dinheiro'`, `'balcao'`, `'isento'`).
  - A tabela administrativa exibe badge com o método utilizado e permite filtros por método para conferência contábil.
  - Baixa manual pelo administrador com registro de meio de recebimento (Dinheiro ou Pix Direto na conta da igreja).

---

## 6. Stack Técnica e Arquitetura de Permissões
- **Frontend**: React 18 + Vite 5 + TypeScript 5 + Tailwind CSS 3 (utility classes puras, sem shadcn/MUI).
- **Backend**: Supabase (PostgreSQL 15, Auth com JWT role-based, Realtime para atualização de vagas sem reload).
- **Permissões e Níveis de Acesso**:
  - `anon`: Leitura de eventos públicos ativos e criação de inscrições (INSERT com validação atômica de vagas).
  - `admin`: Secretaria Geral e Administração (controle total, parametrização, finanças e baixas).
  - `pastor`: Acesso pastoral irrestrito a eventos, visitantes, células e finanças.
  - `lider`: Líderes de célula e de ministérios (acesso para consultar contagem de inscritos de seus eventos, acompanhar quem pagou e auxiliar na gestão presencial).
