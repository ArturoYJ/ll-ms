'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <Link 
          href="/dashboard" 
          className={pathname === '/dashboard' ? styles.linkActive : styles.link}
        >
          Dashboard
        </Link>

        <Link 
          href="/inventario" 
          className={pathname === '/inventario' ? styles.linkActive : styles.link}
        >
          Inventario general
        </Link>

        <Link 
          href="/sucursales" 
          className={pathname === '/sucursales' ? styles.linkActive : styles.link}
        >
          Sucursales
        </Link>
      </nav>

    </aside>
  );
}