"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePayment } from '@/hooks/use-payment';
import { supabase } from '@/lib/supabaseClient';

interface StripePaymentFormProps {
  amount: number;
  planId: number;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

export default function StripePaymentForm({ 
  amount, 
  planId, 
  onSuccess, 
  onError 
}: StripePaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const { processStripePayment } = usePayment();

  // Obtener usuario actual
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      onError('Debes iniciar sesión para realizar el pago');
      return;
    }

    if (!cardData.cardNumber || !cardData.expiryDate || !cardData.cvv || !cardData.cardholderName) {
      onError('Por favor completa todos los campos');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Usar el ID real del usuario autenticado
      const userId = currentUser.id;
      
      const result = await processStripePayment(userId, planId, amount);
      
      if (result.success) {
        onSuccess(result.transactionId);
      } else {
        onError(result.error || 'Error procesando pago con tarjeta');
      }
    } catch (error) {
      console.error('Error en Stripe:', error);
      onError('Error inesperado procesando el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Información de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardholderName">Nombre del Titular</Label>
            <Input
              id="cardholderName"
              type="text"
              placeholder="Ej: Juan Pérez"
              value={cardData.cardholderName}
              onChange={(e) => handleInputChange('cardholderName', e.target.value)}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Número de Tarjeta</Label>
            <Input
              id="cardNumber"
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
              disabled={isProcessing}
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">MM/AA</Label>
              <Input
                id="expiryDate"
                type="text"
                placeholder="12/25"
                value={cardData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                disabled={isProcessing}
                maxLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="text"
                placeholder="123"
                value={cardData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value.replace(/[^0-9]/g, '').substring(0, 4))}
                disabled={isProcessing}
                maxLength={4}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-[#635bff] hover:bg-[#5a54e5] text-white font-semibold py-3"
            size="lg"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Procesando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>💰</span>
                <span>Pagar ${amount}</span>
              </div>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Tu información está protegida con encriptación SSL de 256 bits
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
