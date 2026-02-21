'use client';

import { useState } from 'react';
import ActionMenu from './ActionMenu';
import styles from './SucursalCard.module.css';

export interface InventarioItem {
  id_inventario: number;
  id_variante: number;
  id_sucursal: number;
  stock_actual: number;
  sku_producto: string;
  nombre_producto: string;
  codigo_barras: string;
  modelo: string | null;
  color: string | null;
  precio_venta: number;
  valor_total: number;
}

interface SucursalCardProps {
  nombre: string;
  ubicacion: string;
  inventario: InventarioItem[];
  loading: boolean;
  onDelete: (idVariante: number) => void;
}

export default function SucursalCard({ nombre, ubicacion, inventario, loading, onDelete }: SucursalCardProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  return (
    <div className={styles.card} onClick={() => setOpenMenuId(null)}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.nombre}>{nombre}</h2>
          {ubicacion && <p className={styles.ubicacion}>{ubicacion}</p>}
        </div>
        <p className={styles.total}>
          Total productos: <strong>{loading ? '...' : inventario.length}</strong>
        </p>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <p className={styles.empty}>Cargando...</p>
        ) : inventario.length === 0 ? (
          <p className={styles.empty}>Sin productos en esta sucursal</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>SKU</th>
                <th className={styles.th}>Productos</th>
                <th className={styles.th}>Total Stock</th>
                <th className={styles.th}>Valor original</th>
                <th className={styles.th}>Valor venta</th>
                <th className={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventario.map((item) => (
                <tr key={item.id_inventario} className={styles.tr}>
                  <td className={styles.td}>{item.sku_producto}</td>
                  <td className={styles.td}>{item.nombre_producto}</td>
                  <td className={styles.td}>{item.stock_actual}</td>
                  <td className={styles.td}>—</td>
                  <td className={styles.td}>${Number(item.precio_venta).toLocaleString()}</td>
                  <td className={styles.td}>
                    <ActionMenu
                      isOpen={openMenuId === item.id_inventario}
                      onToggle={() => setOpenMenuId(openMenuId === item.id_inventario ? null : item.id_inventario)}
                      onDelete={() => { setOpenMenuId(null); onDelete(item.id_variante); }}
                      onEdit={() => setOpenMenuId(null)}
                      onDetails={() => setOpenMenuId(null)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}