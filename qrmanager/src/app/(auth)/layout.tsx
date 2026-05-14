import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acceso — QR-Manager GAMS',
  description: 'Panel de administración del sistema de verificación municipal.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}