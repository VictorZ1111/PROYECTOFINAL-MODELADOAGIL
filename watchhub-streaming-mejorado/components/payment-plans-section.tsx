"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useUserPlan } from '@/hooks/use-user-plan';
import PayPalPaymentButton from '@/components/paypal-payment-button';

interface Plan {
  id: number;
  nombre: string;
  precio: number;
  max_peliculas: number;
  descripcion: string;
}

const PaymentPlansSection = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { userPlan, updateUserPlan, refreshUserPlan } = useUserPlan();

  // Cargar planes desde Supabase
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('planes')
          .select('*')
          .order('precio', { ascending: true });

        if (error) {
          console.error('Error cargando planes:', error);
          return;
        }

        setPlans(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  // Obtener usuario actual
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
        } else {
          console.log('Usuario cargado:', user?.id || 'No autenticado');
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Error in getUser:', error);
        setCurrentUser(null);
      }
    };
    
    getUser();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id || 'No user');
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    if (!currentUser) {
      // Usuario no logueado - redirigir a login
      window.location.href = '/login';
      return;
    }
    
    // Usuario logueado - mostrar pago para actualización de plan
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    if (selectedPlan) {
      // Actualizar el plan del usuario
      const result = await updateUserPlan(selectedPlan.id);
      
      if (result.success) {
        setShowPayment(false);
        setSelectedPlan(null);
        alert('¡Plan actualizado exitosamente!');
        await refreshUserPlan(); // Refrescar los datos del plan
      } else {
        alert(`Error actualizando el plan: ${result.error}`);
      }
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Error en el pago:', error);
    alert(`Error procesando el pago: ${error}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-400">Cargando planes...</p>
        </div>
      </div>
    );
  }

  if (showPayment && selectedPlan && currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-white">
              {userPlan ? 'Actualizar Plan' : 'Completar Pago'}
            </h2>
            <Card className="mb-6 bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-white">
                  <span>
                    {userPlan 
                      ? `Cambiar de ${userPlan.nombre} a ${selectedPlan.nombre}` 
                      : selectedPlan.nombre
                    }
                  </span>
                  <Badge variant="secondary">${selectedPlan.precio}/mes</Badge>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {selectedPlan.descripcion} - Hasta {selectedPlan.max_peliculas} películas
                  {userPlan && (
                    <div className="mt-2 p-2 bg-blue-900/20 border border-blue-500/30 rounded text-blue-400 text-sm">
                      💡 Tu plan se actualizará inmediatamente y las reproducciones se reiniciarán
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Solo PayPal - Diseño centrado */}
          <div className="max-w-md mx-auto">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="text-center">
                <CardTitle className="text-white flex items-center justify-center gap-2">
                  <span>💳</span>
                  Pagar con PayPal
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Pago seguro y rápido con PayPal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">
                      ${selectedPlan.precio}<span className="text-sm text-gray-400">/mes</span>
                    </p>
                  </div>
                  
                  {currentUser ? (
                    <PayPalPaymentButton
                      amount={selectedPlan.precio}
                      planId={selectedPlan.id}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  ) : (
                    <div className="text-center">
                      <p className="text-red-400 mb-4">Debes iniciar sesión para continuar</p>
                      <Button
                        onClick={() => window.location.href = '/login'}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Iniciar Sesión
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowPayment(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Volver a Planes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Elige tu Plan</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Selecciona el plan que mejor se adapte a tus necesidades de entretenimiento
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan, index) => (
          <Card 
            key={plan.id} 
            className={`relative bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:scale-105 ${
              userPlan && userPlan.id === plan.id ? 'ring-2 ring-green-500' : ''
            }`}
          >
            {/* Badge para plan actual */}
            {userPlan && userPlan.id === plan.id && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-600 text-white px-4 py-1">
                  <Crown className="h-3 w-3 mr-1" />
                  Plan Actual
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">{plan.nombre}</CardTitle>
              <CardDescription className="text-gray-400">
                {plan.descripcion}
              </CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold text-red-500">
                  ${plan.precio}
                  <span className="text-lg text-gray-400 font-normal">/mes</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-grow">
              <ul className="space-y-3">
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Hasta {plan.max_peliculas} películas
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Calidad HD
                </li>
                <li className="flex items-center text-gray-300">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  Acceso completo al catálogo
                </li>
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                onClick={() => handleSelectPlan(plan)}
                disabled={!!(userPlan && userPlan.id === plan.id)}
                className={`w-full ${
                  userPlan && userPlan.id === plan.id
                    ? 'bg-green-600 hover:bg-green-600 text-white cursor-default'
                    : index === 1 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                } transition-colors`}
              >
                {!currentUser 
                  ? 'Inicia Sesión para Continuar'
                  : userPlan && userPlan.id === plan.id 
                    ? 'Plan Actual'
                    : 'Actualizar Plan'
                }
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {!currentUser && (
        <div className="text-center mt-8">
          <p className="text-gray-400 mb-4">¿No tienes cuenta?</p>
          <Button 
            variant="outline" 
            className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
            onClick={() => window.location.href = '/registro'}
          >
            Registrarse Gratis
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaymentPlansSection;
