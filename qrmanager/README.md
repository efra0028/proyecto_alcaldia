# QR Manager - Frontend

Portal de verificación municipal del GAMS (Gobierno Autónomo Municipal de Sucre).

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
npm install
```

## Configuración

Crea/actualiza el archivo `.env.local` en la raíz del proyecto:

```bash
# Frontend
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_API_TIMEOUT=30000
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Build Producción

```bash
npm run build
npm start
```

## Estructura

- `src/app/` - Páginas y componentes Next.js
- `src/app/lib/` - Utilidades y servicios
  - `api-client.ts` - Cliente HTTP para el backend
  - `api-services.ts` - Servicios específicos por módulo
  - `services.ts` - Datos estáticos (servicios municipales, oficinas, etc.)
- `src/app/admin/` - Panel de administración
- `src/app/(public)/` - Páginas públicas

## Conexión con Backend

El frontend se conecta con el backend (NestJS) usando el cliente API en `lib/api-client.ts`.

### Servicios Disponibles

Todos los servicios están en `lib/api-services.ts`:

- `authService` - Autenticación y contraseña
- `registrosService` - Gestión de registros
- `qrCodigosService` - Códigos QR
- `escaneoService` - Escaneos y estadísticas
- `sistemasService` - Sistemas disponibles
- `publicacionesService` - Publicaciones
- `usuariosService` - Gestión de usuarios
- `auditoriaService` - Auditoría del sistema

### Ejemplo de Uso

```typescript
import { registrosService, authService } from '@/app/lib/api-services';

// Login
const { access_token } = await authService.login('user@example.com', 'password');

// Obtener registros
const registros = await registrosService.getAll('sistema-1', 1, 10);

// Crear registro
const nuevoRegistro = await registrosService.create({
  nombre: 'Juan',
  apellidos: 'Pérez',
  numero_identificacion: '12345678',
  sistema_id: 'taxi-seguro',
  estado_id: 1,
});
```

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BASE_URL` | URL base del frontend | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | URL base del backend | `http://localhost:3001/api/v1` |
| `NEXT_PUBLIC_API_TIMEOUT` | Timeout de requests (ms) | `30000` |

## Licencia

UNLICENSED
