import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, userId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment Intent ID es requerido' },
        { status: 400 }
      );
    }

    // Recuperar el payment intent desde Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'El pago no fue exitoso' },
        { status: 400 }
      );
    }

    // Actualizar la transacción en la base de datos
    const { data: transaction, error: updateError } = await supabase
      .from('transacciones')
      .update({
        estado: 'completado',
        stripe_payment_intent_id: paymentIntentId,
        fecha_procesado: new Date().toISOString()
      })
      .eq('id', paymentIntent.metadata.transactionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error actualizando transacción:', updateError);
      return NextResponse.json(
        { error: 'Error actualizando transacción' },
        { status: 500 }
      );
    }

    // Crear suscripción
    if (transaction) {
      const { error: subscriptionError } = await supabase.rpc('crear_suscripcion_por_transaccion', {
        p_transaccion_id: transaction.id
      });

      if (subscriptionError) {
        console.error('Error creando suscripción:', subscriptionError);
        return NextResponse.json(
          { error: 'Error creando suscripción' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      transactionId: transaction?.id,
      message: 'Pago procesado exitosamente'
    });

  } catch (error) {
    console.error('Error confirmando pago Stripe:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
