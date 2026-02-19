import { NextRequest, NextResponse } from 'next/server';
import { InventarioService } from '@/modules/inventario/services/inventario.service';
import { ajustarInventarioSchema } from '@/modules/inventario/schemas/inventario.schema';
import { verifyToken } from '@/modules/auth/middleware/jwt.middleware';
import { isAppError } from '@/lib/errors/app-error';

export async function POST(req: NextRequest) {
  try {
    const payload = verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const resultado = ajustarInventarioSchema.safeParse(body);

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

    const ajuste = await InventarioService.ajustarInventario({
      ...resultado.data,
      id_usuario: payload.userId,
    });

    return NextResponse.json({ data: ajuste }, { status: 200 });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error en POST /api/inventario/ajuste:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}