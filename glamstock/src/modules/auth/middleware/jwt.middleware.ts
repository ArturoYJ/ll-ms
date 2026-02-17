import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '../services/auth.service';
import { JWTPayload } from '../types/auth.types';
import { AppError } from '@/lib/errors/app-error';

type AuthenticatedHandler = (
  req: NextRequest,
  payload: JWTPayload
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get('authorization');

      if (!authHeader) {
        return NextResponse.json(
          { error: 'Header Authorization es requerido' },
          { status: 401 }
        );
      }

      // Validar formato "Bearer <token>"
      if (!authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Formato de token inválido. Use: Bearer <token>' },
          { status: 401 }
        );
      }

      const token = authHeader.split(' ')[1];

      // Verificar y decodificar el JWT
      const payload = AuthService.verifyToken(token);

      // Delegar al handler con el payload ya validado
      return await handler(req, payload);
    } catch (error) {
      if (error instanceof AppError) {
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
