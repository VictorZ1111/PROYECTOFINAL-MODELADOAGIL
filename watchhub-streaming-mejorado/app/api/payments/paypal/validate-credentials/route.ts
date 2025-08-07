import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Simular validación de credenciales de PayPal
    // En un entorno real, esto se haría con la API de PayPal
    
    // Credenciales válidas para tu cuenta sandbox
    const validCredentials = [
      { email: 'sb-buyer@business.example.com', password: '12345678' },
      { email: 'victorzambrano@hotmail.com', password: 'Victor123*' }, // Tu cuenta real
      { email: 'sb-47pxf3237946@business.example.com', password: '12345678' }, // Otra cuenta sandbox
    ];

    const isValid = validCredentials.some(
      cred => cred.email === email && cred.password === password
    );

    if (isValid) {
      return NextResponse.json({
        success: true,
        message: 'Credenciales de PayPal válidas'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Credenciales de PayPal inválidas. Verifica tu email y contraseña.'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('Error validando PayPal:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
