import { db } from "@/lib/db/client";
import {
  ProductoMaestro,
  ProductoConVariantes,
  CreateProductoCompletoInput,
} from "../types/productos.types";
import { Variante } from "../types/variantes.types";
import { ConflictError } from "@/lib/errors/app-error";

export class ProductosService {
   // Crea un producto maestro con todas sus variantes en una sola transacción atómica.
   // Si alguna operación falla, se hace rollback completo.
  static async createProductoCompleto(data: CreateProductoCompletoInput): Promise<ProductoConVariantes> {
    const client = await db.getClient();
    try {
      await client.query("BEGIN");

      // 1. Crear producto maestro
      const sku = data.sku || ProductosService.generarSku(data.nombre);
      const productoQuery = `
        INSERT INTO productos_maestros (sku, nombre)
        VALUES ($1, $2)
        RETURNING id_producto_maestro, sku, nombre, created_at;
      `;
      const { rows: productoRows } = await client.query(productoQuery, [sku, data.nombre]);
      const producto: ProductoMaestro = productoRows[0];

      // 2. Crear cada variante asociada al producto
      const variantes: Variante[] = [];
      const varianteQuery = `
        INSERT INTO variantes (id_producto_maestro, codigo_barras, modelo, color, precio_adquisicion, precio_venta_etiqueta)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id_variante, id_producto_maestro, codigo_barras, modelo, color, 
                  precio_adquisicion, precio_venta_etiqueta, etiqueta_generada, created_at;
      `;

      for (const v of data.variantes) {
        const { rows: varianteRows } = await client.query(varianteQuery, [
          producto.id_producto_maestro,
          v.codigo_barras,
          v.modelo ?? null,
          v.color ?? null,
          v.precio_adquisicion,
          v.precio_venta_etiqueta,
        ]);
        variantes.push(varianteRows[0]);
      }

      await client.query("COMMIT");

      return { ...producto, variantes };
    } catch (error: unknown) {
      await client.query("ROLLBACK");

      // Manejo de errores específicos de PostgreSQL
      if (error instanceof Error && "code" in error) {
        const pgCode = (error as { code: string }).code;
        if (pgCode === "23505") {
          const detail =
            "detail" in error ? (error as { detail: string }).detail : "";
          if (detail.includes("sku")) {
            throw new ConflictError("Ya existe un producto con este SKU");
          }
          if (detail.includes("codigo_barras")) {
            throw new ConflictError(
              "Ya existe una variante con este código de barras",
            );
          }
          throw new ConflictError("Registro duplicado detectado");
        }
      }
      throw error;
    } finally {
      client.release();
    }
  }

   // Genera un SKU automático basado en el nombre del producto + timestamp.
   // Ejemplo: "Bolso Piel" → "BOL-1708200000000"
  static generarSku(nombre: string): string {
    const prefijo = nombre
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 3);
    const timestamp = Date.now();
    return `${prefijo}-${timestamp}`;
  }
}
