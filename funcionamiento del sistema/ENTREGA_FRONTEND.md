# GAMS QR-Manager — Entrega de Backend al Frontend
> Versión 1.0 | 2026-04-28

---

## Inicio rápido

### 1. Levantar el servidor

```bash
cd gams-qr-backend
npm install
npm run start:dev
```

### 2. URLs base
| Entorno | URL |
|---|---|
| **Desarrollo** | `http://localhost:3000/api/v1` |
| **Documentación Swagger** | `http://localhost:3000/api/docs` |
| **Imágenes QR** | `http://localhost:3000/public/qr/<uuid>.png` |

### 3. Credenciales admin por defecto
| Campo | Valor |
|---|---|
| Email | `admin@gams.gob.bo` |
| Password | `Admin2024` |

> [!WARNING]
> Cambiar la contraseña en producción usando `PATCH /auth/change-password` antes del primer despliegue.

---

## Autenticación — Flujo JWT

```
POST /auth/login  →  recibe access_token  →  incluir en todas las peticiones
```

### Request de login
```json
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@gams.gob.bo",
  "password": "Admin2024"
}
```

### Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Administrador GAMS",
    "email": "admin@gams.gob.bo",
    "roles": ["SUPER_ADMIN"]
  }
}
```

### Usar el token en todas las peticiones protegidas
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!NOTE]
> El token expira en **8 horas**. Cuando expire, redirigir al usuario al login.

---

## Endpoints públicos (sin token)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/auth/login` | Iniciar sesión |
| `GET` | `/qr-codigos/scan/:codigoUnico` | **Escanear QR** |
| `GET` | `/publicaciones` | Publicaciones activas |
| `GET` | `/public/qr/:imagen.png` | Imagen PNG del QR |

---

## Formato de error estándar

Todos los errores tienen este formato consistente:

```json
{
  "statusCode": 409,
  "error": "Conflict",
  "message": "Ya existe un registro con los mismos datos únicos",
  "timestamp": "2026-04-28T12:00:00.000Z",
  "path": "/api/v1/registros"
}
```

| Código | Significado |
|---|---|
| `400` | Datos inválidos / validación fallida |
| `401` | Sin token o token expirado |
| `403` | Sin permisos (rol incorrecto) |
| `404` | Recurso no encontrado |
| `409` | Conflicto (duplicado) |
| `429` | Demasiadas peticiones (rate limiting) |
| `500` | Error del servidor |

---

## Módulos y Endpoints

### Auth

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/auth/login` | ❌ | Login — retorna JWT |
| `GET` | `/auth/me` | ✅ | Datos del usuario actual |
| `PATCH` | `/auth/change-password` | ✅ | Cambiar contraseña propia |

**PATCH /auth/change-password**
```json
{
  "current_password": "Admin2024",
  "new_password": "NuevaClave2024"
}
```

---

### Usuarios

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `GET` | `/usuarios` | SUPER_ADMIN | Listar todos |
| `GET` | `/usuarios/:id` | SUPER_ADMIN | Obtener por ID |
| `POST` | `/usuarios` | SUPER_ADMIN | Crear usuario |
| `PUT` | `/usuarios/:id` | SUPER_ADMIN | Actualizar usuario |
| `PATCH` | `/usuarios/:id/toggle` | SUPER_ADMIN | Activar/desactivar |

**POST /usuarios — body**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@gams.gob.bo",
  "password": "Contrasena123",
  "carnet": "12345678",
  "rol_ids": [1]
}
```

---

### Roles

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `GET` | `/roles` | SUPER_ADMIN | Listar roles |
| `POST` | `/roles` | SUPER_ADMIN | Crear rol |
| `PUT` | `/roles/:id` | SUPER_ADMIN | Actualizar |
| `PATCH` | `/roles/:id/toggle` | SUPER_ADMIN | Activar/desactivar |

**Roles por defecto en el sistema**
| ID | Nombre | Descripción |
|---|---|---|
| 1 | `SUPER_ADMIN` | Acceso total |
| 2 | `ADMIN` | Administrador de sistema municipal |

---

### Sistemas

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `GET` | `/sistemas` | SUPER_ADMIN, ADMIN | Listar (sin api_key) |
| `GET` | `/sistemas/:id` | SUPER_ADMIN, ADMIN | Obtener por ID |
| `POST` | `/sistemas` | SUPER_ADMIN | Crear (devuelve api_key una vez) |
| `PUT` | `/sistemas/:id` | SUPER_ADMIN | Actualizar |
| `PATCH` | `/sistemas/:id/toggle` | SUPER_ADMIN | Activar/desactivar |
| `PATCH` | `/sistemas/:id/regenerar-key` | SUPER_ADMIN | Nueva api_key |

> [!IMPORTANT]
> La `api_key` solo se muestra **una vez** al crear el sistema. Después nunca más se puede ver. Guardarla en el sistema externo inmediatamente.

**POST /sistemas — response**
```json
{
  "id": "b84ea8d3-901a-468f-98c1-6c2e0b3ef18a",
  "nombre": "Taxi Seguro",
  "api_key": "gams_5bb4e31b6e0bc15...",
  "aviso": "⚠️ Guarda esta api_key ahora. No se podrá ver de nuevo."
}
```

---

### Catálogos

#### Estados de Registro
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/estados-registro` | Listar |
| `POST` | `/estados-registro` | Crear |
| `PUT` | `/estados-registro/:id` | Actualizar |
| `PATCH` | `/estados-registro/:id/toggle` | Activar/desactivar |

**Estados por defecto**
| Nombre | bloquea_qr | Color |
|---|---|---|
| `ACTIVO` | ❌ No | `#22C55E` |
| `SUSPENDIDO` | ✅ Sí | `#EF4444` |
| `VENCIDO` | ✅ Sí | `#F59E0B` |
| `EN_REVISION` | ✅ Sí | `#3B82F6` |
| `INACTIVO` | ✅ Sí | `#6B7280` |

#### Estados de Publicación
`/estados-publicacion` — misma estructura, estados: `ACTIVA`, `INACTIVA`, `BORRADOR`, `PROGRAMADA`, `VENCIDA`

---

### Registros

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/registros` | ✅ JWT | Listar (paginado + filtrable) |
| `GET` | `/registros/:id` | ✅ JWT | Obtener por UUID |
| `POST` | `/registros` | ✅ JWT o API-KEY | Crear registro |
| `PUT` | `/registros/:id` | ✅ JWT | Actualizar |
| `PATCH` | `/registros/:id/suspender` | ✅ JWT | Suspender con motivo |
| `PATCH` | `/registros/:id/activar` | ✅ JWT | Reactivar |

**GET /registros — parámetros de query**
```
?sistema_id=<uuid>   → filtrar por sistema
?pagina=1            → página (default: 1)
?limite=20           → registros por página (default: 20, máx: 100)
```

**GET /registros — response paginado**
```json
{
  "data": [ ...registros... ],
  "total": 150,
  "pagina": 1,
  "limite": 20,
  "totalPaginas": 8
}
```

**POST /registros — body**
```json
{
  "sistema_id": "b84ea8d3-901a-468f-98c1-6c2e0b3ef18a",
  "referencia_externa": "2345-ABC",
  "datos_display": {
    "nombre": "Juan Pérez",
    "placa": "2345-ABC",
    "licencia": "B",
    "vigencia": "2026-12-31"
  },
  "fecha_inicio": "2025-01-01",
  "fecha_vencimiento": "2026-12-31",
  "estado_id": 1
}
```

**PATCH /registros/:id/suspender — body**
```json
{ "motivo": "Licencia vencida" }
```

> [!NOTE]
> Sistemas externos pueden crear registros usando `x-api-key` en el header en lugar de JWT:
> ```
> x-api-key: gams_5bb4e31b6e0bc15...
> ```

---

### QR Códigos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/qr-codigos/scan/:codigoUnico` | ❌ Público | **Escanear QR** |
| `GET` | `/qr-codigos/:id` | ✅ JWT | Obtener por ID |
| `GET` | `/qr-codigos/registro/:registroId` | ✅ JWT | QR de un registro |
| `POST` | `/qr-codigos/generar/:registroId` | ✅ JWT | Generar QR |
| `POST` | `/qr-codigos/:id/regenerar` | ✅ JWT | Regenerar QR |

**POST /qr-codigos/generar/:registroId — response**
```json
{
  "id": 5,
  "codigo_unico": "01c66ea5-09c3-486d-8b2b-4fe7bdab50b8",
  "imagen_qr_url": "http://localhost:3000/public/qr/01c66ea5-09c3-486d-8b2b-4fe7bdab50b8.png",
  "registro_id": "719f2488-d5db-41cc-b104-23490deb45cf"
}
```

**GET /qr-codigos/scan/:uuid — response (válido)**
```json
{
  "valido": true,
  "resultado": "VALIDO",
  "datos": {
    "nombre": "Juan Pérez",
    "placa": "2345-ABC",
    "licencia": "B"
  },
  "fecha_vencimiento": "2026-12-31T00:00:00.000Z",
  "sistema": "Taxi Seguro"
}
```

**GET /qr-codigos/scan/:uuid — response (bloqueado)**
```json
{
  "valido": false,
  "resultado": "BLOQUEADO",
  "datos": null
}
```

> Posibles valores de `resultado`: `VALIDO`, `VENCIDO`, `BLOQUEADO`, `NO_ENCONTRADO`

---

### Escaneos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/escaneos/estadisticas` | ✅ JWT | Total, válidos, bloqueados, vencidos |
| `GET` | `/escaneos/recientes` | ✅ JWT | Últimos N escaneos |
| `GET` | `/escaneos/qr/:qrCodigoId` | ✅ JWT | Historial de un QR |

**GET /escaneos/estadisticas — response**
```json
{
  "total": 1250,
  "validos": 980,
  "bloqueados": 180,
  "vencidos": 90
}
```

**GET /escaneos/recientes?limite=10**

---

### Publicaciones

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/publicaciones` | ❌ Público | Solo publicaciones activas |
| `GET` | `/publicaciones/:id` | ❌ Público | Ver una publicación |
| `GET` | `/publicaciones/admin/todas` | ✅ JWT | Todas (incluye borradores) |
| `POST` | `/publicaciones` | ✅ JWT | Crear |
| `PUT` | `/publicaciones/:id` | ✅ JWT | Actualizar |
| `DELETE` | `/publicaciones/:id` | ✅ JWT | Eliminar |

**POST /publicaciones — body**
```json
{
  "tipo_id": 1,
  "titulo": "Aviso importante",
  "contenido": {
    "texto": "Contenido libre en JSON",
    "imagen": "https://...",
    "enlace": "https://..."
  },
  "estado_id": 1,
  "fecha_publicacion": "2026-05-01T00:00:00.000Z",
  "fecha_vencimiento": "2026-06-01T00:00:00.000Z"
}
```

#### Tipos de Publicación
`/tipos-publicacion` — CRUD completo (requiere JWT)

---

### Auditoría

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `GET` | `/auditoria` | SUPER_ADMIN | Todos los logs |
| `GET` | `/auditoria/:tabla/:registroId` | SUPER_ADMIN | Logs de un registro |

> [!NOTE]
> La auditoría es automática — cada `POST`, `PUT`, `PATCH`, `DELETE` se registra sin ninguna acción del frontend.

---

## Resumen de seguridad para el frontend

| Regla | Detalle |
|---|---|
| **Guardar token** | En `localStorage` o `sessionStorage` |
| **Renovar token** | Redirigir al login cuando recibas `401` |
| **Rate limiting** | Máximo 100 requests/minuto por IP |
| **Scan QR** | Máximo 30 scans/minuto (anti-bot) |
| **CORS** | En dev: todos los orígenes. En prod: solo `https://gams.gob.bo` |
| **Headers seguros** | Helmet activo (X-Frame-Options, HSTS, etc.) |

---

## Checklist para el desarrollador frontend

- [ ] Configurar la URL base del API en una variable de entorno
- [ ] Implementar el flujo de login y guardar el `access_token`
- [ ] Agregar el `Authorization: Bearer <token>` en cada petición
- [ ] Manejar el error `401` redirigiendo al login
- [ ] Mostrar mensajes de error usando el campo `message` de la respuesta
- [ ] Para listados: implementar paginación usando `?pagina=N&limite=N`
- [ ] Para el escáner QR: usar `GET /qr-codigos/scan/:uuid` (no requiere auth)
- [ ] Para el panel de estadísticas: usar `GET /escaneos/estadisticas`
