// lib/api-services.ts
// Servicios para consumir endpoints del backend

import { apiClient } from './api-client';

/**
 * ============================================
 * TIPOS / INTERFACES
 * ============================================
 */

export interface RegistroResponse {
  id: string;
  uuid: string;
  estado_id: number;
  sistema_id: string;
  referencia_externa: string;
  datos_display: Record<string, unknown>;
  fecha_inicio: string;
  fecha_vencimiento?: string | null;
  created_at?: string;
  updated_at?: string;
}
export interface CreateRegistroDto {
  sistema_id: string;
  referencia_externa: string;
  datos_display: Record<string, unknown>;
  fecha_inicio: string;
  fecha_vencimiento?: string;
  estado_id: number;
}
export interface QrCodigoRegistroResponse {
  id: string;
  sistema_id: string;
  sistema?: {
    id: string;
    nombre: string;
    descripcion?: string;
    activo?: boolean;
    color_hex: string;
    icono?: string;
  };
  referencia_externa: string;
  datos_display: Record<string, unknown>;
  fecha_inicio: string;
  fecha_vencimiento?: string | null;
  estado_id: number;
  estado?: {
    id?: number;
    nombre: string;
    color_hex?: string;
    bloquea_qr?: boolean;
  } | string;
  suspendido_por?: number;
  suspendido_en?: string;
  motivo_suspension?: string;
  created_at?: string;
  updated_at?: string;
}

export interface QrCodigoResponse {
  id: number;
  registro_id: string;
  codigo_unico: string;
  url_intermedia: string;
  imagen_qr_url: string | null;
  created_at: string;
  registro?: QrCodigoRegistroResponse;
}

export interface EscaneoResponse {
  id: number;
  qr_codigo_id: number;
  resultado: 'valido' | 'invalido' | 'vencido' | 'bloqueado';
  detalles: string;
  ubicacion: string | null;
  navegador: string | null;
  creado_en: string;
}

export interface UsuarioResponse {
  id: number;
  email: string;
  nombre: string;
  apellidos?: string;
  carnet?: string;
  is_active?: boolean;
  roles?: Array<string | { id: number; nombre: string }>;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SistemaResponse {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  color_hex?: string; 
  icono?: string;
}

export interface PublicacionResponse {
  id: string;
  titulo: string;
  contenido: Record<string, unknown>;
  adjuntos_urls: Record<string, unknown> | null;
  fecha_publicacion: string;
  fecha_vencimiento?: string | null;
  estado_id: number;
  tipo_id: number;
  destacada: boolean;
  orden_carrusel: number;
  tipo: {
    id: number;
    nombre: string;
    color_hex: string;
  };
  estado: {
    id: number;
    nombre: string;
    color_hex: string;
  };
  created_at?: string;
  update_at?: string;
}

export interface TipoPublicacionResponse {
  id: number
  nombre: string
  color_hex?: string
}

export const tiposPublicacionService = {
  async getAll(): Promise<TipoPublicacionResponse[]> {
    return apiClient.get('/tipos-publicacion')
  },
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  usuario: UsuarioResponse;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

/**
 * ============================================
 * SERVICIOS DE AUTENTICACIÓN
 * ============================================
 */

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    if ('access_token' in response) {
      apiClient.setToken(response.access_token);
    }
    return response;
  },

  async getCurrentUser(): Promise<UsuarioResponse> {
    return apiClient.get<UsuarioResponse>('/auth/me');
  },

  async changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    return apiClient.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  },

  logout() {
    apiClient.setToken(null);
  },
};

/**
 * ============================================
 * SERVICIOS DE REGISTROS
 * ============================================
 */

export const registrosService = {
  async getAll(sistemId?: string, page = 1, limit = 10) {
    const params = new URLSearchParams();
    if (sistemId) params.append('sistema_id', sistemId);
    params.append('pagina', String(page));
    params.append('limite', String(limit));

    return apiClient.get<PaginatedResponse<RegistroResponse>>(
      `/registros?${params.toString()}`,
    );
  },

  async getById(id: string): Promise<RegistroResponse> {
    return apiClient.get(`/registros/${id}`);
  },

  async create(data: CreateRegistroDto): Promise<RegistroResponse> {
    return apiClient.post('/registros', data);
  },

  async update(
    id: string,
    data: Partial<CreateRegistroDto>,
  ): Promise<RegistroResponse> {
    return apiClient.put(`/registros/${id}`, data);
  },

  async suspend(id: string, motivo: string): Promise<RegistroResponse> {
    return apiClient.patch(`/registros/${id}/suspender`, { motivo });
  },

  async activate(id: string): Promise<RegistroResponse> {
    return apiClient.patch(`/registros/${id}/activar`, {});
  },
};

/**
 * ============================================
 * SERVICIOS DE QR CÓDIGOS
 * ============================================
 */

export const qrCodigosService = {
  async getAll(registroId?: string, page = 1, limit = 100) {
    const params = new URLSearchParams();
    if (registroId) params.append('registro_id', registroId);
    params.append('pagina', String(page));
    params.append('limite', String(limit));

    return apiClient.get<PaginatedResponse<QrCodigoResponse>>(
      `/qr-codigos?${params.toString()}`,
    );
  },

  async getById(id: number): Promise<QrCodigoResponse> {
    return apiClient.get(`/qr-codigos/${id}`);
  },

  async getByRegistro(registroId: string): Promise<QrCodigoResponse> {
    return apiClient.get(`/qr-codigos/registro/${registroId}`);
  },

  async generar(registroId: string): Promise<QrCodigoResponse> {
    return apiClient.post(`/qr-codigos/generar/${registroId}`, {});
  },

  async delete(id: number) {
    return apiClient.delete(`/qr-codigos/${id}`);
  },

  async regenerate(id: number): Promise<QrCodigoResponse> {
    return apiClient.post(`/qr-codigos/${id}/regenerar`, {});
  },
};

/**
 * ============================================
 * SERVICIOS DE ESCANEOS
 * ============================================
 */

export const escaneoService = {
  async recordScan(uuid: string, metadata?: Record<string, unknown>) {
    return apiClient.post('/escaneos/registrar', {
      qr_uuid: uuid,
      ...metadata,
    });
  },

  async getStats(): Promise<{
    total: number;
    validos: number;
    bloqueados: number;
    vencidos: number;
  }> {
    return apiClient.get('/escaneos/estadisticas');
  },

  async getRecent(limit = 50): Promise<EscaneoResponse[]> {
    return apiClient.get(`/escaneos/recientes?limite=${limit}`);
  },

  async getByQrId(qrId: number): Promise<EscaneoResponse[]> {
    return apiClient.get(`/escaneos/qr/${qrId}`);
  },
};

/**
 * ============================================
 * SERVICIOS DE SISTEMAS
 * ============================================
 */

export interface SistemaBackendResponse {
  id: string
  nombre: string
  descripcion: string
  color_hex: string
  logo_url: string
  api_key: string
  schema_campos: object | null
  is_active: boolean
  created_at: string
  update_at: string
  created_by: number
  updated_by: number
}

export interface CreateSistemaPayload {
  nombre: string
  descripcion?: string
  color_hex?: string
  logo_url?: string
  schema_campos?: object | null
}
export interface ToggleResponse {
  mensaje: string
  is_active: boolean
}
export interface RegenerarKeyResponse {
  api_key: string
  aviso: string
}
export const sistemasService = {
  async getAll(): Promise<SistemaBackendResponse[]> {
    return apiClient.get('/sistemas')
  },

  // ✅ Nuevo: endpoint público sin token
  async getPublicos(): Promise<Pick<SistemaBackendResponse, 'id' | 'nombre' | 'descripcion' | 'color_hex'>[]> {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/sistemas/publicos`,
      { headers: { 'Content-Type': 'application/json' } }
    )
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return res.json()
  },

  async getById(id: string): Promise<SistemaBackendResponse> {
    return apiClient.get(`/sistemas/${id}`)
  },

  async create(data: CreateSistemaPayload): Promise<SistemaBackendResponse> {
    return apiClient.post('/sistemas', data)
  },

  async update(id: string, data: Partial<CreateSistemaPayload>): Promise<SistemaBackendResponse> {
    return apiClient.put(`/sistemas/${id}`, data)
  },

  // ✅ Corregido: devuelve el sistema completo después del toggle
  async toggle(id: string): Promise<SistemaBackendResponse> {
    await apiClient.patch(`/sistemas/${id}/toggle`, {})
    return apiClient.get(`/sistemas/${id}`)
  },

  // ✅ Corregido: devuelve el sistema completo después de regenerar
  async regenerarKey(id: string): Promise<SistemaBackendResponse> {
    const { api_key } = await apiClient.patch<RegenerarKeyResponse>(`/sistemas/${id}/regenerar-key`, {})
    const sistema = await apiClient.get<SistemaBackendResponse>(`/sistemas/${id}`)
    return { ...sistema, api_key }
  },
}
/**
 * ============================================
 * SERVICIOS DE PUBLICACIONES
 * ============================================
 */

export const publicacionesService = {
  async getActivas(): Promise<PublicacionResponse[]> {
    // Llamada directa sin apiClient para no enviar token
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/publicaciones?estado=activo`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res.json() as Promise<PublicacionResponse[]>; 
  },

  async getById(id: string): Promise<PublicacionResponse> {
    // También pública — sin token
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/publicaciones/${id}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res.json();
  },

  // ---- Admin (con token via apiClient) ----
  async getAll(): Promise<PublicacionResponse[]> {
    return apiClient.get<PublicacionResponse[]>(`/publicaciones/admin/todas`);
  },

  async create(data: {
    tipo_id: number;
    titulo: string;
    contenido: Record<string, unknown>;
    adjuntos_urls?: Record<string, unknown>;
    fecha_publicacion?: string;
    fecha_vencimiento?: string;
    estado_id: number;
  }): Promise<PublicacionResponse> {
    return apiClient.post('/publicaciones', data);
  },

  async update(id: string, data: Partial<PublicacionResponse>) {
    return apiClient.put(`/publicaciones/${id}`, data);
  },

  async publish(id: string): Promise<PublicacionResponse> {
    return apiClient.patch(`/publicaciones/${id}/publicar`);
  },

  async unpublish(id: string): Promise<PublicacionResponse> {
    return apiClient.patch(`/publicaciones/${id}/despublicar`);
  },

  async remove(id: string) {
    return apiClient.delete(`/publicaciones/${id}`);
  },
};
/**
 * ============================================
 * SERVICIOS DE USUARIOS
 * ============================================
 */

const ROLE_IDS: Record<'superadmin' | 'admin' | 'operador', number> = {
  superadmin: 1,
  admin: 2,
  operador: 3,
};

export const usuariosService = {
  async getAll() {
    return apiClient.get<UsuarioResponse[]>('/usuarios');
  },

  async getById(id: number): Promise<UsuarioResponse> {
    return apiClient.get(`/usuarios/${id}`);
  },

  async create(data: {
    email: string;
    nombre: string;
    apellidos?: string;
    password: string;
    rol: 'superadmin' | 'admin' | 'operador';
  }): Promise<UsuarioResponse> {
    return apiClient.post('/usuarios', {
      email: data.email,
      nombre: data.nombre,
      password: data.password,
      rol_ids: [ROLE_IDS[data.rol]],
    });
  },

  async update(
    id: number,
    data: Partial<{
      email: string;
      nombre: string;
      password: string;
      rol: 'superadmin' | 'admin' | 'operador';
    }>,
  ) {
    const body: Record<string, unknown> = {
      nombre: data.nombre,
      email: data.email,
    };

    if (data.password) body.password = data.password;
    if (data.rol) body.rol_ids = [ROLE_IDS[data.rol]];

    return apiClient.put<UsuarioResponse>(`/usuarios/${id}`, body);
  },

  async toggle(id: number): Promise<{ mensaje: string; is_active: boolean }> {
    return apiClient.patch(`/usuarios/${id}/toggle`, {});
  },
};

/**
 * ============================================
 * SERVICIOS DE AUDITORÍA
 * ============================================
 */

export const auditoriaService = {
  async getAll(page = 1, limit = 50) {
    const params = new URLSearchParams();
    params.append('pagina', String(page));
    params.append('limite', String(limit));

    return apiClient.get(`/auditoria?${params.toString()}`);
  },

  async getByUsuario(usuarioId: number, page = 1, limit = 50) {
    const params = new URLSearchParams();
    params.append('usuario_id', String(usuarioId));
    params.append('pagina', String(page));
    params.append('limite', String(limit));

    return apiClient.get(`/auditoria?${params.toString()}`);
  },
};
/**
 * ============================================
 * SERVICIOS DE UPLOADS
 * ============================================
 */

export const uploadService = {
  async uploadImagen(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)

    // ✅ Usa apiClient.getToken() que lee 'auth_token' de localStorage
    const token = apiClient.getToken()

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/upload/imagen`,
      {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // ⚠️ NO pongas Content-Type aquí — fetch lo agrega solo con FormData
        },
        body: formData,
      },
    )
    if (!res.ok) throw new Error('Error al subir la imagen')
    const data = await res.json() as { url: string }
    return `${process.env.NEXT_PUBLIC_API_URL}${data.url}`
  },
}