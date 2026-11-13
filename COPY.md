# COPY.md — Guia de Redação, Textos Oficiais e Auditoria Anti-IA

## Sistema de Gestão de Eventos — Eira Church (White Label Platform)

---

## 1. Princípios de Redação Aplicados (Portão 4b Anti-IA)

A redação do sistema segue rigorosamente o tom de voz definido no [PRODUCT-CONTEXT.md](file:///c:/Users/Alessandro/system/PRODUCT-CONTEXT.md): **acolhedor, claro, direto, responsável e contemporâneo**, eliminando 100% dos jargões corporativos e clichês de inteligência artificial.

### 1.1 Lista de Termos Banidos vs. Termos Efetivamente Utilizados

| Termo Proibido (Clichê de IA) | Motivo da Rejeição | Substituição Acolhedora e Realista no Código |
|---|---|---|
| ❌ *"Revolucione a gestão de eventos da sua igreja"* | Vazio, pomposo e artificial | ✅ *"Painel de Liderança da Eira Church — Visão Integrada da Igreja"* |
| ❌ *"Solução completa de ponta a ponta"* | Jargão corporativo desgastado | ✅ *"Central de Inscrições — Próximos Encontros, Retiros e Conferências"* |
| ❌ *"Levando sua comunidade ao próximo nível"* | Frase feita genérica de marketing | ✅ *"Garanta sua vaga nos momentos mais marcantes da nossa igreja."* |
| ❌ *"Desbloqueie o poder da comunhão"* | Espiritualização forçada de botão | ✅ *"Garantir Vaga" / "Concluir Inscrição Gratuita"* |
| ❌ *"Ecossistema disruptivo e inovador"* | Incompatível com o contexto comunitário | ✅ *"Uma igreja contemporânea em células"* |
| ❌ *"Oops! Ocorreu um erro no preenchimento"* | Infantilizado e pouco instrutivo | ✅ *"Informe seu nome completo." / "WhatsApp com DDD obrigatório."* |
| ❌ *"Parabéns pela sua jornada transformadora"* | Melodramático em formulário | ✅ *"Inscrição Confirmada! Estamos muito felizes em ter você conosco."* |

---

## 2. Textos e Microcopy por Tela e Componente

### 2.1 Página Inicial Pública (`/`)

- **Topo**:
  - Marca: `EIRA CHURCH // Central de Inscrições`
  - Ação: `Acesso Liderança`
- **Hero**:
  - Badge: `CALENDÁRIO OFICIAL // EIRA CHURCH`
  - Título Principal (H1): `Próximos Encontros, Retiros e Conferências`
  - Subtítulo: `Garanta sua vaga nos momentos mais transformadores da nossa igreja. Inscrições abertas com confirmação em tempo real e suporte para toda a família.`
- **Filtros por Rede**:
  - `Todas as Redes`
  - `Rede Hype` *(Teens e Adolescentes)*
  - `Rede One Way` *(Jovens e Universitários)*
  - `Rede Padrão` *(Adultos, Casais e Família)*
- **Card de Evento (`EventCard`)**:
  - Preço: `Gratuito` ou `R$ 150,00` (formatado com precisão tabular)
  - Vagas: `[N] vagas restantes` / `ESGOTADO`
  - CTA Disponível: `Garantir Vaga →`
  - CTA Esgotado: `Inscrições Esgotadas` (botão desabilitado com feedback claro)
- **Estado Vazio (Sem eventos)**:
  - Título: `Nenhum evento encontrado`
  - Texto: `Não encontramos eventos disponíveis com os filtros selecionados. Tente selecionar outra rede ou limpar a busca.`
  - Ação: `Exibir todos os eventos`

---

### 2.2 Formulário Multi-Step de Inscrição (`InscricaoForm`)

#### Etapa 1: Seus Dados
- **Indicador**: `1. Seus Dados`
- **Nome Completo**:
  - Label: `Nome Completo *`
  - Placeholder: `Seu nome e sobrenome`
  - Erro: `Informe seu nome completo.`
- **Telefone / WhatsApp**:
  - Label: `WhatsApp / Telefone com DDD *`
  - Placeholder: `(00) 00000-0000`
  - Erro: `Informe seu telefone / WhatsApp com DDD.`
  - Ajuda: `Usado para avisos importantes e confirmação de presença.`
- **Data de Nascimento**:
  - Label: `Data de Nascimento *`
  - Erro: `Informe sua data de nascimento.`
  - Feedback de idade: `Idade identificada: 14 anos`
- **Seção Condicional Obrigatória: Menores de 18 Anos**:
  - Alerta: `Participante Menor de 18 Anos — Identificação dos Pais Obrigatória`
  - Texto de ciência: `Por segurança da Eira Church e exigência legal, informe os dados de contato do pai, mãe ou responsável legal.`
  - Campo Responsável: `Nome do Responsável Legal *`
  - Campo WhatsApp Responsável: `WhatsApp do Responsável *`
- **Campo de Saúde e Alergias**:
  - Label: `Restrições Alimentares / Alergias / Cuidados Médicos`
  - Placeholder: `Ex: intolerância a lactose, alergia a amendoim, medicamento contínuo...`
  - Ajuda: `Informações confidenciais encaminhadas para a equipe médica e de alimentação do evento.`
- **CTA**:
  - Gratuito: `Concluir Inscrição Gratuita`
  - Pago: `Prosseguir para Pagamento (R$ 150,00)`

#### Etapa 2: Pagamento (Eventos Pagos)
- **Indicador**: `2. Pagamento`
- **Seletor**:
  - Opção 1: `Pix Instantâneo`
  - Opção 2: `Cartão de Crédito`
- **Instruções Pix**:
  - Título: `Escaneie o QR Code no app do seu banco`
  - Código Copia-e-Cola com botão: `Copiar Código Pix`
  - Feedback ao copiar: `Código Pix copiado para a área de transferência!`
  - Nota de compensação: `Após efetuar a transferência no banco, a compensação ocorre em instantes.`
- **CTA**: `Já realizei o pagamento`

#### Etapa 3: Confirmação e Comprovante
- **Indicador**: `3. Confirmação`
- **Título**: `Inscrição Confirmada!`
- **Subtítulo**: `Estamos muito felizes em ter você conosco na Eira Church.`
- **Cartão do Comprovante**:
  - `Código de Inscrição: EIRA-A7X92B`
  - `Participante: Lucas Albuquerque`
  - `Evento: Retiro Hype // Intensidade & Propósito`
  - `Status: Confirmado`
- **Ações**:
  - Primária: `Salvar Comprovante no WhatsApp` (abre link wa.me com dados formatados)
  - Secundária: `Fechar`

---

### 2.3 Página Individual Compartilhável (`/evento/:slug`)

- **Navegação Superior**: `← Todos os eventos da Eira Church`
- **Hero**:
  - Título do Evento (Manrope 800)
  - Tags: `REDE HYPE` • `Acampamento & Retiro` • `R$ 150,00`
  - Metadados: Data oficial, Local e Vagas restantes calculadas em tempo real.
- **Card Central**: Formulário multi-step autônomo e de alta densidade tátil.

---

### 2.4 Painel Administrativo (`/admin`)

- **Banner Institucional**:
  - `VISÃO INTEGRADA DA IGREJA`
  - `Painel de Liderança da Eira Church`
  - `Acompanhe as inscrições dos eventos, controle de vagas, novos visitantes da equipe de Conexão e a expansão da nossa rede de células.`
- **Cartões de Métricas**:
  - `Total de Inscritos`: `42` (`Todas as redes ativas`)
  - `Confirmados`: `38` (`90% de conversão`)
  - `Pagamentos Pendentes`: `4` (`Aguardando Pix ou balcão`)
  - `Receita Confirmada`: `R$ 5.700,00` (`Pix, cartão e dinheiro`)
  - `Visitantes // Conexão`: `24 novos cadastros` (`Acolhidos no último domingo`)
  - `Rede de Células`: `18 células ativas` (`Hype, One Way, Casais e Adultos`)
- **Tabela de Inscrições**:
  - Headers: `PARTICIPANTE`, `EVENTO // REDE`, `STATUS`, `MÉTODO`, `SAÚDE / OBS`, `DATA`, `AÇÕES DA SECRETARIA`.
  - Ação Pendente: `✓ Confirmar`
  - Ação Reverter: `Reverter para pendente`
- **Modal de Baixa Manual**:
  - Título: `Confirmar Pagamento / Baixa Manual`
  - Seleção de Meio:
    - `Dinheiro em Espécie (Secretaria)`
    - `Pix Direto (Chave da Igreja)`
    - `Cartão Presencial (Máquina Balcão)`
  - Opção alternativa: `Conceder Isenção`
  - CTA: `Confirmar Baixa`
- **Formulário de Novo Evento**:
  - Título: `Cadastrar Novo Evento`
  - Instrução: `Defina as informações oficiais, banners e campos dinâmicos de inscrição para a Eira Church.`
  - Preview de URL em tempo real: `https://eventos.eirachurch.com.br/evento/retiro-hype-mar-2025`
  - Seletor de chips dinâmicos: `Campos que o participante deve preencher na inscrição`.

---

## 3. Conformidade com o Portão Anti-IA

1. **Zero Textos Fake**: Nenhuma citação fictícia de participante ou métrica arbitrária inventada.
2. **Clareza de Requisitos Legais**: Termos de identificação de menor de idade tratados com gravidade e respeito aos pais.
3. **Ergonomia Linguística**: Textos de botão curtos, objetivos e sem adjetivação desnecessária.
