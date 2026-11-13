// src/lib/exportCsv.ts

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Inscricao } from '../types/inscricao';

export function exportarCsvInscricoes(inscricoes: Inscricao[], nomeEvento?: string) {
  const BOM = '\uFEFF'; // BOM UTF-8 essencial para acentuacao correta no Excel brasileiro
  
  const headers = [
    'Nome Completo',
    'E-mail',
    'Telefone / WhatsApp',
    'Data de Nascimento',
    'Menor de Idade?',
    'Nome do Responsável',
    'WhatsApp do Responsável',
    'Evento',
    'Status do Pagamento',
    'Método Utilizado',
    'Observações de Saúde / Alergias',
    'Data da Inscrição',
  ];

  const rows = inscricoes.map((i) => [
    i.nome,
    i.email || '',
    i.telefone || '',
    i.nascimento ? format(parseISO(i.nascimento), 'dd/MM/yyyy') : '',
    i.nome_responsavel ? 'Sim (< 18 anos)' : 'Não',
    i.nome_responsavel || '',
    i.telefone_responsavel || '',
    i.evento?.nome || '',
    i.status.toUpperCase(),
    i.metodo_pag ? i.metodo_pag.toUpperCase() : 'PENDENTE',
    i.observacoes_saude || 'Nenhuma',
    format(parseISO(i.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
  ]);

  const csvContent =
    BOM +
    [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(';') // Ponto-e-virgula e o padrao do Excel pt-BR
      )
      .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dataHoje = format(new Date(), 'yyyy-MM-dd');
  const sufixoEvento = nomeEvento ? `-${nomeEvento.toLowerCase().replace(/\s+/g, '-')}` : '';
  a.download = `inscricoes-eira-church${sufixoEvento}-${dataHoje}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
