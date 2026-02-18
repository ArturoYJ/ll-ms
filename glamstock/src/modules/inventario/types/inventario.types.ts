export interface InventarioSucursal {
  id_inventario: number;
  id_variante: number;
  id_sucursal: number;
  stock_actual: number;
  updated_at: Date;
}

export interface InventarioDetallado extends InventarioSucursal {
  sku_producto: string;
  nombre_producto: string;
  codigo_barras: string;
  modelo: string | null;
  color: string | null;
  precio_venta: number;
}

export interface CreateInventarioInput {
  id_variante: number;
  id_sucursal: number;
  stock_actual: number;
}
