import { z } from 'zod';
import { idSchema } from '@/lib/validations/common.schemas';

export const registrarVentaSchema = z.object({
  id_variante: idSchema,
  id_sucursal: idSchema,
  id_motivo: idSchema,
  // Asumimos que el id_usuario lo sacaremos del JWT desde el Backend
  cantidad: z.coerce.number().int().positive('La cantidad de venta debe ser al menos 1'),
  precio_venta_final: z.coerce.number().nonnegative('El precio final no puede ser negativo'),
});

// Si en una transacción venden varios productos (carrito), sería un array:
export const transaccionVentaSchema = z.object({
  ventas: z.array(registrarVentaSchema).min(1, 'El carrito no puede estar vacío'),
});

export type RegistrarVentaDTO = z.infer<typeof registrarVentaSchema>;
export type TransaccionVentaDTO = z.infer<typeof transaccionVentaSchema>;

// Schema para validar query params opcionales de GET /api/ventas/historial.
// Todos los campos son opcionales: sin filtros retorna todo el historial.
export const historialQuerySchema = z.object({
  sucursal_id: z.coerce
    .number({ error: 'sucursal_id debe ser un número' })
    .int('sucursal_id debe ser un entero')
    .positive('sucursal_id debe ser mayor a 0')
    .optional(),
  fecha_inicio: z.coerce.date({ error: 'Fecha de inicio inválida' }).optional(),
  fecha_fin: z.coerce.date({ error: 'Fecha de fin inválida' }).optional(),
}).refine(
  (data) => {
    if (data.fecha_inicio && !data.fecha_fin) return false;
    if (!data.fecha_inicio && data.fecha_fin) return false;
    return true;
  },
  { message: 'Debe proporcionar ambas fechas (fecha_inicio y fecha_fin) o ninguna', path: ['fecha_fin'] }
).refine(
  (data) => {
    if (data.fecha_inicio && data.fecha_fin) {
      return data.fecha_fin >= data.fecha_inicio;
    }
    return true;
  },
  { message: 'La fecha de fin no puede ser anterior a la fecha de inicio', path: ['fecha_fin'] }
);

export type HistorialQueryDTO = z.infer<typeof historialQuerySchema>;
