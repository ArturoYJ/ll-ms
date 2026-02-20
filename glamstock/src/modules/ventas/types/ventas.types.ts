export interface Venta {
  id_transaccion: number;
  id_variante: number;
  id_sucursal: number;
  id_motivo: number;
  id_usuario: number;
  cantidad: number;
  precio_venta_final: string;
  fecha_hora: Date;
}

export interface VentaDetallada extends Venta {
  nombre_producto: string;
  sku: string;
  modelo: string;
  color: string;
  nombre_sucursal: string;
  motivo: string;
  nombre_usuario: string;
  precio_adquisicion: string;
  utilidad: string;
}

export interface CreateVentaInput {
  id_variante: number;
  id_sucursal: number;
  id_motivo: number;
  id_usuario: number;
  cantidad: number;
  precio_venta_final: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface TotalVentas {
  total_ventas: number;
  ingresos_totales: string;
  utilidad_total: string;
}