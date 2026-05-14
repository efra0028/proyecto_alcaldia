# Checklist de Conexión Frontend-Backend

## ✅ Archivos Creados

### Cliente API
- [x] `qrmanager/src/app/lib/api-client.ts` - Cliente HTTP reutilizable
- [x] `qrmanager/src/app/lib/api-services.ts` - Servicios por módulo
- [x] `qrmanager/src/app/lib/hooks/useApi.ts` - Hook para llamadas API
- [x] `qrmanager/src/app/lib/hooks/useAuth.ts` - Hook para autenticación
- [x] `qrmanager/src/app/lib/hooks/index.ts` - Exportaciones de hooks

### Componentes de Ejemplo
- [x] `qrmanager/src/app/admin/components/RegistrosTable.tsx` - Tabla de registros
- [x] `qrmanager/src/app/admin/components/LoginForm.tsx` - Formulario de login
- [x] `qrmanager/src/app/admin/components/CreateRegistroForm.tsx` - Crear registro

### Configuración
- [x] `qrmanager/.env.local` - Variables de entorno (actualizado)
- [x] `qrmanager/.env.local.example` - Ejemplo de variables
- [x] `gams-qr-backend/src/main.ts` - CORS configurado (actualizado)

### Documentación
- [x] `qrmanager/README.md` - Documentación del frontend
- [x] `GUIA_INTEGRACION_FRONTEND_BACKEND.md` - Guía detallada de integración

## 🚀 Pasos para Verificar la Conexión

### 1. Verificar el Backend

```bash
cd gams-qr-backend

# Instalar dependencias
npm install

# Configurar base de datos (si es necesario)
# Edita .env con tus credenciales de PostgreSQL

# Iniciar en modo desarrollo
npm run start:dev
```

**Verificación**:
- Deberías ver: `🚀 Servidor corriendo en: http://localhost:3001/api/v1`
- Accede a: http://localhost:3001/api/docs (Swagger)

### 2. Verificar el Frontend

```bash
cd qrmanager

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

**Verificación**:
- Deberías ver: `✓ Ready in Xs` en la consola
- Accede a: http://localhost:3000

### 3. Verificar Conectividad

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Verificar que la URL del API es correcta
console.log(process.env.NEXT_PUBLIC_API_URL);
// Debería mostrar: http://localhost:3001/api/v1

// Si quieres probar una llamada de prueba
fetch('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', password: 'test' })
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.error(e));
```

### 4. Probar Componentes de Ejemplo

Usa los componentes creados en tu página admin:

```typescript
// app/admin/page.tsx
import { LoginForm } from './components/LoginForm';
import { CreateRegistroForm } from './components/CreateRegistroForm';
import { RegistrosTable } from './components/RegistrosTable';

export default function AdminPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Panel de Administración</h1>
      
      <div className="mb-8">
        <LoginForm />
      </div>

      <div className="mb-8">
        <CreateRegistroForm onSuccess={() => console.log('Registro creado')} />
      </div>

      <div>
        <RegistrosTable sistemId="taxi-seguro" />
      </div>
    </div>
  );
}
```

## 🔍 Troubleshooting

### Error: "Failed to fetch"
- [ ] ¿El backend está corriendo?
- [ ] ¿La URL en `.env.local` es correcta?
- [ ] ¿El puerto 3001 no está en uso por otra aplicación?

### Error: CORS blocked
- [ ] Verifica que el origen `http://localhost:3000` está en la whitelist de CORS del backend
- [ ] Mira [gams-qr-backend/src/main.ts](gams-qr-backend/src/main.ts#L23)

### Error: 401 Unauthorized
- [ ] ¿Necesitas hacer login?
- [ ] ¿El token ha expirado?
- [ ] Prueba crear un usuario primero en el backend

### Error: 404 Not Found
- [ ] Verifica que el endpoint existe en el backend
- [ ] Revisa los controladores en `gams-qr-backend/src/modules/`
- [ ] Confirma que el prefijo es `/api/v1`

## 📊 Verificar Endpoints Disponibles

Swagger está disponible en: **http://localhost:3001/api/docs**

Endpoints principales:
- `POST /auth/login` - Autenticación
- `GET /registros` - Listar registros
- `POST /registros` - Crear registro
- `GET /qr-codigos` - Listar QR códigos
- `GET /escaneos/estadisticas` - Estadísticas de escaneos
- `GET /publicaciones` - Listar publicaciones
- `GET /usuarios` - Listar usuarios

## 📝 Próximos Pasos

### Fases de Integración

1. **Fase 1: Autenticación** ✅
   - [ ] Implementar login en panel admin
   - [ ] Guardar token en localStorage
   - [ ] Proteger rutas privadas

2. **Fase 2: Gestión de Registros** ⏳
   - [ ] Listar registros
   - [ ] Crear registros
   - [ ] Editar registros
   - [ ] Suspender/Activar registros

3. **Fase 3: QR Códigos** ⏳
   - [ ] Generar QR códigos
   - [ ] Mostrar QR en UI
   - [ ] Historial de escaneos

4. **Fase 4: Portal Público** ⏳
   - [ ] Página de escaneo de QR
   - [ ] Mostrar información del registro
   - [ ] Validar vigencia

5. **Fase 5: Publicaciones** ⏳
   - [ ] Panel de publicaciones
   - [ ] Crear/editar publicaciones
   - [ ] Mostrar en portal público

## 🔧 Configuración Avanzada

### Agregar más servicios

Para agregar un nuevo endpoint, edita `lib/api-services.ts`:

```typescript
export const miNuevoServicio = {
  async getData() {
    return apiClient.get('/mi-nuevo-endpoint');
  },
};
```

### Cambiar la URL del API en producción

Edita `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://api.gams.gob.bo/api/v1
```

### Aumentar el timeout

Edita `.env.local`:

```bash
NEXT_PUBLIC_API_TIMEOUT=60000  # 60 segundos
```

## 📚 Documentación de Referencia

- [Guía de Integración Detallada](GUIA_INTEGRACION_FRONTEND_BACKEND.md)
- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [API Swagger](http://localhost:3001/api/docs)

## 💡 Tips

- **Usa React DevTools** para inspeccionar estado de componentes
- **Usa Network Tab** en DevTools para inspeccionar peticiones HTTP
- **Usa Console** para debugging con `console.log()` y errores
- **Lee los logs** del backend para ver qué está pasando

## ✅ Verificación Final

```bash
# 1. Backend corriendo
curl http://localhost:3001/api/v1/auth/login

# 2. Frontend accesible
curl http://localhost:3000

# 3. CORS funcionando
# (Lo sabes si puedes hacer peticiones desde el navegador sin errores CORS)
```

¡La conexión está lista! 🎉
