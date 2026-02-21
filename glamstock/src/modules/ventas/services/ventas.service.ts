import { db } from '@/lib/db/client';
import { VentasRepository } from '../repositories/ventas.repository';
import { InventarioRepository } from '@/modules/inventario/repositories/inventario.repository';
import { VentaDetallada, TotalVentas } from '../types/ventas.types';
import { ValidationError, NotFoundError } from '@/lib/errors/app-error';
import { registrarVentaSchema, RegistrarVentaDTO } from '../schemas/venta.schema';

export interface RegistrarVentaInput extends RegistrarVentaDTO {
  id_usuario: number;
}

export interface ResultadoVenta {
  id_transaccion: number;
  stock_restante: number;
}

export interface FiltrosHistorial {
  id_sucursal?: number;
  fecha_inicio?: Date;
  fecha_fin?: Date;
}

export interface UtilidadPorPeriodo {
  periodo: string;
  total_ventas: number;
  ingresos_totales: number;
  utilidad_total: number;
}