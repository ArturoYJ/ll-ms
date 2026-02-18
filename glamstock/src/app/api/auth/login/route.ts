import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/modules/auth/services/auth.service';
import { loginSchema } from '@/modules/auth/schemas/auth.schema';
import { AppError, isAppError } from '@/lib/errors/app-error';

export async function POST(req: NextRequest) {
  try {
    // 1. Parsear el body JSON
    const body = await req.json();

    // 2. Validar datos de entrada con Zod
    const resultado = loginSchema.safeParse(body);

    if (!resultado.success) {
      return NextResponse.json(
        { 
          error: 'Datos de entrada inválidos',
          detalles: resultado.error.issues.map((issue) => ({
            campo: issue.path.join('.'),
            mensaje: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    // 3. Llamar al servicio de autenticación
    const { email, password } = resultado.data;
    const loginResponse = await AuthService.login(email, password);

    // 4. Configurar Cookie HttpOnly
    const response = NextResponse.json(
      { 
        user: loginResponse.usuario,
        message: 'Inicio de sesión exitoso'
      }, 
      { status: 200 }
    );

    response.cookies.set('auth_token', loginResponse.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 1, // 1 día
      path: '/',
    });

    return response;

  } catch (error) {
    // 5. Manejo de errores diferenciado
    if (isAppError(error)) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Error inesperado en POST /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
