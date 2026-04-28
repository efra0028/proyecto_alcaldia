-- Fix: usuario_roles.created_by y updated_by no tienen DEFAULT.
-- TypeORM gestiona la tabla ManyToMany y solo puede insertar usuario_id y rol_id.
-- Solución: darles DEFAULT 1 (usuario sistema) o hacerlos nullable.
ALTER TABLE usuario_roles ALTER COLUMN created_by SET DEFAULT 1;
ALTER TABLE usuario_roles ALTER COLUMN updated_by SET DEFAULT 1;
