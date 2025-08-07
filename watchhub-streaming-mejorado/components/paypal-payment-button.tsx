"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { usePayment } from '@/hooks/use-payment';
import { supabase } from '@/lib/supabaseClient';

interface PayPalPaymentButtonProps {
  amount: number;
  planId: number;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

export default function PayPalPaymentButton({ 
  amount, 
  planId, 
  onSuccess, 
  onError 
}: PayPalPaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { processPayPalPayment } = usePayment();

  // Obtener usuario actual
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('PayPal Button - Error getting user:', error);
        } else {
          console.log('PayPal Button - Usuario cargado:', user?.id || 'No autenticado');
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('PayPal Button - Error in getUser:', error);
        setCurrentUser(null);
      }
    };
    
    getUser();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('PayPal Button - Auth state changed:', event, session?.user?.id || 'No user');
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePayment = async () => {
    console.log('🔍 Iniciando pago - Usuario actual:', currentUser?.id || 'No autenticado');
    
    if (!currentUser) {
      console.log('❌ No hay usuario autenticado en PayPal button');
      onError('Debes iniciar sesión para realizar el pago');
      return;
    }

    try {
      setIsProcessing(true);
      console.log('🚀 Iniciando pago PayPal con usuario:', currentUser.id);
      
      // Usar el ID real del usuario autenticado
      const userId = currentUser.id;
      
      const result = await processPayPalPayment(userId, planId, amount);
      console.log('🎯 Resultado del pago:', result);
      
      if (result.success) {
        console.log('✅ Pago exitoso');
        onSuccess(result.transactionId);
      } else {
        console.log('❌ Error en el pago:', result.error);
        onError(result.error || 'Error procesando pago PayPal');
      }
    } catch (error) {
      console.error('💥 Error crítico en PayPal:', error);
      onError('Error inesperado procesando el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold py-3"
        size="lg"
      >
        {isProcessing ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Procesando...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>💳</span>
            <span>Pagar ${amount} con PayPal</span>
          </div>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Serás redirigido a PayPal para completar el pago de forma segura
      </p>
    </div>
  );
}
