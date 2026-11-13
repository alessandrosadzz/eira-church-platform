// supabase/functions/criar-preferencia/index.ts
// Edge Function: Criação de Preferência de Checkout no Mercado Pago com Segurança

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestBody {
  evento_id: string;
  inscricao_id: string;
  nome: string;
  email: string;
  valor: number;
  nome_evento: string;
  evento_slug: string;
}

serve(async (req: Request) => {
  // 1. Tratar requisições Preflight de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const body: RequestBody = await req.json();

    // Validação de entrada básica
    if (!body.inscricao_id || !body.evento_id || body.valor <= 0) {
      return Response.json(
        { error: 'Dados da inscrição inválidos ou valor inconsistente.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN')!;
    const appUrl = Deno.env.get('APP_URL') || 'https://eirachurch.com.br';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 2. Validar que a inscrição existe no banco e está com status 'pendente'
    const { data: inscricao, error: inscricaoError } = await supabase
      .from('inscricoes')
      .select('id, status, valor:eventos(valor)')
      .eq('id', body.inscricao_id)
      .single();

    if (inscricaoError || !inscricao || inscricao.status !== 'pendente') {
      return Response.json(
        { error: 'Inscrição não encontrada ou já confirmada/cancelada.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // 3. Criar preferência na API oficial do Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mpAccessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            id: body.evento_id,
            title: `Inscrição: ${body.nome_evento}`,
            quantity: 1,
            unit_price: Number(body.valor),
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: body.nome,
          email: body.email || 'contato@eirachurch.com.br',
        },
        external_reference: body.inscricao_id,
        notification_url: `${supabaseUrl}/functions/v1/webhook-mercadopago`,
        back_urls: {
          success: `${appUrl}/evento/${body.evento_slug}?status=pago`,
          failure: `${appUrl}/evento/${body.evento_slug}?status=erro`,
          pending: `${appUrl}/evento/${body.evento_slug}?status=pendente`,
        },
        auto_return: 'approved',
        payment_methods: {
          installments: 1, // À vista por padrão conforme diretriz de eventos
        },
        metadata: {
          evento_id: body.evento_id,
          inscricao_id: body.inscricao_id,
        },
      }),
    });

    const preference = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Erro retornado pela API do Mercado Pago:', preference);
      return Response.json(
        { error: 'Falha na comunicação com o gateway de pagamento.' },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    // 4. Salvar ID da preferência na inscrição para auditoria
    await supabase
      .from('inscricoes')
      .update({ mp_preference_id: preference.id })
      .eq('id', body.inscricao_id);

    return Response.json(
      {
        preference_id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error('Erro interno na Edge Function criar-preferencia:', err);
    return Response.json(
      { error: 'Erro interno ao processar preferência de pagamento.' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
