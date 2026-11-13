/**
 * Suite de Testes Automatizados de Regras Críticas do CarnêPix
 */

const assert = require("assert");

console.log("=== INICIANDO SUÍTE DE TESTES UNITÁRIOS E DE DOMÍNIO ===");

// 1. Teste de Divisão Exata de Centavos (Regra de Ouro Financeira)
function calcularDivisaoCentavos(totalCentavos, parcelas) {
  const base = Math.floor(totalCentavos / parcelas);
  const resto = totalCentavos % parcelas;
  const lista = [];
  for (let i = 1; i <= parcelas; i++) {
    lista.push(i === 1 ? base + resto : base);
  }
  return lista;
}

// Teste 1: R$ 100,00 em 3 parcelas (10000 centavos / 3 = 3334, 3333, 3333)
const p3 = calcularDivisaoCentavos(10000, 3);
assert.strictEqual(p3.length, 3, "Deve ter 3 parcelas");
assert.strictEqual(p3[0], 3334, "Primeira parcela deve absorver o centavo residual");
assert.strictEqual(p3[1], 3333, "Segunda parcela deve ser 3333 centavos");
assert.strictEqual(p3[2], 3333, "Terceira parcela deve ser 3333 centavos");
const somaP3 = p3.reduce((a, b) => a + b, 0);
assert.strictEqual(somaP3, 10000, "A soma das parcelas deve ser exatamente igual ao total de centavos");
console.log("✓ Teste 1 Aprovado: Divisão exata de centavos sem perda monetária (3x de R$ 33,33/33,34)");

// Teste 2: R$ 600,00 em 4 parcelas (60000 centavos / 4 = 15000, 15000, 15000, 15000)
const p4 = calcularDivisaoCentavos(60000, 4);
assert.strictEqual(p4.length, 4, "Deve ter 4 parcelas");
assert.strictEqual(p4.every((v) => v === 15000), true, "Todas as parcelas devem ser de 15000 centavos");
console.log("✓ Teste 2 Aprovado: Parcelamento simétrico sem resíduo (4x de R$ 150,00)");

// Teste 3: Mascaramento LGPD de Documentos
function mascararCpf(cpf) {
  const limpo = cpf.replace(/\D/g, "");
  return `${limpo.slice(0, 3)}.***.***-${limpo.slice(9)}`;
}
const cpfMascarado = mascararCpf("345.678.901-23");
assert.strictEqual(cpfMascarado, "345.***.***-23", "CPF deve manter apenas primeiros e últimos dígitos");
console.log("✓ Teste 3 Aprovado: Conformidade LGPD no mascaramento de documentos");

// Teste 4: Formatação de Moeda Brasileira
function formatarMoeda(centavos) {
  const val = (centavos / 100).toFixed(2).replace(".", ",");
  return `R$ ${val}`;
}
assert.strictEqual(formatarMoeda(15000), "R$ 150,00", "Formatação de R$ 150,00");
assert.strictEqual(formatarMoeda(3334), "R$ 33,34", "Formatação de R$ 33,34");
console.log("✓ Teste 4 Aprovado: Formatação de moeda BRL precisa");

// Teste 5: Idempotência de Transição de Estado
const parcelaTeste = { id: "p1", status: "PENDENTE" };
function liquidarParcela(p) {
  if (p.status === "PAGO") return { p, alterou: false };
  p.status = "PAGO";
  p.pagoEm = new Date().toISOString();
  return { p, alterou: true };
}

const exec1 = liquidarParcela(parcelaTeste);
assert.strictEqual(exec1.alterou, true, "Primeira liquidação deve alterar o status");
assert.strictEqual(exec1.p.status, "PAGO", "Status deve ser PAGO");

const exec2 = liquidarParcela(parcelaTeste);
assert.strictEqual(exec2.alterou, false, "Segunda liquidação deve ser ignorada de forma idempotente");
console.log("✓ Teste 5 Aprovado: Idempotência na baixa de parcelas");

console.log("\n=== TODOS OS 5 TESTES CRÍTICOS PASSARAM COM 100% DE SUCESSO ===");
