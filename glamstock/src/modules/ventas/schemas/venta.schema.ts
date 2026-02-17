import { z } from 'zod';
import { idSchema } from '@/lib/validations/common.schemas';

export const registrarVentaSchema = z.object({
  id_variante: idSchema,
  id_sucursal: idSchema,
  id_motivo: idSchema,
  // Asumimos que el id_usuario lo sacaremos del JWT (Backend)
  cantidad: z.coerce.number().int().positive('La cantidad de venta debe ser al menos 1'),
  precio_venta_final: z.coerce.number().nonnegative('El precio final no puede ser negativo'),
});

// Si en una transacción venden varios productos (carrito), sería un array:
export const transaccionVentaSchema = z.object({
  ventas: z.array(registrarVentaSchema).min(1, 'El carrito no puede estar vacío'),
});

export type RegistrarVentaDTO = z.infer<typeof registrarVentaSchema>;
export type TransaccionVentaDTO = z.infer<typeof transaccionVentaSchema>;
