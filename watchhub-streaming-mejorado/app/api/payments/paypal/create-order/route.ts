import { NextRequest, NextResponse } from 'next/server';

const paypal = require('@paypal/checkout-server-sdk');

// Configuración del entorno PayPal
function environment() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

// Cliente PayPal
function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

export async function POST(request: NextRequest) {
  try {
    const { amount, planId, transactionId } = await request.json();
    
    console.log('📋 Datos recibidos:', { amount, planId, transactionId });
    console.log('🔑 PayPal Client ID:', process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? 'Configurado' : 'NO CONFIGURADO');
    console.log('🔐 PayPal Client Secret:', process.env.PAYPAL_CLIENT_SECRET ? 'Configurado' : 'NO CONFIGURADO');

    // Validar datos
    if (!amount || !planId || !transactionId) {
      return NextResponse.json(
        { error: 'Datos faltantes: amount, planId, transactionId' },
        { status: 400 }
      );
    }

    // Crear orden PayPal
    const requestPayPal = new paypal.orders.OrdersCreateRequest();
    requestPayPal.prefer("return=representation");
    requestPayPal.requestBody({
      intent: 'CAPTURE',
      application_context: {
        brand_name: 'WatchHub Streaming',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/pago/success?method=paypal&transaction=${transactionId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pago/cancel?method=paypal&transaction=${transactionId}`
      },
      purchase_units: [{
        reference_id: transactionId,
        amount: {
          currency_code: 'USD',
          value: amount.toFixed(2)
        },
        description: `Suscripción WatchHub - Plan ${planId}`,
        custom_id: `plan_${planId}_transaction_${transactionId}`
      }]
    });

    const order = await client().execute(requestPayPal);
    
    console.log('🔍 Respuesta completa de PayPal:', JSON.stringify(order.result, null, 2));
    
    // Buscar el enlace de aprobación
    const approvalLink = order.result.links?.find(
      (link: any) => link.rel === 'approve'
    );

    console.log('🔗 Enlaces encontrados:', order.result.links);
    console.log('🎯 Enlace de aprobación:', approvalLink);

    if (!approvalLink) {
      console.error('❌ No se encontró enlace de aprobación en PayPal');
      return NextResponse.json(
        { error: 'No se pudo generar enlace de pago PayPal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: order.result.id,
      approvalUrl: approvalLink.href,
      links: order.result.links, // Incluir todos los enlaces para debugging
      status: order.result.status,
      success: true
    });

  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
