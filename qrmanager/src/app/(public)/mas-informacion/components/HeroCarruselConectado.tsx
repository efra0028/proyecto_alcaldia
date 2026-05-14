// src/app/(public)/mas-informacion/components/HeroCarruselConectado.tsx
'use client'

import { usePublicacionesDestacadas } from '../hooks/usePublicacionesDestacadas'
import { HeroCarrusel } from './HeroCarrusel'

export function HeroCarruselConectado() {
  const { slides, cargando, error } = usePublicacionesDestacadas()

  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Cargando publicaciones…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-red-400">
        {error}
      </div>
    )
  }

  if (!slides.length) return null

  return <HeroCarrusel slides={slides} />
}