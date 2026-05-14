// app/admin/components/LoginForm.tsx
// Componente de ejemplo: Formulario de login

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/lib/hooks';

export function LoginForm() {
  const router = useRouter();
  const { login, cargando, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(formData.email, formData.password);
    if (success) {
      router.push('/admin/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full rounded border border-gray-300 p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block font-medium">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full rounded border border-gray-300 p-2"
          required
        />
      </div>

      {error && <div className="rounded bg-red-100 p-3 text-red-700">{error.message}</div>}

      <button
        type="submit"
        disabled={cargando}
        className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
