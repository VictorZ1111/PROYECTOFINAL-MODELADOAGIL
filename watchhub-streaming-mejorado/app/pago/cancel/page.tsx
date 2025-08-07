'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const method = searchParams.get('method');
  const transactionId = searchParams.get('transaction');

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <Card className="bg-gray-900 border-gray-800 p-8 max-w-md w-full">
        <CardContent className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Pago Cancelado</h1>
          
          <div>
            <p className="text-gray-300 mb-2">El pago ha sido cancelado.</p>
            <p className="text-sm text-gray-400 mb-2">
              Método: {method === 'paypal' ? 'PayPal' : 'Tarjeta de Crédito'}
            </p>
            {transactionId && (
              <p className="text-sm text-gray-400 mb-6">
                Transaction ID: {transactionId}
              </p>
            )}
            
            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/planes')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Intentar de Nuevo
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Volver al Inicio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
