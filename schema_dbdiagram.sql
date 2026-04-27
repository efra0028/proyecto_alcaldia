-- ============================================================
-- GAMS QR-Manager — Schema SQL (generado desde DBML corregido)
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- ENUMERACIONES
-- ──────────────────────────────────────────────────────────────

-- estado_registro ya no es enum: ahora es la tabla estados_registro (ver abajo)
-- estado_publicacion ya no es enum: ahora es la tabla estados_publicacion (ver abajo)
CREATE TYPE accion_auditoria    AS ENUM ('INSERT', 'UPDATE', 'DELETE');


-- ──────────────────────────────────────────────────────────────
-- TABLA: roles
-- ──────────────────────────────────────────────────────────────

CREATE TABLE roles (
    id          SERIAL        PRIMARY KEY,
    nombre      VARCHAR(50)   NOT NULL UNIQUE,
    descripcion TEXT,
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    update_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    created_by  INTEGER       NOT NULL,
    updated_by  INTEGER       NOT NULL
);


-- ──────────────────────────────────────────────────────────────
-- TABLA: usuarios
-- ──────────────────────────────────────────────────────────────

CREATE TABLE usuarios (
    id            SERIAL        PRIMARY KEY,
    nombre        VARCHAR(150)  NOT NULL,
    carnet        VARCHAR(12)   UNIQUE,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    update_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    created_by    INTEGER       NOT NULL,
    updated_by    INTEGER       NOT NULL
);


-- ──────────────────────────────────────────────────────────────
-- TABLA: usuario_roles
-- ──────────────────────────────────────────────────────────────

CREATE TABLE usuario_roles (
    id          SERIAL    PRIMARY KEY,
    usuario_id  INT       NOT NULL REFERENCES usuarios(id),
    rol_id      INT       NOT NULL REFERENCES roles(id),
    is_active   BOOLEAN   NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    update_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by  INTEGER   NOT NULL,
    updated_by  INTEGER   NOT NULL,
    UNIQUE (usuario_id, rol_id)
);


-- ──────────────────────────────────────────────────────────────
-- TABLA: sistemas
-- ──────────────────────────────────────────────────────────────

CREATE TABLE sistemas (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre        VARCHAR(150)  NOT NULL,
    descripcion   TEXT,
    color_hex     VARCHAR(7),
    logo_url      VARCHAR(200),
    api_key       VARCHAR(100)  NOT NULL UNIQUE,
    schema_campos JSONB,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    update_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
    created_by    INTEGER       NOT NULL,
    updated_by    INTEGER       NOT NULL
);


-- ──────────────────────────────────────────────────────────────
-- TABLA: estados_registro
-- Catálogo dinámico de estados. Los admins pueden agregar nuevos
-- estados desde el frontend sin tocar el schema.
-- bloquea_qr: si TRUE, el QR de ese registro se considera inválido.
-- ──────────────────────────────────────────────────────────────

CREATE TABLE estados_registro (
    id          SERIAL        PRIMARY KEY,
    nombre      VARCHAR(50)   NOT NULL UNIQUE,   -- ej: 'ACTIVO', 'SUSPENDIDO', 'EN_REVISION'
    descripcion TEXT,
    color_hex   VARCHAR(7),                      -- color representativo en el frontend
    bloquea_qr  BOOLEAN       NOT NULL DEFAULT FALSE, -- ¿este estado invalida el QR?
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    update_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    created_by  INTEGER       NOT NULL,
    updated_by  INTEGER       NOT NULL
);


-- ──────────────────────────────────────────────────────────────
-- TABLA: registros
-- ──────────────────────────────────────────────────────────────

CREATE TABLE registros (
    id                  UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
    sistema_id          UUID                 NOT NULL REFERENCES sistemas(id),
    referencia_externa  VARCHAR(100)         NOT NULL,
    datos_display       JSONB                NOT NULL,
    fecha_inicio        DATE                 NOT NULL,
    fecha_vencimiento   DATE,                            -- NULL si no tiene tiempo de vigencia
    estado_id           INT                  NOT NULL REFERENCES estados_registro(id),
    suspendido_por      INT                  REFERENCES usuarios(id),
    suspendido_en       TIMESTAMP,
    motivo_suspension   TEXT,
    created_at          TIMESTAMP            NOT NULL DEFAULT NOW(),
    update_at           TIMESTAMP            NOT NULL DEFAULT NOW(),
    created_by          INTEGER              NOT NULL,
    updated_by          INTEGER              NOT NULL,
    UNIQUE (sistema_id, referencia_externa)
);


-- ──────────────────────────────────────────────────────────────
-- TABLA: qr_codigos
-- ──────────────────────────────────────────────────────────────
-- Relación 1-a-1 con registros.
-- codigo_unico: UUID público que va en la URL del QR (/scan/[codigo_unico]).
--              Separado de registro_id para poder regenerarlo sin afectar el vínculo interno.
-- ──────────────────────────────────────────────────────────────

CREATE TABLE qr_codigos (
    id              SERIAL        PRIMARY KEY,
    registro_id     UUID          NOT NULL UNIQUE REFERENCES registros(id),
    codigo_unico    UUID          NOT NULL UNIQUE DEFAULT gen_random_uuid(), -- identificador público del QR (/scan/[codigo_unico])
    url_intermedia  VARCHAR(500)  NOT NULL,
    imagen_qr_url   VARCHAR(500),
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
    -- total_escaneos se calcula en el backend: SELECT COUNT(*) FROM escaneos WHERE qr_codigo_id = ?
);


-- ──────────────────────────────────────────────────────────────
-- TABLA: escaneos
-- ──────────────────────────────────────────────────────────────

CREATE TABLE escaneos (
    id            SERIAL        PRIMARY KEY,
    qr_codigo_id  INT           NOT NULL REFERENCES qr_codigos(id),
    ip_address    VARCHAR(50)   NOT NULL,
    dispositivo   VARCHAR(150),
    resultado     VARCHAR(20)   NOT NULL   CHECK (resultado IN ('VALIDO', 'BLOQUEADO', 'VENCIDO', 'EXPIRADO')),
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────────
-- TABLA: auditoria
-- ──────────────────────────────────────────────────────────────

CREATE TABLE auditoria (
    id             SERIAL            PRIMARY KEY,
    tabla_nombre   VARCHAR(50)       NOT NULL,
    registro_id    TEXT              NOT NULL,   -- TEXT soporta UUID e INT como string
    accion         accion_auditoria,             -- INSERT, UPDATE, DELETE
    usuario_id     INT               REFERENCES usuarios(id),
    datos_antes    JSONB,
    datos_despues  JSONB,
    ip_address     VARCHAR(50),
    created_at     TIMESTAMP         NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- TABLA: tipos_publicacion
-- Catálogo de tipos por sistema. Cada sistema define los suyos.
-- Ej: Tránsito → "Resolución", "Aviso de multa"
--     Catastro  → "Resolución catastral", "Aviso predial"
-- ──────────────────────────────────────────────────────────────

CREATE TABLE tipos_publicacion (
    id          SERIAL        PRIMARY KEY,
    sistema_id  UUID          NOT NULL REFERENCES sistemas(id),
    nombre      VARCHAR(100)  NOT NULL,
    descripcion TEXT,
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    update_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    created_by  INTEGER       NOT NULL,
    updated_by  INTEGER       NOT NULL,
    UNIQUE (sistema_id, nombre)
);


-- ──────────────────────────────────────────────────────────────
-- TABLA: estados_publicacion
-- Catálogo dinámico de estados para publicaciones.
-- Igual que estados_registro: el admin agrega nuevos estados
-- desde el frontend sin tocar el schema.
-- ──────────────────────────────────────────────────────────────

CREATE TABLE estados_publicacion (
    id          SERIAL        PRIMARY KEY,
    nombre      VARCHAR(50)   NOT NULL UNIQUE,   -- ej: 'ACTIVA', 'BORRADOR', 'PROGRAMADA'
    descripcion TEXT,
    color_hex   VARCHAR(7),
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    update_at   TIMESTAMP     NOT NULL DEFAULT NOW(),
    created_by  INTEGER       NOT NULL,
    updated_by  INTEGER       NOT NULL
);


-- ──────────────────────────────────────────────────────────────
-- TABLA: publicaciones
-- Publicaciones informativas con vigencia por sistema.
-- El campo "contenido" es JSONB para que cada sistema defina
-- libremente su estructura (texto, links, imágenes, PDFs, etc.).
-- ──────────────────────────────────────────────────────────────

CREATE TABLE publicaciones (
    id                  UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_id             INT                  NOT NULL REFERENCES tipos_publicacion(id),
    titulo              VARCHAR(255)         NOT NULL,
    contenido           JSONB                NOT NULL,   -- estructura libre definida por el sistema
    adjuntos_urls       JSONB,                           -- array de URLs (PDFs, imágenes, etc.)
    fecha_publicacion   DATE                 NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento   DATE,                            -- NULL si no tiene caducidad
    estado_id           INT                  NOT NULL REFERENCES estados_publicacion(id),
    created_at          TIMESTAMP            NOT NULL DEFAULT NOW(),
    update_at           TIMESTAMP            NOT NULL DEFAULT NOW(),
    created_by          INTEGER              NOT NULL,
    updated_by          INTEGER              NOT NULL
);
