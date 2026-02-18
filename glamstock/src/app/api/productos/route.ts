import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/modules/auth/middleware/jwt.middleware';
import { ProductosService } from '@/modules/productos/services/productos.service';
import { AppError } from '@/lib/errors/app-error';
import { paginationSchema } from '@/lib/validations/common.schemas';

// Listar productos paginados
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parsear y validar query params
    const validation = paginationSchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Parámetros de paginación inválidos', detalles: validation.error.format() },
        { status: 400 }
      );
    }

    const { page, limit } = validation.data;
    const resultado = await ProductosService.getAllProductos(page, limit);

    return NextResponse.json(resultado);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});

// Crear producto completo
export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const producto = await ProductosService.createProductoCompleto(body);
    return NextResponse.json(producto, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
