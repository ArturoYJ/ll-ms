import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../services/auth.service';
import { JWTPayload } from '../types/auth.types';
import { isAppError } from '@/lib/errors/app-error';

type AuthenticatedHandler<T = unknown> = (
  req: NextRequest,
  payload: JWTPayload,
  context: T
) => Promise<NextResponse>;

export function withAuth<T = unknown>(handler: AuthenticatedHandler<T>) {
  return async (req: NextRequest, context: T): Promise<NextResponse> => {
     try {
      // Cambio Fase 2: Leer token desde Cookie HttpOnly
      const token = req.cookies.get('auth_token')?.value;

      if (!token) {
        return NextResponse.json(
          { error: 'No autorizado. Token no encontrado.' },
          { status: 401 }
        );
      }

      // Verificar y decodificar el JWT
      const payload = AuthService.verifyToken(token);

      // Delegar al handler con el payload ya validado
      return await handler(req, payload, context);
    } catch (error) {
      if (isAppError(error)) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  };
}

export function verifyToken(req: NextRequest): JWTPayload | null {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return null;
  }

  try {
    return AuthService.verifyToken(token);
  } catch (_error) {
    return null;
  }
}