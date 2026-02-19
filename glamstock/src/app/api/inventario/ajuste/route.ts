import { NextRequest, NextResponse } from 'next/server';
import { InventarioService } from '@/modules/inventario/services/inventario.service';
import { ajusteInventarioApiSchema } from '@/modules/inventario/schemas/inventario.schema';
import { verifyToken } from '@/modules/auth/middleware/jwt.middleware';
import { isAppError } from '@/lib/errors/app-error';

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar autenticación
    const payload = verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Parsear y validar body con Zod
    const body = await req.json();
    const resultado = ajusteInventarioApiSchema.safeParse(body);

    if (!resultado.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          detalles: resultado.error.issues.map((i) => ({
            campo: i.path.join('.'),
            mensaje: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { id_variante, id_sucursal, cantidad, motivo } = resultado.data;

    // 3. Ejecutar ajuste de inventario con logging de auditoría
    const ajuste = await InventarioService.executarAjustePorCantidad({
      id_variante,
      id_sucursal,
      cantidad,
      motivo,
      id_usuario: payload.userId,
    });

    // 4. Retornar respuesta descriptiva con nuevo stock
    return NextResponse.json(
      {
        message: 'Ajuste de inventario realizado correctamente',
        stock_nuevo: ajuste.stock_nuevo,
        id_transaccion: ajuste.id_transaccion,
      },
      { status: 200 }
    );
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error en POST /api/inventario/ajuste:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}