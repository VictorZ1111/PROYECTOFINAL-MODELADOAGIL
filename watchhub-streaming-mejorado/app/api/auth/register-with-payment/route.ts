import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente de administrador de Supabase
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Esta es la clave que necesitamos
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { userData, selectedPlan, paymentMethod, transactionId } = await request.json();

    console.log('🚀 Iniciando registro con pago:', { 
      email: userData.email, 
      plan: selectedPlan?.id || 'Sin plan',
      method: paymentMethod,
      transactionId 
    });

    // Validar datos requeridos
    if (!userData.email || !userData.password || !userData.nombre) {
      console.error('❌ Faltan datos del usuario');
      return NextResponse.json(
        { error: 'Faltan datos del usuario (email, password, nombre)' },
        { status: 400 }
      );
    }

    // 1. Crear usuario en Supabase Auth usando cliente de administrador
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirmar email en desarrollo
      user_metadata: {
        nombre: userData.nombre,
        apellido: userData.apellido
      }
    });

    if (authError) {
      console.error('❌ Error creando usuario:', authError);
      return NextResponse.json(
        { error: `Error creando cuenta: ${authError.message}` },
        { status: 400 }
      );
    }

    const userId = authData.user.id;
    console.log('✅ Usuario creado con ID:', userId);

    // 2. Crear perfil de usuario
    const perfilData: any = {
      id: userId,
      nombre: userData.nombre,
      email: userData.email,
      rol: 'usuario',
      plan_id: selectedPlan?.id || null,
      created_at: new Date().toISOString()
    };
    
    // Solo agregar nombre_usuario si existe en userData
    if (userData.nombreUsuario) {
      perfilData.nombre_usuario = userData.nombreUsuario;
    }
    
    console.log('📝 Datos del perfil a insertar:', perfilData);
    
    const { error: profileError } = await supabaseAdmin
      .from('perfiles')
      .insert([perfilData]);

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError);
      console.error('📋 Código de error:', profileError.code);
      console.error('📋 Mensaje:', profileError.message);
      console.error('📋 Detalles:', profileError.details);
      
      // Si falla el perfil, eliminar el usuario auth creado
      await supabaseAdmin.auth.admin.deleteUser(userId);
      
      return NextResponse.json(
        { error: `Error creando perfil: ${profileError.message}` },
        { status: 500 }
      );
    } else {
      console.log('✅ Perfil creado exitosamente');
    }

    // 3. Crear transacción exitosa (solo si hay plan)
    if (selectedPlan?.id) {
      const { data: transactionData, error: transactionError } = await supabaseAdmin
        .from('transacciones')
        .insert({
          usuario_id: userId,
          plan_id: selectedPlan.id,
          monto: selectedPlan.precio || 9.99,
          metodo_pago: paymentMethod,
          estado: 'completada',
          transaction_id: transactionId,
          fecha_completada: new Date().toISOString()
        })
        .select()
        .single();

      if (transactionError) {
        console.error('❌ Error creando transacción:', transactionError);
        console.error('Detalles:', JSON.stringify(transactionError, null, 2));
        // No fallar completamente, el usuario ya está creado
      } else {
        console.log('✅ Transacción creada:', transactionData.id);
      }

      // 4. Crear suscripción activa
      const fechaInicio = new Date();
      const fechaFin = new Date();
      fechaFin.setMonth(fechaFin.getMonth() + 1); // 1 mes

      const { error: subscriptionError } = await supabaseAdmin
        .from('suscripciones')
        .insert({
          usuario_id: userId,
          plan_id: selectedPlan.id,
          estado: 'activa',
          fecha_inicio: fechaInicio.toISOString(),
          fecha_fin: fechaFin.toISOString(),
          created_at: new Date().toISOString()
        });

      if (subscriptionError) {
        console.error('❌ Error creando suscripción:', subscriptionError);
        console.error('Detalles:', JSON.stringify(subscriptionError, null, 2));
        // No fallar completamente, el usuario ya está creado
      } else {
        console.log('✅ Suscripción creada exitosamente');
      }
    }

    // 5. Respuesta exitosa
    console.log('🎉 Proceso completado exitosamente');
    return NextResponse.json({
      success: true,
      userId: userId,
      transactionId: transactionId,
      message: 'Usuario registrado exitosamente'
    });

  } catch (error) {
    console.error('💥 Error en registro con pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
