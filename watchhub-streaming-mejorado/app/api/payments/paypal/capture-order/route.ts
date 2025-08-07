import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

const paypal = require('@paypal/checkout-server-sdk');

// Configuración del entorno PayPal
function environment() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new paypal.core.PayPalHttpClient(environment());
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, transactionId } = await request.json();
    
    console.log('💰 Iniciando captura de pago PayPal:', { orderId, transactionId });

    if (!orderId) {
      console.error('❌ OrderId es requerido');
      return NextResponse.json(
        { error: 'orderId es requerido' },
        { status: 400 }
      );
    }

    // Capturar el pago en PayPal
    console.log('🔄 Capturando pago en PayPal...');
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId);
    captureRequest.requestBody({});
    
    const capture = await client().execute(captureRequest);
    
    console.log('📋 Resultado de captura:', capture.result.status);
    console.log('🔍 Detalles completos:', JSON.stringify(capture.result, null, 2));
    
    if (capture.result.status === 'COMPLETED') {
      console.log('✅ Pago capturado exitosamente');
      
      return NextResponse.json({
        success: true,
        paymentId: capture.result.id,
        status: 'completed',
        captureDetails: capture.result
      });
    } else {
      console.log('⚠️ Pago no completado, estado:', capture.result.status);
      return NextResponse.json(
        { error: `Pago no completado. Estado: ${capture.result.status}` },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('💥 Error capturando pago PayPal:', error);
    console.error('🔍 Detalles del error:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: `Error interno del servidor: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
}
