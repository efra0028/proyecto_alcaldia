'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/app/lib/api-services'
import { apiClient } from '@/app/lib/api-client'   // ← agregar esto

export function useLogin() {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const login = async (email: string, password: string) => {
    setCargando(true)
    setError('')
    try {
      await authService.login(email, password)       // ← quitar "const result ="
      if (!apiClient.getToken()) throw new Error('Token no recibido')
      router.push('/admin')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión.')
    } finally {
      setCargando(false)
    }
  }

  return { login, cargando, error }
}

export function useRecuperar() {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [paso, setPaso] = useState<1 | 2 | 3>(1)

  const enviarEmail = async (email: string) => {
    void email
    setCargando(true)
    setError('')
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setPaso(2)
    } catch {
      setError('No se pudo enviar el correo de recuperación')
    } finally {
      setCargando(false)
    }
  }

  const verificarCodigo = async (codigo: string) => {
    setCargando(true)
    setError('')
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      if (codigo === '123456') {
        setPaso(3)
      } else {
        setError('Código inválido')
      }
    } catch {
      setError('Error al verificar el código')
    } finally {
      setCargando(false)
    }
  }

  const resetPassword = async (password: string) => {
    void password
    setCargando(true)
    setError('')
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setPaso(3)
    } catch {
      setError('No se pudo actualizar la contraseña')
    } finally {
      setCargando(false)
    }
  }

  return {
    enviarEmail,
    verificarCodigo,
    resetPassword,
    cargando,
    error,
    paso,
  }
}
