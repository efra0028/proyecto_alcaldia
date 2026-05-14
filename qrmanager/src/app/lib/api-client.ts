// lib/api-client.ts
// Cliente HTTP para comunicarse con el backend NestJS

type RequestInit = Omit<RequestOptions, 'url'>;

interface RequestOptions extends Omit<globalThis.RequestInit, 'body'> {
  url: string;
  body?: unknown;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);

class ApiClient {
  private token: string | null = null;
  private apiUrl: string = API_URL;

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }
//sincroniza desde localStorage en el cliente para mantener el token actualizado incluso si se modifica en otra pestaña
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T = unknown>(options: RequestOptions): Promise<T> {
    const { url, body, ...init } = options;
    const fullUrl = `${this.apiUrl}${url}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(fullUrl, {
        ...init,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json() as T;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  get<T = unknown>(url: string, init?: RequestInit) {
    return this.request<T>({ ...init, url, method: 'GET' });
  }

  post<T = unknown>(url: string, body?: unknown, init?: RequestInit) {
    return this.request<T>({ ...init, url, method: 'POST', body });
  }

  put<T = unknown>(url: string, body?: unknown, init?: RequestInit) {
    return this.request<T>({ ...init, url, method: 'PUT', body });
  }

  patch<T = unknown>(url: string, body?: unknown, init?: RequestInit) {
    return this.request<T>({ ...init, url, method: 'PATCH', body });
  }

  delete<T = unknown>(url: string, init?: RequestInit) {
    return this.request<T>({ ...init, url, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse };
