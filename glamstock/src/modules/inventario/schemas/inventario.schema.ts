import { z } from 'zod';
import { idSchema } from '@/lib/validations/common.schemas';

// Esquema para dar de alta inventario o hacer ajustes
export const ajusteStockSchema = z.object({
  id_variante: idSchema,
  id_sucursal: idSchema,
  stock_actual: z.coerce.number().int().nonnegative('El stock no puede ser un número negativo'),
});

export type AjusteStockDTO = z.infer<typeof ajusteStockSchema>;
