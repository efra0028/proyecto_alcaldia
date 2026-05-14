// lib/hooks/useAuth.ts
// Hook personalizado para autenticación

'use client';

import { useState, useCallback, useEffect } from 'react';
import { authService, type LoginResponse } from '../api-services';
import { apiClient } from '../api-client';

interface UseAuthState {
  usuario: LoginResponse['usuario'] | null;
  token: string | null;
  autenticado: boolean;
  cargando: boolean;
  error: Error | null;
}

interface UseAuthReturn extends UseAuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  cambiarContraseña: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

/**
 * Hook personalizado para autenticación
 * 
 * @example
 * const { usuario, autenticado, login, logout } = useAuth();
 * 
 * const handleLogin = async () => {
 *   const success = await login('user@example.com', 'password');
 *   if (success) {
 *     // Usuario autenticado
 *   }
 * };
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<UseAuthState>({
    usuario: null,
    token: null,
    autenticado: false,
    cargando: true,
    error: null,
  });

  // Cargar usuario autenticado al montar el componente
  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      setState((prev) => ({
        ...prev,
        token,
        autenticado: true,
        cargando: false,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        cargando: false,
      }));
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, cargando: true, error: null }));
      try {
        const response = await authService.login(email, password);
        setState({
          usuario: response.usuario,
          token: response.access_token,
          autenticado: true,
          cargando: false,
          error: null,
        });
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState((prev) => ({
          ...prev,
          cargando: false,
          error,
        }));
        return false;
      }
    },
    [],
  );

  const logout = useCallback(() => {
    authService.logout();
    setState({
      usuario: null,
      token: null,
      autenticado: false,
      cargando: false,
      error: null,
    });
  }, []);

  const cambiarContraseña = useCallback(
    async (oldPassword: string, newPassword: string): Promise<boolean> => {
      setState((prev) => ({ ...prev, cargando: true, error: null }));
      try {
        await authService.changePassword(oldPassword, newPassword);
        setState((prev) => ({ ...prev, cargando: false }));
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState((prev) => ({
          ...prev,
          cargando: false,
          error,
        }));
        return false;
      }
    },
    [],
  );

  return {
    ...state,
    login,
    logout,
    cambiarContraseña,
  };
}
