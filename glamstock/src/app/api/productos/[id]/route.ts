import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/modules/auth/middleware/jwt.middleware';
import { ProductosService } from '@/modules/productos/services/productos.service';
import { AppError } from '@/lib/errors/app-error';
import { idSchema } from '@/lib/validations/common.schemas';

// Obtener detalle de producto
export const GET = withAuth(async (_req: NextRequest, _payload: unknown, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const idValidation = idSchema.safeParse(id);

    if (!idValidation.success) {
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
    }

    const producto = await ProductosService.getProductoById(idValidation.data);
    return NextResponse.json(producto);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});

// Actualizar producto
export const PUT = withAuth(async (req: NextRequest, _payload: unknown, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const idValidation = idSchema.safeParse(id);

    if (!idValidation.success) {
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
    }

    const body = await req.json();
    const producto = await ProductosService.updateProducto(idValidation.data, body);
    return NextResponse.json(producto);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});

// Eliminar producto
export const DELETE = withAuth(async (_req: NextRequest, _payload: unknown, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const idValidation = idSchema.safeParse(id);

    if (!idValidation.success) {
      return NextResponse.json({ error: 'ID de producto inválido' }, { status: 400 });
    }

    await ProductosService.deleteProducto(idValidation.data);
    return NextResponse.json({ message: 'Producto eliminado correctamente' }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
});
