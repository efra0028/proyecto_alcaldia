-- ============================================================
-- SEEDS — GAMS QR-Manager
-- Datos iniciales requeridos para arrancar el sistema
-- Ejecutar DESPUÉS de schema_dbdiagram.sql
-- ============================================================


-- ──────────────────────────────────────────────────────────────
-- 1. Usuario administrador inicial
--    IMPORTANTE: Cambiar el password_hash por uno generado con bcrypt
--    Puedes generarlo en: https://bcrypt-generator.com (rounds: 10)
--    Password de ejemplo: Admin123!
-- ──────────────────────────────────────────────────────────────

INSERT INTO usuarios (nombre, email, password_hash, is_active, created_by, updated_by)
VALUES (
  'Administrador GAMS',
  'admin@gams.gob.bo',
  '$2b$10$6.gBBdl5mK7YZQ8tXXlr9Ofi68Mn6Mx1wFEWbpczTs7R1r3bncm/2',  -- password: Admin2024
  true,
  1,
  1
);
-- Nota: El usuario se inserta con id=1. created_by y updated_by apuntan a sí mismo.


-- ──────────────────────────────────────────────────────────────
-- 2. Roles del sistema
-- ──────────────────────────────────────────────────────────────

INSERT INTO roles (nombre, descripcion, created_by, updated_by) VALUES
  ('SUPER_ADMIN', 'Administrador general con acceso total', 1, 1),
  ('ADMIN',       'Administrador de un sistema municipal',  1, 1);
  -- Más roles se crearán desde el panel admin según necesidad


-- ──────────────────────────────────────────────────────────────
-- 3. Asignar rol SUPER_ADMIN al usuario administrador
-- ──────────────────────────────────────────────────────────────

INSERT INTO usuario_roles (usuario_id, rol_id, is_active, created_by, updated_by)
VALUES (1, 1, true, 1, 1);


-- ──────────────────────────────────────────────────────────────
-- 4. Estados de registro
-- ──────────────────────────────────────────────────────────────

INSERT INTO estados_registro (nombre, descripcion, color_hex, bloquea_qr, created_by, updated_by) VALUES
  ('ACTIVO',      'Registro activo y válido',              '#22C55E', false, 1, 1),
  ('SUSPENDIDO',  'Registro suspendido manualmente',       '#EF4444', true,  1, 1),
  ('VENCIDO',     'Registro fuera de vigencia',            '#F59E0B', true,  1, 1),
  ('EN_REVISION', 'Registro en proceso de revisión',       '#3B82F6', true,  1, 1),
  ('INACTIVO',    'Registro dado de baja definitivamente', '#6B7280', true,  1, 1);


-- ──────────────────────────────────────────────────────────────
-- 5. Estados de publicación
-- ──────────────────────────────────────────────────────────────

INSERT INTO estados_publicacion (nombre, descripcion, color_hex, created_by, updated_by) VALUES
  ('ACTIVA',     'Publicación visible al público',       '#22C55E', 1, 1),
  ('INACTIVA',   'Publicación oculta temporalmente',     '#6B7280', 1, 1),
  ('BORRADOR',   'En preparación, no publicada aún',     '#F59E0B', 1, 1),
  ('PROGRAMADA', 'Pendiente de fecha de publicación',    '#3B82F6', 1, 1),
  ('VENCIDA',    'Publicación expirada por fecha',       '#EF4444', 1, 1);
