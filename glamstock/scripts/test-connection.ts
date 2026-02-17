import { Pool } from 'pg';

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Intentando conexión con PostgreSQL...');

    const result = await pool.query('SELECT NOW() AS hora_servidor, current_database() AS base_datos, current_user AS usuario');
    const { hora_servidor, base_datos, usuario } = result.rows[0];

    console.log('Conexión exitosa');
    console.log(`  Base de datos: ${base_datos}`);
    console.log(`  Usuario: ${usuario}`);
    console.log(`  Hora del servidor: ${hora_servidor}`);

    // Verificar que pgcrypto está instalado
    const pgcrypto = await pool.query("SELECT extname FROM pg_extension WHERE extname = 'pgcrypto'");
    if (pgcrypto.rows.length > 0) {
      console.log('  pgcrypto: instalado');
    } else {
      console.log('  pgcrypto: NO instalado (ejecuta 01_schema.sql primero)');
    }

  } catch (error: any) {
    console.error('Error de conexión:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
