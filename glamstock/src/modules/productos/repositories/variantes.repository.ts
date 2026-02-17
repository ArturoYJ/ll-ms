import { db } from '@/lib/db/client';
import {
  Variante,
  CreateVarianteInput,
  UpdateVarianteInput,
} from '../types/variantes.types';
import { ConflictError, NotFoundError } from '@/lib/errors/app-error';

export class VariantesRepository {

   // Crea una variante para un producto maestro existente.
   // Valida que el producto maestro exista y que el código de barras sea único.
  static async create(idProductoMaestro: number, data: CreateVarianteInput): Promise<Variante> {
    // Validar que el producto maestro existe
    const productoQuery = `SELECT id_producto_maestro FROM productos_maestros WHERE id_producto_maestro = $1;`;
    const { rows: productoRows } = await db.query(productoQuery, [idProductoMaestro]);
    if (productoRows.length === 0) {
      throw new NotFoundError('Producto maestro no encontrado');
    }

    const query = `
      INSERT INTO variantes (id_producto_maestro, codigo_barras, modelo, color, precio_adquisicion, precio_venta_etiqueta)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_variante, id_producto_maestro, codigo_barras, modelo, color, 
                precio_adquisicion, precio_venta_etiqueta, etiqueta_generada, created_at;
    `;
    try {
      const { rows } = await db.query(query, [
        idProductoMaestro,
        data.codigo_barras,
        data.modelo ?? null,
        data.color ?? null,
        data.precio_adquisicion,
        data.precio_venta_etiqueta,
      ]);
      return rows[0];
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as { code: string }).code === '23505') {
        throw new ConflictError('Ya existe una variante con este código de barras');
      }
      throw error;
    }
  }

  static async findById(id: number): Promise<Variante | null> {
    const query = `
      SELECT id_variante, id_producto_maestro, codigo_barras, modelo, color,
             precio_adquisicion, precio_venta_etiqueta, etiqueta_generada, created_at
      FROM variantes
      WHERE id_variante = $1;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

   // Lista todas las variantes de un producto maestro.
  static async findByProductoMaestro(idProductoMaestro: number): Promise<Variante[]> {
    const query = `
      SELECT id_variante, id_producto_maestro, codigo_barras, modelo, color,
             precio_adquisicion, precio_venta_etiqueta, etiqueta_generada, created_at
      FROM variantes
      WHERE id_producto_maestro = $1
      ORDER BY id_variante;
    `;
    const { rows } = await db.query(query, [idProductoMaestro]);
    return rows;
  }

   // Actualiza precios, modelo, color y/o código de barras de una variante.
   // Valida código de barras duplicado.
  static async update(id: number, data: UpdateVarianteInput): Promise<Variante> {
    const campos: string[] = [];
    const valores: unknown[] = [];
    let paramIndex = 1;

    if (data.codigo_barras !== undefined) {
      campos.push(`codigo_barras = $${paramIndex++}`);
      valores.push(data.codigo_barras);
    }
    if (data.modelo !== undefined) {
      campos.push(`modelo = $${paramIndex++}`);
      valores.push(data.modelo);
    }
    if (data.color !== undefined) {
      campos.push(`color = $${paramIndex++}`);
      valores.push(data.color);
    }
    if (data.precio_adquisicion !== undefined) {
      campos.push(`precio_adquisicion = $${paramIndex++}`);
      valores.push(data.precio_adquisicion);
    }
    if (data.precio_venta_etiqueta !== undefined) {
      campos.push(`precio_venta_etiqueta = $${paramIndex++}`);
      valores.push(data.precio_venta_etiqueta);
    }

    if (campos.length === 0) {
      throw new Error('No se proporcionaron campos para actualizar');
    }

    valores.push(id);
    const query = `
      UPDATE variantes
      SET ${campos.join(', ')}
      WHERE id_variante = $${paramIndex}
      RETURNING id_variante, id_producto_maestro, codigo_barras, modelo, color,
                precio_adquisicion, precio_venta_etiqueta, etiqueta_generada, created_at;
    `;

    try {
      const { rows } = await db.query(query, valores);
      if (rows.length === 0) {
        throw new NotFoundError('Variante no encontrada');
      }
      return rows[0];
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as { code: string }).code === '23505') {
        throw new ConflictError('Ya existe una variante con este código de barras');
      }
      throw error;
    }
  }

   // Elimina una variante verificando que no tenga inventario asociado.
  static async delete(id: number): Promise<void> {
    // Verificar que la variante exista
    const existeQuery = `SELECT id_variante FROM variantes WHERE id_variante = $1;`;
    const { rows: varianteRows } = await db.query(existeQuery, [id]);
    if (varianteRows.length === 0) {
      throw new NotFoundError('Variante no encontrada');
    }

    // Verificar que no tenga inventario asociado
    const inventarioQuery = `
      SELECT id_inventario FROM inventario_sucursal 
      WHERE id_variante = $1 
      LIMIT 1;
    `;
    const { rows: inventarioRows } = await db.query(inventarioQuery, [id]);
    if (inventarioRows.length > 0) {
      throw new ConflictError('No se puede eliminar: la variante tiene inventario asociado');
    }

    await db.query(`DELETE FROM variantes WHERE id_variante = $1;`, [id]);
  }
}
