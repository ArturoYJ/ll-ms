import { z } from 'zod';

// Principio DRY (Don't Repeat Yourself): Todo ID de base de datos es un entero positivo
export const idSchema = z.coerce
  .number({ error: 'El ID debe ser un número' })
  .int('El ID no puede tener decimales')
  .positive('El ID debe ser mayor a 0');

// Schema estándar para paginación de tablas en el Frontend
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10), 
});

// Schema para filtrar reportes por fechas
export const dateRangeSchema = z.object({
  startDate: z.coerce.date({ error: 'Fecha de inicio inválida' }),
  endDate: z.coerce.date({ error: 'Fecha de fin inválida' }),
}).refine((data) => data.endDate >= data.startDate, {
  message: "La fecha de fin no puede ser anterior a la fecha de inicio",
  path: ["endDate"], 
});