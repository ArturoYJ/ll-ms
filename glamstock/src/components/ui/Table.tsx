import React from 'react';
import styles from './Table.module.css';

export interface Column<T> {
  header: string;
  key: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  headers: Column<T>[];
  data: T[];
  renderRow?: (row: T, index: number) => React.ReactNode;
  emptyMessage?: string;
}

function Table<T extends object>({
  headers,
  data,
  renderRow,
  emptyMessage = 'No hay datos disponibles',
}: TableProps<T>) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((col) => (
              <th key={col.key} className={styles.th}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className={styles.empty}>
                {emptyMessage}
              </td>
            </tr>
          ) : renderRow ? (
            data.map((row, i) => renderRow(row, i))
          ) : (
            data.map((row, i) => (
              <tr key={i} className={styles.tr}>
                {headers.map((col) => (
                  <td key={col.key} className={styles.td}>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;