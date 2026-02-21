import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/modules/auth/middleware/jwt.middleware';
import { VentasService } from '@/modules/ventas/services/ventas.service';
import { isAppError } from '@/lib/errors/app-error';

export const POST = withAuth(async (req: NextRequest, payload) => {
  try {
    const body = await req.json();

    const resultado = await VentasService.registrarVenta({
      ...body,
      id_usuario: payload.userId,
    });

    return NextResponse.json(
      {
        message: 'Venta registrada correctamente',
        id_transaccion: resultado.id_transaccion,
        stock_restante: resultado.stock_restante,
      },
      { status: 201 }
    );
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error en POST /api/ventas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});