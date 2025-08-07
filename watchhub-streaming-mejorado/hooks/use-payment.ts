import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Crear transacción en la base de datos
  const createTransaction = async (
    userId: string,
    planId: number,
    amount: number,
    paymentMethod: 'paypal' | 'stripe'
  ) => {
    const { data, error } = await supabase
      .from('transacciones')
      .insert({
        usuario_id: userId,
        plan_id: planId,
        monto: amount,
        metodo_pago: paymentMethod,
        estado: 'pendiente'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear transacción: ${error.message}`);
    }

    return data;
  };

  // Procesar pago con PayPal
  const processPayPalPayment = async (
    userId: string,
    planId: number,
    amount: number
  ) => {
    setLoading(true);
    try {
      console.log('🔄 Iniciando pago PayPal:', { userId, planId, amount });
      
      // 1. Crear transacción en la base de datos
      console.log('📝 Creando transacción...');
      const transaction = await createTransaction(userId, planId, amount, 'paypal');
      console.log('✅ Transacción creada:', transaction);

      // 2. Crear order en PayPal
      console.log('💳 Creando orden PayPal...');
      const response = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          planId,
          transactionId: transaction.id
        }),
      });

      console.log('📡 Respuesta PayPal status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ PayPal API Error:', errorData);
        throw new Error('Error al crear orden en PayPal');
      }

      const responseData = await response.json();
      console.log('✅ Respuesta PayPal:', responseData);
      
      const { orderId } = responseData;
      
      // 3. Redirigir a PayPal
      const paypalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`;
      console.log('🔗 Redirigiendo a:', paypalUrl);
      window.location.href = paypalUrl;
      
      return {
        success: true,
        transactionId: transaction.id,
        orderId: orderId
      };
    } catch (error) {
      console.error('❌ Error completo PayPal:', error);
      toast({
        title: "Error",
        description: "Error al procesar pago con PayPal",
        variant: "destructive",
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    } finally {
      setLoading(false);
    }
  };

  // Procesar pago con Stripe
  const processStripePayment = async (
    userId: string,
    planId: number,
    amount: number
  ) => {
    setLoading(true);
    try {
      // 1. Crear transacción en la base de datos
      const transaction = await createTransaction(userId, planId, amount, 'stripe');

      // 2. Crear payment intent en Stripe
      const response = await fetch('/api/payments/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Stripe usa centavos
          planId,
          transactionId: transaction.id
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear payment intent en Stripe');
      }

      const { clientSecret } = await response.json();
      return clientSecret;
    } catch (error) {
      console.error('Error Stripe:', error);
      toast({
        title: "Error",
        description: "Error al procesar pago con Stripe",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verificar límite de reproducciones
  const checkReproductionLimit = async (userId: string) => {
    const { data, error } = await supabase
      .rpc('verificar_limite_reproducciones', {
        usuario_uuid: userId
      });

    if (error) {
      console.error('Error al verificar límite:', error);
      return false;
    }

    return data;
  };

  // Registrar reproducción
  const registerReproduction = async (
    userId: string,
    contentId: number,
    duration: number = 0,
    percentage: number = 0
  ) => {
    const { data, error } = await supabase
      .rpc('registrar_reproduccion', {
        usuario_uuid: userId,
        contenido_id_param: contentId,
        duracion_param: duration,
        porcentaje_param: percentage
      });

    if (error) {
      console.error('Error al registrar reproducción:', error);
      toast({
        title: "Límite alcanzado",
        description: "Has alcanzado el límite de reproducciones de tu plan",
        variant: "destructive",
      });
      return false;
    }

    return data;
  };

  // Obtener suscripción activa del usuario
  const getActiveSubscription = async (userId: string) => {
    const { data, error } = await supabase
      .from('suscripciones')
      .select(`
        *,
        planes (
          nombre,
          precio,
          max_peliculas,
          descripcion
        )
      `)
      .eq('usuario_id', userId)
      .eq('estado', 'activa')
      .gt('fecha_fin', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error al obtener suscripción:', error);
      return null;
    }

    return data;
  };

  // Obtener historial de transacciones
  const getTransactionHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('transacciones')
      .select(`
        *,
        planes (
          nombre,
          precio
        )
      `)
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener historial:', error);
      return [];
    }

    return data;
  };

  return {
    loading,
    processPayPalPayment,
    processStripePayment,
    checkReproductionLimit,
    registerReproduction,
    getActiveSubscription,
    getTransactionHistory
  };
};
