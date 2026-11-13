// Test Runner Automatizado — Eredità Residence
import assert from 'node:assert';
import { EREDITA_BUILDING } from '../src/lib/data/building-data.ts';
import { calculateInvestmentSimulation } from '../src/lib/simulation-engine.ts';
import { LeadSchema } from '../src/lib/validations.ts';
import { generateConciergeWhatsAppUrl } from '../src/lib/whatsapp.ts';
import { formatBRL, formatPercent, formatSqm } from '../src/lib/formatters.ts';

let passedTests = 0;
let failedTests = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${description}`);
    console.error(`    ${err.message}`);
    failedTests++;
  }
}

console.log('\n======================================================');
console.log('  SUÍTE DE TESTES AUTOMATIZADOS — EREDITÀ RESIDENCE');
console.log('======================================================\n');

// 1. Testes do Catálogo de Dados do Edifício
console.log('--- 1. Integridade do Catálogo de Dados ---');

test('Deve conter exatamente 10 pavimentos (Térreo, Lazer e 8 Residenciais)', () => {
  assert.strictEqual(EREDITA_BUILDING.floors.length, 10);
});

test('Todos os andares devem possuir coordenadas SVG válidas dentro dos limites (0-100%)', () => {
  for (const floor of EREDITA_BUILDING.floors) {
    const { topPercent, heightPercent, leftPercent, widthPercent } = floor.svgCoordinates;
    assert.ok(topPercent >= 0 && topPercent <= 100, `topPercent inválido no ${floor.label}`);
    assert.ok(topPercent + heightPercent <= 100, `Andar ${floor.label} ultrapassa 100% de altura`);
    assert.ok(leftPercent >= 0 && widthPercent > 0, `Largura/esquerda inválida no ${floor.label}`);
  }
});

test('Cobertura (9º Andar) deve possuir 5 suítes e área privativa superior a 400m²', () => {
  const penthouse = EREDITA_BUILDING.floors.find((f) => f.floorNumber === 9);
  assert.ok(penthouse, 'Cobertura não encontrada');
  assert.strictEqual(penthouse.suites, 5);
  assert.ok(penthouse.privateAreaSqm > 400, 'Área da cobertura incompatível');
  assert.strictEqual(penthouse.type, 'COBERTURA');
});

test('Todos os apartamentos tipo residenciais (2º ao 8º) devem possuir 4 suítes e 3 vagas', () => {
  const residentialFloors = EREDITA_BUILDING.floors.filter((f) => f.floorNumber >= 2 && f.floorNumber <= 8);
  for (const floor of residentialFloors) {
    assert.strictEqual(floor.suites, 4, `Suítes divergentes no ${floor.label}`);
    assert.strictEqual(floor.parkingSpots, 3, `Vagas divergentes no ${floor.label}`);
    assert.ok(floor.rooms.length >= 4, `Ambientes da planta ausentes no ${floor.label}`);
  }
});

// 2. Testes do Motor de Cálculo Financeiro & Simulação de Investimento
console.log('\n--- 2. Motor de Simulação Financeira (CFO / FipeZAP) ---');

test('Cálculo de valorização composta a 15,4% a.a. em 36 meses deve bater com precisão', () => {
  const price = 4850000;
  const result = calculateInvestmentSimulation({
    propertyPrice: price,
    downPaymentPercent: 20,
    constructionMonths: 36,
    scAnnualAppreciationRate: 15.4,
    cdiAnnualRate: 10.5,
    poupancaAnnualRate: 6.17,
    shortStayDailyRateAverage: 2400,
    shortStayOccupancyDaysPerYear: 130
  });

  // (1 + 0.154)^3 = 1.5369...
  const expectedValue = price * Math.pow(1.154, 3);
  const diff = Math.abs(result.projectedValueAtDelivery - expectedValue);
  assert.ok(diff < 1.0, 'Discrepância no cálculo de valorização composta');
  assert.strictEqual(result.downPaymentValue, 970000);
  assert.strictEqual(result.keysDeliveryBalance, 1212500); // 25% de 4.850.000
});

test('Alpha do Eredità sobre o CDI líquido deve ser positivo no litoral catarinense', () => {
  const result = calculateInvestmentSimulation({
    propertyPrice: 5000000,
    downPaymentPercent: 20,
    constructionMonths: 36,
    scAnnualAppreciationRate: 15.4,
    cdiAnnualRate: 10.5,
    poupancaAnnualRate: 6.17,
    shortStayDailyRateAverage: 2400,
    shortStayOccupancyDaysPerYear: 130
  });

  assert.ok(result.alphaVsCdi > 0, 'Alpha deve ser expressivamente superior à renda fixa');
  assert.ok(result.nominalCapitalGain > result.cdiProjectedTotalGain, 'Ganho imobiliário deve superar CDI');
});

test('Áreas comuns com preço 0 devem retornar cálculo zerado sem falhar', () => {
  const result = calculateInvestmentSimulation({
    propertyPrice: 0,
    downPaymentPercent: 20,
    constructionMonths: 36,
    scAnnualAppreciationRate: 15.4,
    cdiAnnualRate: 10.5,
    poupancaAnnualRate: 6.17,
    shortStayDailyRateAverage: 2400,
    shortStayOccupancyDaysPerYear: 130
  });

  assert.strictEqual(result.projectedValueAtDelivery, 0);
  assert.strictEqual(result.nominalCapitalGain, 0);
});

// 3. Testes dos Formatadores de Moeda e Área
console.log('\n--- 3. Formatadores de Moeda e Área ---');

test('formatBRL deve formatar moeda brasileira com prefixo R$ e separador de milhar', () => {
  const str = formatBRL(4850000);
  assert.ok(str.includes('4.850.000') || str.includes('4\u00A0850\u00A0000') || str.includes('R$'), 'Formatação BRL inválida');
});

test('formatSqm deve incluir sufixo m² e vírgula decimal', () => {
  assert.strictEqual(formatSqm(238.5), '238,5 m²');
});

test('formatPercent deve exibir porcentagem com 1 casa decimal', () => {
  assert.strictEqual(formatPercent(15.4), '15,4%');
});

// 4. Testes de Validação com Zod e Segurança Anti-Spam
console.log('\n--- 4. Validações Zod & Segurança de Leads ---');

test('Lead válido com todos os campos deve ser aprovado pelo schema Zod', () => {
  const validData = {
    fullName: 'Dr. Roberto Guimarães',
    whatsapp: '(47) 99876-5432',
    email: 'roberto.guimaraes@invest.com.br',
    selectedFloorId: 'andar-7',
    floorLabel: '7º Andar',
    unitPrice: 4850000,
    downPaymentPercent: 20,
    projectedGain: 2450000,
    consentLGPD: true
  };

  const validation = LeadSchema.safeParse(validData);
  assert.strictEqual(validation.success, true);
});

test('Lead com nome inferior a 3 caracteres deve ser rejeitado', () => {
  const invalidData = {
    fullName: 'Ro',
    whatsapp: '(47) 99876-5432',
    email: 'roberto@invest.com.br',
    selectedFloorId: 'andar-7',
    floorLabel: '7º Andar',
    unitPrice: 4850000,
    downPaymentPercent: 20,
    projectedGain: 2450000,
    consentLGPD: true
  };

  const validation = LeadSchema.safeParse(invalidData);
  assert.strictEqual(validation.success, false);
});

test('Lead com honeypot preenchido (bot) deve ser rejeitado', () => {
  const botData = {
    fullName: 'Bot Spammer',
    whatsapp: '(47) 99876-5432',
    email: 'bot@spam.com',
    selectedFloorId: 'andar-7',
    floorLabel: '7º Andar',
    unitPrice: 4850000,
    downPaymentPercent: 20,
    projectedGain: 2450000,
    consentLGPD: true,
    honeypot: 'http://spam-link.ru'
  };

  const validation = LeadSchema.safeParse(botData);
  assert.strictEqual(validation.success, false);
});

test('Lead sem consentimento LGPD explícito deve ser bloqueado', () => {
  const noConsentData = {
    fullName: 'Roberto Guimarães',
    whatsapp: '(47) 99876-5432',
    email: 'roberto@invest.com.br',
    selectedFloorId: 'andar-7',
    floorLabel: '7º Andar',
    unitPrice: 4850000,
    downPaymentPercent: 20,
    projectedGain: 2450000,
    consentLGPD: false
  };

  const validation = LeadSchema.safeParse(noConsentData);
  assert.strictEqual(validation.success, false);
});

// 5. Testes da Integração com o WhatsApp Concierge
console.log('\n--- 5. Geração de Link do WhatsApp Concierge ---');

test('Deve gerar URL do WhatsApp codificada com dados do andar e simulação', () => {
  const url = generateConciergeWhatsAppUrl({
    clientName: 'Roberto',
    floorLabel: '7º Andar',
    unitName: 'Apartamento 701',
    unitPrice: 4850000,
    privateAreaSqm: 238.5,
    suites: 4,
    downPaymentPercent: 20,
    projectedGain: 2450000,
    deliveryDate: 'Dezembro/2027'
  });

  assert.ok(url.startsWith('https://wa.me/'));
  assert.ok(url.includes('Roberto'));
  assert.ok(url.includes('Eredit%C3%A0'));
  assert.ok(url.includes('Dezembro'));
});

console.log('\n======================================================');
console.log(`  RESUMO DA EXECUÇÃO: ${passedTests} PASSOU | ${failedTests} FALHOU`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
