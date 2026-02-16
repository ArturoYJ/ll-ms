CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Entidades independientes 
CREATE TABLE productos_maestros (
    id_producto_maestro SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sucursales (
    id_sucursal SERIAL PRIMARY KEY,
    nombre_lugar VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE motivos_transaccion (
    id_motivo SERIAL PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('ADMIN', 'GERENTE')),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entidades dependientes
CREATE TABLE variantes (
    id_variante SERIAL PRIMARY KEY,
    id_producto_maestro INTEGER NOT NULL,
    codigo_barras VARCHAR(100) NOT NULL UNIQUE,
    modelo VARCHAR(100),
    color VARCHAR(50),
    precio_adquisicion DECIMAL(12,2) NOT NULL CHECK (precio_adquisicion >= 0),
    precio_venta_etiqueta DECIMAL(12,2) NOT NULL CHECK (precio_venta_etiqueta >= 0),
    etiqueta_generada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto_maestro) REFERENCES productos_maestros(id_producto_maestro) ON DELETE RESTRICT,
    CHECK (precio_venta_etiqueta >= precio_adquisicion)
);

-- Entidades relacionales
CREATE TABLE inventario_sucursal (
    id_inventario SERIAL PRIMARY KEY,
    id_variante INTEGER NOT NULL,
    id_sucursal INTEGER NOT NULL,
    stock_actual INTEGER NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_variante) REFERENCES variantes(id_variante) ON DELETE RESTRICT,
    FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal) ON DELETE RESTRICT,
    UNIQUE(id_variante, id_sucursal) 
);

CREATE TABLE ventas_bajas (
    id_transaccion SERIAL PRIMARY KEY,
    id_variante INTEGER NOT NULL,
    id_sucursal INTEGER NOT NULL,
    id_motivo INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_venta_final DECIMAL(12,2) NOT NULL CHECK (precio_venta_final >= 0),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_variante) REFERENCES variantes(id_variante) ON DELETE RESTRICT,
    FOREIGN KEY (id_sucursal) REFERENCES sucursales(id_sucursal) ON DELETE RESTRICT,
    FOREIGN KEY (id_motivo) REFERENCES motivos_transaccion(id_motivo) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT
);