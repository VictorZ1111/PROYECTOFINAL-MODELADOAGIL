import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Manejar el evento
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSucceeded(paymentIntent);
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailed(failedPayment);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const transactionId = paymentIntent.metadata.transactionId;
    
    if (!transactionId) {
      console.error('No transaction ID found in metadata');
      return;
    }

    // Actualizar la transacción
    const { error: updateError } = await supabase
      .from('transacciones')
      .update({
        estado: 'completado',
        stripe_payment_intent_id: paymentIntent.id,
        fecha_procesado: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      return;
    }

    // Crear suscripción
    const { error: subscriptionError } = await supabase.rpc('crear_suscripcion_por_transaccion', {
      p_transaccion_id: transactionId
    });

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
    }

    console.log(`Payment succeeded for transaction ${transactionId}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const transactionId = paymentIntent.metadata.transactionId;
    
    if (!transactionId) {
      console.error('No transaction ID found in metadata');
      return;
    }

    // Actualizar la transacción como fallida
    const { error } = await supabase
      .from('transacciones')
      .update({
        estado: 'fallido',
        stripe_payment_intent_id: paymentIntent.id,
        fecha_procesado: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (error) {
      console.error('Error updating failed transaction:', error);
    }

    console.log(`Payment failed for transaction ${transactionId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}
