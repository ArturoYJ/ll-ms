import { z } from 'zod';

// 1. Variante (El item físico)
export const varianteSchema = z.object({
  codigo_barras: z.string().min(3).max(100),
  modelo: z.string().max(100).optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  precio_adquisicion: z.coerce.number().nonnegative('El costo no puede ser negativo'),
  precio_venta_etiqueta: z.coerce.number().nonnegative('El precio no puede ser negativo'),
}).refine((data) => data.precio_venta_etiqueta >= data.precio_adquisicion, {
  message: "El precio de venta no puede ser menor al costo de adquisición",
  path: ["precio_venta_etiqueta"],
});

// 2. Producto Maestro
export const crearProductoMaestroSchema = z.object({
  sku: z.string().min(3, 'El SKU debe tener al menos 3 caracteres').max(50),
  nombre: z.string().min(2).max(150),
  // Un producto maestro puede crearse junto con sus variantes iniciales
  variantes: z.array(varianteSchema).min(1, 'Debe incluir al menos una variante (ej. el modelo base)'),
});

export type VarianteDTO = z.infer<typeof varianteSchema>;
export type CrearProductoDTO = z.infer<typeof crearProductoMaestroSchema>;

