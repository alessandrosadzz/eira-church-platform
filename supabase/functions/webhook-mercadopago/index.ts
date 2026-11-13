// supabase/functions/webhook-mercadopago/index.ts
// Edge Function: Processamento Seguro de Notificações de Pagamento (Validação HMAC-SHA256)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function mapPaymentType(paymentTypeId: string): 'pix' | 'cartao' | 'boleto' {
  if (paymentTypeId === 'bank_transfer' || paymentTypeId === 'pix') return 'pix';
  if (paymentTypeId === 'ticket') return 'boleto';
  return 'cartao';
}

serve(async (req: Request) => {
  // O Mercado Pago envia requisições POST para webhooks
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const xSignature = req.headers.get('x-signature') ?? '';
    const xRequestId = req.headers.get('x-request-id') ?? '';
    const dataId = url.searchParams.get('data.id') ?? '';
    const bodyText = await req.text();

    const webhookSecret = Deno.env.get('MP_WEBHOOK_SECRET');

    // 1. Verificação Criptográfica de Assinatura HMAC-SHA256
    if (webhookSecret && xSignature) {
      const parts = xSignature.split(',');
      const tsPart = parts.find((p) => p.trim().startsWith('ts='));
      const v1Part = parts.find((p) => p.trim().startsWith('v1='));

      const ts = tsPart ? tsPart.split('=')[1] : '';
      const v1 = v1Part ? v1Part.split('=')[1] : '';

      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(manifest));
      const hashHex = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      if (hashHex !== v1) {
        console.warn('Alerta de Segurança: Assinatura HMAC do webhook inválida rejeitada.');
        return new Response('Assinatura HMAC Inválida', { status: 401 });
      }
    }

    const payload = JSON.parse(bodyText);

    // 2. Processar apenas eventos de pagamento com ID associado
    const paymentId = payload.data?.id || (payload.type === 'payment' ? payload.data?.id : null);

    if (payload.action?.includes('payment') || payload.type === 'payment' || paymentId) {
      const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN')!;

      // Consultar detalhes oficiais do pagamento na API do Mercado Pago
      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${mpAccessToken}`,
        },
      });

      if (!paymentRes.ok) {
        console.error(`Falha ao consultar pagamento ${paymentId} na API MP:`, await paymentRes.text());
        return new Response('ok', { status: 200 }); // Retorna 200 para evitar loops de retry indevidos
      }

      const payment = await paymentRes.json();

      // 3. Se aprovado, atualizar a inscrição no banco de dados
      if (payment.status === 'approved' && payment.external_reference) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );

        const metodo = mapPaymentType(payment.payment_type_id);

        const { error: updateError } = await supabase
          .from('inscricoes')
          .update({
            status: 'pago',
            mp_payment_id: String(payment.id),
            metodo_pag: metodo,
          })
          .eq('id', payment.external_reference);

        if (updateError) {
          console.error('Erro ao atualizar inscrição no Supabase:', updateError);
          return new Response('Erro no banco de dados', { status: 500 });
        }

        console.log(`Inscrição ${payment.external_reference} confirmada com sucesso via ${metodo}!`);
      }
    }

    return new Response('ok', { status: 200 });
  } catch (err: any) {
    console.error('Erro inesperado no processamento do webhook MP:', err);
    return new Response('Erro Interno', { status: 500 });
  }
});
