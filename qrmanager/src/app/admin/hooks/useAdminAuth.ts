'use client'

import { useState, useEffect } from 'react'
import { authService } from '../../lib/api-services'
import type { AdminUser } from '../types'

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        // Obtener datos del usuario actual
        const currentUser = await authService.getCurrentUser()

        // Determinar el rol principal (SUPER_ADMIN tiene mayor prioridad)
        interface RoleObj { nombre: string }
        const roles: (string | RoleObj)[] = Array.isArray(currentUser.roles)
          ? (currentUser.roles as (string | RoleObj)[])
          : typeof currentUser.roles === 'object' && currentUser.roles
            ? (Object.values(currentUser.roles) as (string | RoleObj)[])
            : []

        const rol = roles.some((r) =>
          typeof r === 'string' ? r === 'SUPER_ADMIN' : r.nombre === 'SUPER_ADMIN'
        )
          ? 'superadmin'
          : roles.some((r) =>
              typeof r === 'string' ? r === 'ADMIN' : r.nombre === 'ADMIN'
            )
            ? 'admin'
            : 'user'

        setUser({
          id: currentUser.id,
          nombre: currentUser.nombre,
          email: currentUser.email,
          rol,
        })
      } catch (error) {
        console.error('Error verificando sesión:', error)
        // Token inválido o expirado
        authService.logout()
        setUser(null)
      } finally {
        setCargando(false)
      }
    }

    verificarSesion()
  }, [])

  const cerrarSesion = () => {
    authService.logout()
    setUser(null)
    window.location.href = '/login'
  }

  return { user, cargando, cerrarSesion }
}