import { z } from 'zod';
import { idSchema } from '@/lib/validations/common.schemas';

// Esquema para dar de alta inventario o hacer ajustes
export const ajusteStockSchema = z.object({
  id_variante: idSchema,
  id_sucursal: idSchema,
  stock_actual: z.coerce.number().int().nonnegative('El stock no puede ser un número negativo'),
});

export const registrarBajaSchema = z.object({
  id_variante: idSchema,
  id_sucursal: idSchema,
  id_motivo: idSchema,
  cantidad: z.coerce.number().int().positive('La cantidad debe ser al menos 1'),
  precio_venta_final: z.coerce.number().nonnegative('El precio no puede ser negativo'),
});

export const ajustarInventarioSchema = z.object({
  id_variante: idSchema,
  id_sucursal: idSchema,
  id_motivo: idSchema,
  cantidad_nueva: z.coerce.number().int().nonnegative('La cantidad no puede ser negativa'),
});

export type AjusteStockDTO = z.infer<typeof ajusteStockSchema>;
export type RegistrarBajaDTO = z.infer<typeof registrarBajaSchema>;
export type AjustarInventarioDTO = z.infer<typeof ajustarInventarioSchema>;