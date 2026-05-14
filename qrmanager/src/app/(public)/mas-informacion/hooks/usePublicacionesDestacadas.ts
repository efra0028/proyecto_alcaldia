// src/app/mas-informacion/hooks/usePublicacionesDestacadas.ts
'use client'

import { useEffect, useState } from 'react'
import { publicacionesService } from '@/app/lib/api-services'
import { adaptarPublicaciones, PublicacionDestacada } from '../types/types'

interface Estado {
  slides: PublicacionDestacada[]
  cargando: boolean
  error: string | null
}

export function usePublicacionesDestacadas(): Estado {
  const [state, setState] = useState<Estado>({
    slides: [],
    cargando: true,
    error: null,
  })

  useEffect(() => {
    let cancelado = false

    publicacionesService
      .getActivas()
      .then((publicaciones) => {
        if (cancelado) return
        const slides = adaptarPublicaciones(publicaciones)
        setState({ slides, cargando: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelado) return
        const mensaje =
          err instanceof Error ? err.message : 'Error al cargar publicaciones'
        setState({ slides: [], cargando: false, error: mensaje })
      })

    return () => {
      cancelado = true
    }
  }, [])

  return state
}