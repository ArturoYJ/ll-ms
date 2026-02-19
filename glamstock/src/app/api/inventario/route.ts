import { NextRequest, NextResponse } from 'next/server';
import { InventarioService } from '@/modules/inventario/services/inventario.service';
import { verifyToken } from '@/modules/auth/middleware/jwt.middleware';
import { isAppError } from '@/lib/errors/app-error';

export async function GET(req: NextRequest) {
  try {
    const payload = verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id_sucursal = Number(searchParams.get('id_sucursal'));

    if (!id_sucursal || id_sucursal <= 0) {
      return NextResponse.json({ error: 'El parámetro id_sucursal es requerido' }, { status: 400 });
    }

    const inventario = await InventarioService.getInventarioBySucursal(id_sucursal);
    return NextResponse.json({ data: inventario }, { status: 200 });
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error en GET /api/inventario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}