import { NextRequest, NextResponse } from 'next/server';
import { InventarioService } from '@/modules/inventario/services/inventario.service';
import { verifyToken } from '@/modules/auth/middleware/jwt.middleware';
import { isAppError } from '@/lib/errors/app-error';

export async function GET(req: NextRequest) {
  try {
    // 1. Verificar autenticación
    const payload = verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Leer y validar query param sucursal_id
    const { searchParams } = new URL(req.url);
    const rawSucursalId = searchParams.get('sucursal_id');

    if (!rawSucursalId) {
      return NextResponse.json(
        { error: 'El parámetro sucursal_id es requerido. Uso: /api/inventario?sucursal_id=1' },
        { status: 400 }
      );
    }

    const id_sucursal = Number(rawSucursalId);

    if (!Number.isInteger(id_sucursal) || id_sucursal <= 0) {
      return NextResponse.json(
        { error: `El parámetro sucursal_id debe ser un número entero positivo. Recibido: "${rawSucursalId}"` },
        { status: 400 }
      );
    }

    // 3. Obtener inventario filtrado por sucursal
    const inventario = await InventarioService.getInventarioBySucursal(id_sucursal);

    return NextResponse.json(
      {
        data: inventario,
        total: inventario.length,
        sucursal_id: id_sucursal,
      },
      { status: 200 }
    );
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error en GET /api/inventario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}