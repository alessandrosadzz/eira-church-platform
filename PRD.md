# PRD.md — Documento de Requisitos de Produto (Product Requirements Document)

## Sistema de Gestão de Eventos e Inscrições — Eira Church (White Label Edition)

---

## 1. Visão Geral e Objetivo do Produto

### 1.1 Objetivo
Desenvolver uma plataforma web completa, intuitiva e de alta performance para a **Eira Church**, estruturada sob uma arquitetura modular de três sistemas integrados, com entrega imediata e foco no **Módulo 1: Gestão de Eventos e Inscrições**:

1. **Módulo 1 (Core Atual — Release 1.0)**: Divulgação, páginas individuais com links compartilháveis, inscrições inteligentes multi-step, checagem condicional de menores de idade, controle de saúde/alergias, processamento de pagamentos (Mercado Pago Pix/Cartão e baixa manual com rastreamento de método) e dashboard administrativo em tempo real.
2. **Módulo 2 (Conexão & Visitantes — Release 1.1)**: Ficha de acolhimento para pessoas novas, mapeamento de bairro, quem convidou e direcionamento acolhedor.
3. **Módulo 3 (Rede de Células & Integração Inteligente — Release 1.2)**: Cadastro de células por perfil (Teens/Hype, Jovens/One Way, Homens, Mulheres, Casais, Adultos), localização via Google Maps, permissões diferenciadas (`pastor`, `admin`, `lider`) e direcionamento automatizado da pessoa nova via WhatsApp para a célula mais próxima de sua casa.

O sistema é construído sob um modelo **White Label** parametrizável, permitindo o licenciamento futuro para outras igrejas parceiras.

### 1.2 Métricas de Sucesso (KPIs)
- **Taxa de Conclusão de Inscrição**: ≥ 75% dos fluxos de formulário iniciados devem ser concluídos até a etapa de confirmação.
- **Tempo Médio de Preenchimento**: ≤ 90 segundos no dispositivo móvel para formulários padrão.
- **Eficiência Financeira**: Redução de 90% no tempo despendido pela secretaria da igreja para reconciliar pagamentos manuais.
- **Segurança e Conformidade de Menores**: 100% dos participantes menores de 18 anos cadastrados com nome e WhatsApp válidos do responsável legal.
- **Desempenho Técnico**: Lighthouse Score ≥ 90 em Acessibilidade e Performance; tempo de carregamento inicial (LCP) ≤ 2.0s em conexões 4G móveis.

---

## 2. Personas

### Persona 1: Secretaria / Líder Administrativo (Admin)
- **Nome**: Juliana Costa, 34 anos.
- **Papel**: Coordenadora de Eventos e Secretaria Geral da Eira Church.
- **Contexto**: Precisa cadastrar novos eventos com agilidade (adicionar banner, definir vagas, valor, data e selecionar quais campos os inscritos devem responder), acompanhar em tempo real quantas vagas restam e quem já efetuou o pagamento, alterar status manualmente (quando o participante paga no balcão) e exportar listas organizadas em Excel para as equipes de recepção e crachás.
- **Dores**: Perda de controle em planilhas manuais desconectadas, participantes que reservam vagas sem pagar e falta de histórico unificado.

### Persona 2: Jovem / Participante Adulto (Rede One Way / Geral)
- **Nome**: Mateus Fernandes, 23 anos.
- **Papel**: Estudante universitário e membro da rede de jovens One Way.
- **Contexto**: Recebe o link do evento no grupo de WhatsApp ou através do perfil da igreja no Instagram. Acessa pelo smartphone, preenche os dados em poucas etapas, realiza o pagamento instantâneo via Pix gerado na tela e deseja receber o comprovante no próprio celular para apresentar no dia.
- **Dores**: Formulários longos com campos desnecessários, travamento no celular e dificuldade para confirmar se o pagamento foi computado.

### Persona 3: Adolescente e Responsável Legal (Rede Hype / Família)
- **Nome**: Lucas Albuquerque (14 anos, inscrito) e Patrícia Albuquerque (41 anos, mãe e responsável).
- **Papel**: Participante do retiro de adolescentes e mãe pagadora.
- **Contexto**: Lucas preenche os dados para o acampamento de adolescentes Hype. Ao inserir sua data de nascimento, o sistema identifica que ele tem 14 anos e solicita obrigatoriamente os dados de Patrícia (nome e WhatsApp). Patrícia é informada sobre a inscrição, efetua o pagamento via Pix ou Cartão de Crédito e tem a segurança de ter registrado as restrições alimentares do filho (intolerância a lactose).
- **Dores**: Preocupação dos pais com segurança e restrições médicas em viagens de retiro sem canal de contato imediato.

---

## 3. Jornadas de Usuário (User Journeys)

### Jornada A: Inscrição Pública via Link Compartilhável (`/evento/:slug`)
```
[Acessa Link Direto] 
   └──> [Visualiza Banner, Data, Categoria, Vagas Restantes e Valor]
           └──> [Clica em "Fazer Inscrição"]
                   └──> [Etapa 1: Preenche Dados Pessoais Dinâmicos]
                           ├── (Se idade < 18): [Preenche Nome e WhatsApp do Responsável]
                           └── (Se houver campo saúde): [Preenche Alergias/Intolerâncias]
                                   └──> [Etapa 2: Pagamento (se valor > 0)]
                                           ├── [Pix: Escaneia QR Code ou Copia Chave]
                                           └── [Cartão: Preenche Brick Seguro MP]
                                                   └──> [Etapa 3: Tela de Sucesso + Salvar Comprovante]
```

### Jornada B: Gestão e Operação Administrativa (`/admin/dashboard`)
```
[Acessa /admin] 
   └──> [Login com E-mail e Senha no Supabase Auth]
           └──> [Acessa Dashboard: Visualiza 4 KPIs (Inscritos, Confirmados, Pendentes, Receita)]
                   ├── [Aba Inscrições]: Filtra por evento/status, busca por nome, altera status manual, exporta CSV com BOM UTF-8
                   ├── [Aba Eventos]: Copia link único com 1 clique, edita vagas, desativa/reativa eventos
                   └── [Aba Novo Evento]: Define nome, categoria (Hype, One Way, Padrão), banner, datas, valor e seleciona campos dinâmicos via chips
```

---

## 4. Funcionalidades Detalhadas (Matriz MoSCoW)

### 4.1 Must Have (Obrigatório para Lançamento)
- **RF-01: Catálogo Público de Eventos (`/`)**: Exibição em grid dos eventos ativos com identificação da rede/categoria (Hype, One Way, Padrão), barra de progresso de vagas acessível e skeleton loader durante o carregamento.
- **RF-02: Página Individual por Evento (`/evento/:slug`)**: URL própria e compartilhável com banner, detalhes completos, metadados Open Graph para visualização rica no WhatsApp/Instagram e schema.org `Event`.
- **RF-03: Formulário Multi-Step Inteligente**: Modal e página autônoma com navegação por etapas (1. Dados Pessoais, 2. Pagamento se pago, 3. Confirmação).
- **RF-04: Campos Dinâmicos Parametrizados**: O formulário renderiza estritamente os campos definidos no array JSON `campos` do evento, com validação Zod no cliente e no servidor.
- **RF-05: Lógica Condicional de Menor de Idade**: Cálculo automático de idade a partir da data de nascimento. Se idade < 18 anos, exigência obrigatória dos campos "Nome do Responsável" e "WhatsApp do Responsável".
- **RF-06: Mapeamento de Saúde e Intolerâncias**: Campo dinâmico para anotação de alergias, intolerâncias alimentares e restrições médicas.
- **RF-07: Integração de Pagamento Mercado Pago**: Suporte nativo a Pix (QR Code e chave Copia e Cola) e Cartão de Crédito via SDK Bricks (PCI-DSS compliance sem manipulação direta de dados de cartão).
- **RF-08: Webhook de Pagamento com HMAC-SHA256**: Supabase Edge Function validando a assinatura criptográfica antes de marcar a inscrição como `pago`.
- **RF-09: Painel Administrativo Autenticado**: Área `/admin` com autenticação Supabase Auth protegida por JWT com role `admin`.
- **RF-10: Dashboard com Cards de Métricas**: Total de inscritos, total de confirmados, pendentes e receita total apurada, consultados da view otimizada `eventos_com_contagem`.
- **RF-11: Gestão de Inscrições**: Tabela rica com busca por texto (nome/e-mail), filtros por evento, por status (`pendente`, `pago`, `isento`) e por método de pagamento (`pix`, `cartao`, `dinheiro`, `isento`), exibindo claramente o método utilizado na coluna dedicada e permitindo ações manuais de "Confirmar Pagamento" (com seleção de método: Dinheiro/Balcão ou Pix Direto) e "Isentar".
- **RF-12: Criação e Edição de Eventos**: Formulário administrativo para criar eventos, gerar slug automático sanitizado, definir banner, vagas, valor e selecionar dinamicamente os chips de campos requeridos.
- **RF-13: Exportação em CSV com BOM UTF-8**: Geração de arquivo CSV pronto para Excel brasileiro com todos os dados dos participantes.

### 4.2 Should Have (Importante)
- **RF-14: Vagas em Tempo Real**: Conexão Supabase Realtime nas páginas pública e do evento para decrementar as vagas imediatamente quando novas inscrições forem confirmadas.
- **RF-15: Botão "Salvar Comprovante no WhatsApp"**: Geração de link `https://wa.me/...` na tela de sucesso com o resumo formatado da inscrição.
- **RF-16: Link Rápido de Inscrição no Admin**: Botão de 1 clique para copiar o link `https://seudominio.com/evento/{slug}` com feedback de toast.
- **RF-17: Configuração White Label**: Parametrização em banco para título da igreja, logotipo institucional e lista de ministérios ativos.

### 4.3 Could Have (Desejável)
- **RF-18: Alerta de Incompatibilidade de Faixa Etária**: Sugestão visual caso um adulto selecione um evento configurado exclusivamente para a rede Hype (adolescentes).
- **RF-19: Histórico de Alterações de Status**: Registro no banco de qual admin alterou o status da inscrição e em qual data/hora.

### 4.4 Won't Have (Fora do Escopo Inicial)
- **RF-20: Módulo Nativo de Check-in por Câmera**: Reconhecimento visual de QR Code em lote para portaria (fica previsto para a versão 2.0).
- **RF-21: Emissão de Nota Fiscal / Recibo Contábil**: Integração com plataformas contábeis de igrejas (fora de escopo nesta versão).

---

## 5. Requisitos Não Funcionais (RNF)

### 5.1 Performance e Carregamento
- **LCP (Largest Contentful Paint)**: ≤ 2.0 segundos em conexões 4G móveis.
- **CLS (Cumulative Layout Shift)**: ≤ 0.05, garantido pelo uso de dimensões explícitas em banners e skeletons proporcionais.
- **INP (Interaction to Next Paint)**: ≤ 150 ms em todas as interações de clique e digitação.
- **Estratégia de Cache**: TanStack Query com `staleTime: 60_000` (1 minuto) para listagens públicas e invalidação ativa em mutações.

### 5.2 Acessibilidade (WCAG 2.2 Nível AA)
- **Contraste de Cores**: Relação de contraste mínima de 4.5:1 para texto normal e 3:1 para texto de grande escala. O amarelo de destaque `#FACC15` sobre preto `#000000` alcança **11.2:1**.
- **Navegação por Teclado**: Todo fluxo de inscrição e administração é navegável via `Tab` e `Shift+Tab`, sem armadilhas de foco (*no focus traps*) fora do modal ativo.
- **Comportamento de Modal**: O modal de inscrição possui atributo `role="dialog"`, `aria-labelledby`, foco inicial automático no primeiro input editável e encerramento ao pressionar `Escape`.
- **Leitores de Tela (Screen Readers)**: Todos os campos de formulário possuem `<label>` semanticamente associado via `htmlFor`/`id`, mensagens de erro com `aria-describedby` e `aria-invalid="true"`. Indicadores de etapa utilizam `aria-current="step"`.
- **Alvos de Toque (Touch Targets)**: Dimensão mínima de 44x44px para botões, checkboxes e elementos interativos em conformidade com o critério 2.5.8 da WCAG 2.2.

### 5.3 Segurança e LGPD
- **Row Level Security (RLS)**: Ativo em 100% das tabelas do Supabase. Apenas dados públicos de eventos ativos são acessíveis anonimamente. A tabela de inscrições não permite leitura anônima.
- **Rate Limiting Criptográfico**: Máximo de 3 tentativas de inscrição por par IP/evento por hora, utilizando hash SHA-256 do IP com salt para proteção da privacidade do usuário.
- **Proteção a Dados de Menores de Idade**: Coleta restrita dos dados estritamente necessários para segurança do evento e consentimento formal dos pais/responsáveis.
- **Segurança de Pagamentos (PCI-DSS)**: Nenhum dado de cartão de crédito trafega ou é armazenado nos servidores da aplicação; o processamento ocorre via Mercado Pago Bricks.
- **Validação de Webhook**: Toda notificação do Mercado Pago é verificada via HMAC-SHA256 utilizando `MP_WEBHOOK_SECRET`.

---

## 6. Riscos e Matriz de Mitigação

| Risco Identificado | Severidade | Probabilidade | Estratégia de Mitigação |
|---|---|---|---|
| **Esgotamento simultâneo de vagas (Race Condition)** | Alta | Média | Verificação atômica de vagas no banco de dados na política RLS e na view `eventos_com_contagem` antes de confirmar o INSERT. |
| **Queda de conexão no momento do pagamento Pix** | Média | Alta | A inscrição é salva com status `pendente`. O webhook do Mercado Pago atualiza de forma assíncrona assim que o banco liquida o Pix. |
| **Adolescente omitir idade para não preencher dados dos pais** | Média | Média | Termo de responsabilidade explícito informando que o documento oficial com foto será conferido no embarque/recepção. |
| **Banners pesados degradando a performance do mobile** | Média | Alta | Compressão de imagens e pré-visualização proporcional com skeletons. |

---

## 7. Critérios de Aceite por Funcionalidade (BDD / Gherkin)

### Cenário 1: Inscrição de Participante Menor de Idade (< 18 anos)
```gherkin
Dado que o participante está na página do evento "Acampamento Hype 2025"
Quando ele informa sua data de nascimento indicando idade de 15 anos
Então o formulário deve exibir dinamicamente os campos "Nome do Responsável" e "WhatsApp do Responsável"
E não deve permitir o avanço para a próxima etapa enquanto ambos os campos não forem preenchidos com valores válidos.
```

### Cenário 2: Inscrição em Evento Gratuito
```gherkin
Dado que o evento "Conferência One Way" possui valor R$ 0,00
Quando o participante preenche seus dados válidos na Etapa 1 e clica em "Próximo"
Então o sistema deve pular a Etapa 2 de Pagamento
E deve exibir diretamente a Etapa 3 com mensagem "Inscrição confirmada!", gerando o comprovante com botão de compartilhar no WhatsApp.
```

### Cenário 3: Inscrição em Evento Pago com Pix
```gherkin
Dado que o evento "Retiro de Jovens" custa R$ 120,00
Quando o participante conclui a Etapa 1 e seleciona a opção "Pix" na Etapa 2
Então o sistema deve gerar o QR Code dinâmico do Mercado Pago e o código copia-e-cola
E assim que o participante paga no banco, o webhook deve atualizar o status para "pago" em tempo real via Supabase Realtime.
```

### Cenário 4: Alteração Manual de Status pelo Administrador com Registro de Método
```gherkin
Dado que o administrador está logado na aba "Inscrições" do painel
E visualiza a inscrição de "Lucas Costa" com status "pendente"
Quando clica na ação "Confirmar Pagamento"
E seleciona o método de pagamento recebido (ex.: "Dinheiro / Secretaria" ou "Pix Direto")
Então o status deve ser atualizado imediatamente para "pago"
E a coluna "Método" na tabela deve exibir a identificação correspondente
E os cartões de métrica "Confirmados", "Pendentes" e "Receita" devem recalcular instantaneamente.
```
