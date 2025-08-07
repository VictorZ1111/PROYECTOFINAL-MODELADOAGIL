"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import PayPalPaymentButton from '@/components/paypal-payment-button';
import StripePaymentForm from '@/components/stripe-payment-form';

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
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    if (!currentUser) {
      alert('Debes iniciar sesión para seleccionar un plan');
      return;
    }
    setSelectedPlan(plan);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (transactionId: string) => {
    setShowPayment(false);
    setSelectedPlan(null);
    alert('¡Pago procesado exitosamente! Tu suscripción está activa.');
    // Redirigir al dashboard
    window.location.href = '/';
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
            <h2 className="text-3xl font-bold mb-4 text-white">Completar Pago</h2>
            <Card className="mb-6 bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-white">
                  <span>{selectedPlan.nombre}</span>
                  <Badge variant="secondary">${selectedPlan.precio}/mes</Badge>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {selectedPlan.descripcion} - Hasta {selectedPlan.max_peliculas} películas
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">PayPal</CardTitle>
                <CardDescription className="text-gray-400">Pago seguro con PayPal</CardDescription>
              </CardHeader>
              <CardContent>
                <PayPalPaymentButton
                  amount={selectedPlan.precio}
                  planId={selectedPlan.id}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Tarjeta de Crédito</CardTitle>
                <CardDescription className="text-gray-400">Pago con Stripe</CardDescription>
              </CardHeader>
              <CardContent>
                <StripePaymentForm
                  amount={selectedPlan.precio}
                  planId={selectedPlan.id}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
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
             ''
            }`}
          >
            
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
                className={`w-full ${
                  index === 1 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                } transition-colors`}
              >
                {currentUser ? 'Seleccionar Plan' : 'Inicia Sesión para Continuar'}
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
