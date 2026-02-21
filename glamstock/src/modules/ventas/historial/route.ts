import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/modules/auth/middleware/jwt.middleware';
import { VentasService } from '@/modules/ventas/services/ventas.service';
import { isAppError } from '@/lib/errors/app-error';
import { dateRangeSchema } from '@/lib/validations/common.schemas';
import { idSchema } from '@/lib/validations/common.schemas';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const rawSucursal = searchParams.get('sucursal_id');
    const rawInicio = searchParams.get('fecha_inicio');
    const rawFin = searchParams.get('fecha_fin');

    let id_sucursal: number | undefined;
    if (rawSucursal) {
      const parsed = idSchema.safeParse(rawSucursal);
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'El parámetro sucursal_id debe ser un entero positivo' },
          { status: 400 }
        );
      }
      id_sucursal = parsed.data;
    }

    let fecha_inicio: Date | undefined;
    let fecha_fin: Date | undefined;
    if (rawInicio || rawFin) {
      const parsed = dateRangeSchema.safeParse({
        startDate: rawInicio,
        endDate: rawFin,
      });
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Rango de fechas inválido', detalles: parsed.error.format() },
          { status: 400 }
        );
      }
      fecha_inicio = parsed.data.startDate;
      fecha_fin = parsed.data.endDate;
    }

    const historial = await VentasService.getHistorialVentas({
      id_sucursal,
      fecha_inicio,
      fecha_fin,
    });

    return NextResponse.json(
      { data: historial, total: historial.length },
      { status: 200 }
    );
  } catch (error) {
    if (isAppError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Error en GET /api/ventas/historial:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});