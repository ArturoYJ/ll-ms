'use client';

import { useState, useEffect, useCallback } from 'react';
import Table, { Column } from '@/components/ui/Table';
import SearchInput from '@/components/ui/SearchInput';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

interface Variante {
  id_variante: number;
  precio_adquisicion: number;
  precio_venta_etiqueta: number;
}

interface Producto {
  id_producto_maestro: number;
  sku: string;
  nombre: string;
  variantes: Variante[];
}

interface ProductoFila {
  id: number;
  sku: string;
  nombre: string;
  totalStock: number;
  valorOriginal: number;
  valorVenta: number;
}

const ITEMS_PER_PAGE = 20;

export default function InventarioPage() {
  const [productos, setProductos] = useState<ProductoFila[]>([]);
  const [filtered, setFiltered] = useState<ProductoFila[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/productos?page=1&limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar productos');
      const data = await res.json();

      const filas: ProductoFila[] = (data.productos || []).map((p: Producto) => ({
        id: p.id_producto_maestro,
        sku: p.sku,
        nombre: p.nombre,
        totalStock: p.variantes.length,
        valorOriginal: p.variantes.reduce((acc, v) => acc + Number(v.precio_adquisicion), 0),
        valorVenta: p.variantes.reduce((acc, v) => acc + Number(v.precio_venta_etiqueta), 0),
      }));

      setProductos(filas);
      setFiltered(filas);
    } catch {
      setError('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const handleSearch = useCallback(
    (term: string) => {
      setPage(1);
      if (!term.trim()) { setFiltered(productos); return; }
      const lower = term.toLowerCase();
      setFiltered(productos.filter((p) =>
        p.nombre.toLowerCase().includes(lower) || p.sku.toLowerCase().includes(lower)
      ));
    },
    [productos]
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/productos/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      showToast('Producto eliminado correctamente', 'success');
      fetchProductos();
    } catch {
      showToast('Error al eliminar el producto', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const headers: Column<ProductoFila>[] = [
    { header: 'SKU', key: 'sku' },
    { header: 'Productos', key: 'nombre' },
    { header: 'Total Stock', key: 'totalStock' },
    { header: 'Valor original', key: 'valorOriginal', render: (row) => `$${row.valorOriginal.toLocaleString()}` },
    { header: 'Valor venta', key: 'valorVenta', render: (row) => `$${row.valorVenta.toLocaleString()}` },
    { header: 'Sucursal', key: 'sucursal', render: () => 'General' },
    {
      header: 'Acciones',
      key: 'acciones',
      render: (row) => (
        <div className={styles.menuWrapper}>
          <button
            className={styles.menuTrigger}
            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === row.id ? null : row.id); }}
          >•••</button>
          {openMenuId === row.id && (
            <div className={styles.dropdown}>
              <button className={`${styles.dropdownItem} ${styles.dropdownDanger}`} onClick={() => { setDeleteId(row.id); setOpenMenuId(null); }}>Eliminar</button>
              <button className={styles.dropdownItem} onClick={() => setOpenMenuId(null)}>Editar</button>
              <button className={styles.dropdownItem} onClick={() => setOpenMenuId(null)}>Más info</button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div onClick={() => setOpenMenuId(null)}>
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.msg}
        </div>
      )}

      <SearchInput placeholder="Buscar productos..." onSearch={handleSearch} />

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>General</h1>
          <p className={styles.subtitle}>Total productos: {filtered.length}</p>
        </div>
        <Button onClick={() => {}}>+ Agregar producto</Button>
      </div>

      {loading ? (
        <p className={styles.loading}>Cargando...</p>
      ) : error ? (
        <p className={styles.errorText}>{error}</p>
      ) : (
        <Table headers={headers} data={paginated} emptyMessage="No se encontraron productos" />
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className={styles.pageBtn} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
        </div>
      )}

      {deleteId !== null && (
        <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Eliminar producto</h2>
            <p className={styles.modalText}>¿Estás seguro que deseas eliminar este producto? Esta acción no se puede deshacer.</p>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Button>
              <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}