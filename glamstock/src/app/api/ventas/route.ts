import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/modules/auth/middleware/jwt.middleware';
import { VentasService } from '@/modules/ventas/services/ventas.service';
import { registrarVentaSchema } from '@/modules/ventas/schemas/venta.schema';
import { isAppError } from '@/lib/errors/app-error';
import { JWTPayload } from '@/modules/auth/types/auth.types';

// Extrae id_usuario del token y valida el body con Zod.
export const POST = withAuth(async (req: NextRequest, payload: JWTPayload) => {
  try {
    // 1. Parsear body
    const body = await req.json();

    // 2. Validar con Zod
    const validation = registrarVentaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos de venta inválidos',
          detalles: validation.error.issues.map((issue) => ({
            campo: issue.path.join('.'),
            mensaje: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    // 3. Registrar venta con id_usuario extraído del JWT
    const resultado = await VentasService.registrarVenta({
      ...validation.data,
      id_usuario: payload.userId,
    });

    // 4. Retornar respuesta exitosa
    return NextResponse.json(
      {
        message: 'Venta registrada exitosamente',
        data: resultado,
      },
      { status: 201 }
    );
  } catch (error) {
    // Capturar errores de negocio (stock insuficiente, not found, etc.)
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error en POST /api/ventas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
