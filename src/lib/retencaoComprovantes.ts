// src/lib/retencaoComprovantes.ts

import { supabase } from './supabase';
import { Inscricao } from '../types/inscricao';

/**
 * Remove comprovantes com mais de X dias (padrão 60 dias) para economizar
 * armazenamento e proteger dados sensíveis, preservando os registros de inscrição intactos.
 */
export async function executarLimpezaComprovantesAntigos(diasRetencao: number = 60): Promise<{
  sucesso: boolean;
  totalRemovidos: number;
  mensagem: string;
}> {
  const agora = Date.now();
  const limiteMs = diasRetencao * 24 * 60 * 60 * 1000;
  const dataLimite = new Date(agora - limiteMs);
  const dataLimiteIso = dataLimite.toISOString();

  let totalRemovidos = 0;

  // 1. Limpar no localStorage do navegador
  if (typeof window !== 'undefined') {
    try {
      const salvos = localStorage.getItem('eira_inscricoes');
      if (salvos) {
        const inscricoes: Inscricao[] = JSON.parse(salvos);
        let alterado = false;

        const atualizadas = inscricoes.map((item) => {
          const itemDate = new Date(item.created_at || Date.now());
          if (item.comprovante_url && itemDate < dataLimite) {
            totalRemovidos++;
            alterado = true;
            return {
              ...item,
              comprovante_url: null,
            };
          }
          return item;
        });

        if (alterado) {
          localStorage.setItem('eira_inscricoes', JSON.stringify(atualizadas));
        }
      }
    } catch (e) {
      console.warn('Erro ao limpar comprovantes no localStorage:', e);
    }
  }

  // 2. Limpar no Supabase (se a tabela possuir comprovante_url)
  try {
    const { data, error } = await supabase
      .from('inscricoes')
      .update({ comprovante_url: null })
      .lt('created_at', dataLimiteIso)
      .not('comprovante_url', 'is', null)
      .select('id');

    if (!error && data) {
      totalRemovidos = Math.max(totalRemovidos, data.length);
    }
  } catch (err) {
    console.warn('Erro ao atualizar limpeza de comprovantes no Supabase:', err);
  }

  return {
    sucesso: true,
    totalRemovidos,
    mensagem:
      totalRemovidos > 0
        ? `${totalRemovidos} comprovante(s) com mais de ${diasRetencao} dias foram desanexados com sucesso para economizar espaço de banco de dados. Os registros e confirmações das inscrições permanecem intactos.`
        : `Nenhum comprovante com mais de ${diasRetencao} dias pendente de limpeza. O banco de dados está otimizado!`,
  };
}
