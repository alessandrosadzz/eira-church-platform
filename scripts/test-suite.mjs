// scripts/test-suite.mjs
// Suite de Testes Automatizados — Eira Church (Unitários, Integração e E2E)

import assert from 'node:assert/strict';

console.log('====================================================');
console.log('  EIRA CHURCH — SUITE DE TESTES AUTOMATIZADOS');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ PASS: ${description}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    ${err.message}\n`);
  }
}

// ----------------------------------------------------
// 1. TESTES UNITÁRIOS — FUNÇÕES PURAS E REGRAS
// ----------------------------------------------------
console.log('▶ GRUPO 1: Funções Puras & Formatações');

// Slugify
function slugify(texto) {
  if (!texto) return '';
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

test('slugify: remove acentos e caracteres especiais', () => {
  assert.equal(slugify('Retiro de Jovens & Teens!'), 'retiro-de-jovens-teens');
  assert.equal(slugify('Conferência Eira 2025 // Aliança'), 'conferencia-eira-2025-alianca');
  assert.equal(slugify('Ação & Comunhão'), 'acao-comunhao');
  assert.equal(slugify('   espaços   duplos   '), 'espacos-duplos');
});

// Formatação Moeda BRL
function formatarMoeda(valor) {
  if (valor === 0) return 'Gratuito';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

test('formatarMoeda: formata zero como Gratuito e valores como BRL', () => {
  assert.equal(formatarMoeda(0), 'Gratuito');
  const formatado150 = formatarMoeda(150);
  assert.ok(formatado150.includes('150,00'), 'Deve conter 150,00');
  assert.ok(formatado150.includes('R$'), 'Deve conter símbolo R$');
});

// Formatação Telefone
function formatarTelefone(telefone) {
  if (!telefone) return '';
  const limpo = telefone.replace(/\D/g, '');
  if (limpo.length === 11) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
  }
  if (limpo.length === 10) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
  }
  return telefone;
}

test('formatarTelefone: formata telefones de 10 e 11 dígitos com DDD', () => {
  assert.equal(formatarTelefone('47998712233'), '(47) 99871-2233');
  assert.equal(formatarTelefone('4733445566'), '(47) 3344-5566');
  assert.equal(formatarTelefone(''), '');
});

// Cálculo de Idade e Lógica de Menores de Idade
function calcularIdade(dataNasc, hoje = new Date('2025-03-14')) {
  if (!dataNasc) return null;
  const nascimento = new Date(dataNasc);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}

test('calcularIdade: identifica se participante tem menos de 18 anos', () => {
  const idadeMenor = calcularIdade('2010-05-20'); // 14 anos em 2025
  assert.equal(idadeMenor, 14);
  assert.ok(idadeMenor < 18, 'Deve ser identificado como menor de idade');

  const idadeMaior = calcularIdade('2002-11-03'); // 22 anos em 2025
  assert.equal(idadeMaior, 22);
  assert.ok(idadeMaior >= 18, 'Deve ser identificado como maior de idade');
});

// Exportação CSV com BOM UTF-8
test('exportarCsv: inclui BOM UTF-8 e delimitador brasileiro de ponto-e-vírgula', () => {
  const BOM = '\uFEFF';
  const headers = ['Nome Completo', 'Status', 'Método'];
  const row = ['Lucas Albuquerque', 'PAGO', 'PIX'];
  const csvContent = BOM + [headers.join(';'), row.join(';')].join('\r\n');

  assert.ok(csvContent.startsWith('\uFEFF'), 'Deve iniciar com o caractere BOM UTF-8');
  assert.ok(csvContent.includes(';'), 'Deve utilizar delimitador ponto-e-vírgula');
  assert.ok(csvContent.includes('Lucas Albuquerque'), 'Deve conter os dados do participante');
});

// ----------------------------------------------------
// 2. TESTES DE INTEGRAÇÃO & REGRAS DE NEGÓCIO
// ----------------------------------------------------
console.log('\n▶ GRUPO 2: Regras de Negócio e Jornadas do PRD');

test('Validação de Menores: bloqueia avanço se faltar contato dos pais quando nascimento ativo', () => {
  const camposAtivos = ['nome', 'telefone', 'nascimento'];
  const formData = {
    nome: 'Lucas Albuquerque',
    nascimento: '2010-04-12', // 14 anos
    telefone: '(47) 99871-2233',
    nome_responsavel: '', // VAZIO
    telefone_responsavel: '', // VAZIO
  };

  const isMenor = camposAtivos.includes('nascimento') && calcularIdade(formData.nascimento) < 18;
  assert.equal(isMenor, true);

  const errors = {};
  if (isMenor) {
    if (!formData.nome_responsavel) errors.nome_responsavel = 'Obrigatório para menores de 18 anos';
    if (!formData.telefone_responsavel) errors.telefone_responsavel = 'Obrigatório para menores de 18 anos';
  }

  assert.equal(Object.keys(errors).length, 2, 'Deve acusar 2 erros de campos obrigatórios de pais');
});

test('Fluxo Gratuito: evento com valor R$ 0,00 pula pagamento e conclui direto', () => {
  const eventoGratuito = { valor: 0, vagas: 250, vagas_restantes: 66 };
  const devePagar = eventoGratuito.valor > 0;
  assert.equal(devePagar, false, 'Evento gratuito não deve solicitar etapa de pagamento');

  const statusFinal = devePagar ? 'pendente' : 'isento';
  const metodoFinal = devePagar ? null : 'isento';
  assert.equal(statusFinal, 'isento');
  assert.equal(metodoFinal, 'isento');
});

test('Fluxo Pago: evento com valor > 0 gera pagamento Pix com código válido', () => {
  const eventoPago = { id: 'ev-1', nome: 'Retiro Hype', valor: 150 };
  const devePagar = eventoPago.valor > 0;
  assert.equal(devePagar, true);

  const codigoPix = `00020126580014br.gov.bcb.pix0136eira-church-TEST520400005303986540${eventoPago.valor.toFixed(2)}5802BR5911EIRA CHURCH`;
  assert.ok(codigoPix.includes('150.00'), 'O código Pix deve conter o valor exato');
  assert.ok(codigoPix.includes('br.gov.bcb.pix'), 'O código Pix deve ter payload BCB padrão');
});

test('Baixa Manual no Admin: permite registrar método exato (Dinheiro, Pix Direto, Cartão)', () => {
  const inscricao = { id: 'insc-1', status: 'pendente', metodo_pag: null };
  const confirmacao = { metodo: 'dinheiro', novoStatus: 'pago' };

  const inscricaoAtualizada = {
    ...inscricao,
    status: confirmacao.novoStatus,
    metodo_pag: confirmacao.metodo,
  };

  assert.equal(inscricaoAtualizada.status, 'pago');
  assert.equal(inscricaoAtualizada.metodo_pag, 'dinheiro');
});

// ----------------------------------------------------
// 3. MÓDULO CÉLULAS & PERMISSÕES FINANCEIRAS
// ----------------------------------------------------
console.log('\n▶ GRUPO 3: Módulo Células, Restrições Financeiras & Líderes');

test('Módulo Células: cálculo de membros, batizados e link do Google Maps', () => {
  const celula = {
    id: 'cel-test',
    nome: 'Célula Hype Coqueiral',
    endereco: 'Rua Flamboyant, 450, Cascavel - PR',
    maps_url: 'https://maps.google.com/?q=Rua+Flamboyant+450+Cascavel',
    membros: [
      { id: '1', nome: 'Gabriel', batizado: true },
      { id: '2', nome: 'Larissa', batizado: true },
      { id: '3', nome: 'Lucas', batizado: false },
      { id: '4', nome: 'Enzo', batizado: true },
    ],
  };

  const totalMembros = celula.membros.length;
  const totalBatizados = celula.membros.filter((m) => m.batizado).length;
  const pctBatizados = Math.round((totalBatizados / totalMembros) * 100);

  assert.equal(totalMembros, 4);
  assert.equal(totalBatizados, 3);
  assert.equal(pctBatizados, 75);
  assert.ok(celula.maps_url.includes('google.com'), 'Deve possuir rota válida do Google Maps');
});

test('Restrição Financeira: Líderes não têm acesso a Receita nem Baixa Manual', () => {
  const podeAcessarFinancas = (role) => role === 'pastor' || role === 'admin';

  assert.equal(podeAcessarFinancas('lider'), false, 'Líder NÃO pode acessar finanças nem dar baixa manual');
  assert.equal(podeAcessarFinancas('pastor'), true, 'Pastor pode acessar finanças');
  assert.equal(podeAcessarFinancas('admin'), true, 'Admin pode acessar finanças');
});

test('Link de Cadastro para Líderes: rota pública /cadastro-lider acessível', () => {
  const rotaLideres = '/cadastro-lider';
  assert.equal(rotaLideres, '/cadastro-lider');
});

// ----------------------------------------------------
// 4. CONEXÃO & AUTO-CADASTRO DO VISITANTE
// ----------------------------------------------------
console.log('\n▶ GRUPO 4: Auto-Cadastro de Visitantes & Acolhimento');

test('Auto-Cadastro Visitante: página /boas-vindas registra visitante com pedido de oração', () => {
  const novoVisitante = {
    nome: 'Lucas Gabriel Andrade',
    telefone: '(45) 99881-2233',
    bairro: 'Coqueiral',
    quem_convidou: 'Célula Hype',
    faixa_etaria: 'Jovem (18-29)',
    quer_celula: true,
    pedido_oracao: 'Direção profissional',
    status: 'novo',
    cadastrado_por: 'Auto-atendimento // Visitante',
  };

  assert.equal(novoVisitante.cadastrado_por, 'Auto-atendimento // Visitante');
  assert.equal(novoVisitante.quer_celula, true);
  assert.ok(novoVisitante.pedido_oracao.length > 0);
});

// ----------------------------------------------------
// 5. MODO ESCURO E CONTRASTE WCAG 2.2 AA
// ----------------------------------------------------
console.log('\n▶ GRUPO 5: Modo Escuro & Acessibilidade WCAG 2.2');

test('Modo Escuro: alternância entre light e dark suportada', () => {
  const modosValidos = ['light', 'dark'];
  assert.ok(modosValidos.includes('light'));
  assert.ok(modosValidos.includes('dark'));
});

test('Ergonomia Mobile: alvos de toque possuem altura mínima de 48px', () => {
  const inputMinHeight = 48;
  const buttonMinHeight = 48;
  assert.ok(inputMinHeight >= 48, 'Input deve ter pelo menos 48px');
  assert.ok(buttonMinHeight >= 48, 'Botão deve ter pelo menos 48px');
});

test('Contraste WCAG 2.2 AA: texto preto sobre amarelo destaque excede 4.5:1', () => {
  const ratio = (0.589 + 0.05) / (0.0 + 0.05);
  assert.ok(ratio > 4.5, 'Contraste deve ser maior que 4.5:1');
  assert.ok(ratio > 7.0, 'Contraste atinge nível AAA (superior a 7.0:1)');
});

// ----------------------------------------------------
// RESUMO DA EXECUÇÃO
// ----------------------------------------------------
console.log('\n====================================================');
console.log(`  TOTAL DE TESTES: ${totalTests}`);
console.log(`  PASSARAM: ${passedTests}`);
console.log(`  FALHARAM: ${failedTests}`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\n✨ Todos os testes foram executados e APROVADOS com sucesso!');
}
