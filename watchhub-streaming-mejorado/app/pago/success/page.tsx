'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  const method = searchParams.get('method');
  const transactionId = searchParams.get('transaction');
  const paypalOrderId = searchParams.get('token'); // PayPal OrderID

  useEffect(() => {
    const verifyPaymentAndCreateAccount = async () => {
      console.log('🚀 Iniciando verificación de pago y creación de cuenta');
      console.log('📋 Parámetros:', { method, paypalOrderId, transactionId });
      
      if (method === 'paypal' && paypalOrderId && transactionId) {
        try {
          // Capturar el pago de PayPal
          console.log('💰 Capturando pago de PayPal...');
          const response = await fetch('/api/payments/paypal/capture-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: paypalOrderId,
              transactionId: transactionId
            }),
          });

          if (response.ok) {
            console.log('✅ Pago capturado exitosamente');
            const captureData = await response.json();
            console.log('📋 Datos de captura:', captureData);
            setVerified(true);
            
            // Recuperar datos de registro del sessionStorage
            const registroDataStr = sessionStorage.getItem('registroData');
            console.log('📦 Datos en sessionStorage:', registroDataStr);
            
            if (registroDataStr) {
              const registroData = JSON.parse(registroDataStr);
              console.log('📋 Datos de registro recuperados:', registroData);
              
              // Crear cuenta de usuario después del pago exitoso
              console.log('👤 Creando cuenta de usuario...');
              const createAccountResponse = await fetch('/api/auth/register-with-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userData: {
                    nombre: registroData.formData.nombre,
                    nombreUsuario: registroData.formData.nombreUsuario,
                    apellido: registroData.formData.apellido || '',
                    email: registroData.formData.email,
                    password: registroData.formData.password
                  },
                  selectedPlan: registroData.planData || { 
                    id: registroData.planId,
                    nombre: 'Plan Usuario',
                    precio: 9.99 
                  },
                  paymentMethod: 'paypal',
                  transactionId: registroData.transactionId
                }),
              });

              const responseData = await createAccountResponse.json();
              console.log('📋 Respuesta de creación de cuenta:', responseData);

              if (createAccountResponse.ok) {
                console.log('✅ Cuenta creada exitosamente');
                // Limpiar datos temporales
                sessionStorage.removeItem('registroData');
                
                // Mostrar mensaje de éxito
                alert('¡Pago procesado y cuenta creada exitosamente! Bienvenido a WatchHub. Serás redirigido al login.');
                
                // Redirigir al login después de un breve delay
                setTimeout(() => {
                  window.location.href = '/login';
                }, 2000);
              } else {
                console.error('❌ Error creando cuenta después del pago:', responseData);
                alert(`Pago exitoso, pero hubo un error creando la cuenta: ${responseData.error}. Contacta soporte.`);
              }
            } else {
              console.error('❌ No se encontraron datos de registro en sessionStorage');
              alert('Error: No se encontraron datos de registro. El pago fue exitoso, pero no pudimos crear tu cuenta automáticamente. Por favor contacta soporte.');
            }
          } else {
            const errorData = await response.json();
            console.error('❌ Error capturando pago de PayPal:', errorData);
            alert(`Error capturando pago: ${errorData.error || 'Error desconocido'}`);
          }
        } catch (error) {
          console.error('💥 Error en proceso:', error);
        }
      } else {
        console.log('ℹ️ No es pago de PayPal o faltan parámetros');
        setVerified(true); // Para otros métodos de pago
      }
      
      setLoading(false);
    };

    verifyPaymentAndCreateAccount();
  }, [method, paypalOrderId, transactionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 p-8">
          <CardContent className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl font-bold mb-2">Verificando pago...</h2>
            <p className="text-gray-400">Por favor espera mientras confirmamos tu transacción</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <Card className="bg-gray-900 border-gray-800 p-8 max-w-md w-full">
        <CardContent className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">¡Pago Exitoso!</h1>
          
          {verified ? (
            <div>
              <p className="text-gray-300 mb-2">Tu pago ha sido procesado correctamente.</p>
              <p className="text-sm text-gray-400 mb-6">
                Método: {method === 'paypal' ? 'PayPal' : 'Tarjeta de Crédito'}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Transaction ID: {transactionId}
              </p>
              <div className="space-y-3">
                {/* Botón temporal para crear cuenta manualmente si falló */}
                <Button 
                  onClick={async () => {
                    const registroDataStr = sessionStorage.getItem('registroData');
                    if (registroDataStr) {
                      const registroData = JSON.parse(registroDataStr);
                      
                      console.log('🔧 Intentando crear cuenta manualmente...');
                      
                      const response = await fetch('/api/auth/register-with-payment', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          userData: {
                            nombre: registroData.formData.nombre,
                            nombreUsuario: registroData.formData.nombreUsuario,
                            email: registroData.formData.email,
                            password: registroData.formData.password
                          },
                          selectedPlan: registroData.planData || { 
                            id: registroData.planId,
                            nombre: 'Plan Usuario',
                            precio: 9.99 
                          },
                          paymentMethod: 'paypal',
                          transactionId: registroData.transactionId
                        }),
                      });

                      const responseData = await response.json();
                      
                      if (response.ok) {
                        alert('¡Cuenta creada exitosamente! Serás redirigido al login.');
                        sessionStorage.removeItem('registroData');
                        window.location.href = '/login';
                      } else {
                        alert(`Error: ${responseData.error}`);
                        console.error('Error detallado:', responseData);
                      }
                    } else {
                      alert('No se encontraron datos de registro.');
                    }
                  }}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Crear Mi Cuenta Ahora
                </Button>
                
                <Button 
                  onClick={() => router.push('/catalogo')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Ir al Catálogo
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Ir al Login
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-yellow-500 mb-4">Pago pendiente de verificación</p>
              <Button 
                onClick={() => router.push('/planes')}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Volver a Planes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
