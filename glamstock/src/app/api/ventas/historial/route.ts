import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/modules/auth/middleware/jwt.middleware';
import { VentasService } from '@/modules/ventas/services/ventas.service';
import { historialQuerySchema } from '@/modules/ventas/schemas/venta.schema';
import { isAppError } from '@/lib/errors/app-error';

// Query params (opcionales): sucursal_id, fecha_inicio, fecha_fin
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Parsear query params opcionales
    const rawParams: Record<string, string | undefined> = {
      sucursal_id: searchParams.get('sucursal_id') ?? undefined,
      fecha_inicio: searchParams.get('fecha_inicio') ?? undefined,
      fecha_fin: searchParams.get('fecha_fin') ?? undefined,
    };

    // Limpiar propiedades undefined para que Zod use defaults
    const cleanParams = Object.fromEntries(
      Object.entries(rawParams).filter(([, v]) => v !== undefined)
    );

    // 2. Validar con Zod
    const validation = historialQuerySchema.safeParse(cleanParams);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Parámetros de consulta inválidos',
          detalles: validation.error.issues.map((issue) => ({
            campo: issue.path.join('.'),
            mensaje: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { sucursal_id, fecha_inicio, fecha_fin } = validation.data;

    // 3. Obtener historial filtrado
    const historial = await VentasService.getHistorialVentas({
      id_sucursal: sucursal_id,
      fecha_inicio,
      fecha_fin,
    });

    // 4. Retornar respuesta
    return NextResponse.json(
      {
        data: historial,
        total: historial.length,
      },
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
