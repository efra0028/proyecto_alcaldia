# Guía de Integración Frontend - Backend

## Configuración Inicial

### 1. Variables de Entorno

Asegúrate que `.env.local` tenga la URL correcta del backend:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_API_TIMEOUT=30000
```

### 2. Iniciar el Backend

```bash
cd gams-qr-backend
npm install
npm run start:dev
```

El backend estará disponible en: `http://localhost:3001`

### 3. Iniciar el Frontend

```bash
cd qrmanager
npm install
npm run dev
```

El frontend estará disponible en: `http://localhost:3000`

## Uso de Servicios de API

### Opción 1: Usar el Hook `useApi` (Recomendado para componentes)

```typescript
'use client';

import { useApi } from '@/app/lib/hooks';
import { registrosService } from '@/app/lib/api-services';

export function RegistrosList() {
  const { data, loading, error, execute } = useApi(registrosService.getAll);

  const handleFetch = async () => {
    await execute('sistema-1', 1, 10);
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleFetch}>Cargar Registros</button>
      {data?.data.map((registro) => (
        <div key={registro.id}>{registro.nombre}</div>
      ))}
    </div>
  );
}
```

### Opción 2: Usar el Hook `useAuth` (Para autenticación)

```typescript
'use client';

import { useAuth } from '@/app/lib/hooks';

export function LoginForm() {
  const { usuario, autenticado, login, logout } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const success = await login(
      formData.get('email') as string,
      formData.get('password') as string,
    );
    if (success) {
      console.log('Login exitoso');
    }
  };

  if (autenticado) {
    return (
      <div>
        <p>Bienvenido, {usuario?.nombre}</p>
        <button onClick={logout}>Cerrar Sesión</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Contraseña" required />
      <button type="submit">Iniciar Sesión</button>
    </form>
  );
}
```

### Opción 3: Usar Servicios Directamente (En server-side actions o getters)

```typescript
// app/admin/registros/page.tsx
import { registrosService } from '@/app/lib/api-services';

export default async function RegistrosPage() {
  try {
    const registros = await registrosService.getAll('sistema-1', 1, 10);
    return (
      <div>
        {registros.data.map((r) => (
          <div key={r.id}>{r.nombre}</div>
        ))}
      </div>
    );
  } catch (error) {
    return <div>Error al cargar registros</div>;
  }
}
```

## Servicios Disponibles

### `authService`

```typescript
// Login
await authService.login('user@example.com', 'password');

// Cambiar contraseña
await authService.changePassword('oldPassword', 'newPassword');

// Logout
authService.logout();
```

### `registrosService`

```typescript
// Listar registros (paginado)
await registrosService.getAll(sistemId?: string, page?: number, limit?: number);

// Obtener un registro
await registrosService.getById(id: string);

// Crear registro
await registrosService.create({
  nombre: 'Juan',
  apellidos: 'Pérez',
  numero_identificacion: '12345678',
  sistema_id: 'taxi-seguro',
  estado_id: 1,
});

// Actualizar registro
await registrosService.update(id, data);

// Suspender registro
await registrosService.suspend(id, motivo);

// Activar registro
await registrosService.activate(id);
```

### `qrCodigosService`

```typescript
// Listar QR códigos
await qrCodigosService.getAll(registroId?: string, page?: number, limit?: number);

// Obtener un QR código
await qrCodigosService.getById(id: number);

// Crear QR código
await qrCodigosService.create(registroId: string);

// Obtener por UUID
await qrCodigosService.getByUuid(uuid: string);

// Regenerar QR
await qrCodigosService.regenerate(id: number);

// Desactivar QR
await qrCodigosService.deactivate(id: number);
```

### `escaneoService`

```typescript
// Registrar un escaneo
await escaneoService.recordScan(uuid: string, metadata?: object);

// Obtener estadísticas
await escaneoService.getStats();

// Obtener escaneos recientes
await escaneoService.getRecent(limit?: number);

// Obtener escaneos de un QR específico
await escaneoService.getByQrId(qrId: number);
```

### `sistemasService`

```typescript
// Listar todos los sistemas
await sistemasService.getAll();

// Obtener un sistema
await sistemasService.getById(id: string);

// Crear sistema
await sistemasService.create(data);

// Actualizar sistema
await sistemasService.update(id: string, data);
```

### `publicacionesService`

```typescript
// Listar publicaciones (paginado)
await publicacionesService.getAll(sistemId?: string, page?: number, limit?: number);

// Obtener una publicación
await publicacionesService.getById(id: number);

// Obtener por UUID
await publicacionesService.getByUuid(uuid: string);

// Crear publicación
await publicacionesService.create({
  titulo: 'Título',
  contenido: 'Contenido',
  sistema_id: 'sistema-1',
});

// Actualizar publicación
await publicacionesService.update(id: number, data);

// Publicar
await publicacionesService.publish(id: number);

// Despublicar
await publicacionesService.unpublish(id: number);
```

### `usuariosService`

```typescript
// Listar usuarios (paginado)
await usuariosService.getAll(page?: number, limit?: number);

// Obtener un usuario
await usuariosService.getById(id: number);

// Crear usuario
await usuariosService.create({
  email: 'user@example.com',
  nombre: 'Juan',
  apellidos: 'Pérez',
  password: 'password123',
  rol_id: 1,
});

// Actualizar usuario
await usuariosService.update(id: number, data);

// Desactivar usuario
await usuariosService.deactivate(id: number);
```

### `auditoriaService`

```typescript
// Obtener auditoría (paginado)
await auditoriaService.getAll(page?: number, limit?: number);

// Obtener auditoría por usuario
await auditoriaService.getByUsuario(usuarioId: number, page?: number, limit?: number);
```

## Manejo de Errores

```typescript
try {
  const registros = await registrosService.getAll();
} catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}
```

## Autenticación

El token se guarda automáticamente en `localStorage` cuando haces login. Se envía automáticamente en todas las solicitudes posteriores en el header `Authorization: Bearer <token>`.

```typescript
// El token se mantiene automáticamente
const { token } = useAuth();

// Para obtener el token manualmente
import { apiClient } from '@/app/lib/api-client';
const token = apiClient.getToken();
```

## CORS

El backend está configurado para permitir solicitudes desde:

- **Desarrollo**: `http://localhost:3000` y `http://localhost:3001`
- **Producción**: `https://gams.gob.bo`

Si necesitas agregar más orígenes, edita [src/main.ts](../../gams-qr-backend/src/main.ts#L23).

## Solución de Problemas

### Error: "Failed to fetch from API"

1. Verifica que el backend está corriendo en `http://localhost:3001`
2. Revisa que `NEXT_PUBLIC_API_URL` en `.env.local` es correcto
3. Abre las DevTools (F12) y revisa la consola del navegador

### Error: CORS

Si obtienes errores de CORS:

1. Asegúrate que el backend tiene el origin del frontend en su whitelist
2. Revisa la configuración de CORS en `gams-qr-backend/src/main.ts`

### Error: 401 Unauthorized

El token ha expirado o no es válido. Necesitas hacer login nuevamente.

```typescript
const success = await login(email, password);
```

## Desarrollo

Para agregar un nuevo servicio:

1. Define las interfaces/tipos en `lib/api-services.ts`
2. Crea las funciones del servicio
3. Exporta el servicio
4. Úsalo en tus componentes

Ejemplo:

```typescript
// lib/api-services.ts

export interface MiDato {
  id: string;
  nombre: string;
}

export const miServicio = {
  async getAll() {
    return apiClient.get<MiDato[]>('/mi-endpoint');
  },
};
```
