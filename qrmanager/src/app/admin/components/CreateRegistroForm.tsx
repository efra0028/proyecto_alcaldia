// app/admin/components/CreateRegistroForm.tsx
// Componente de ejemplo: Formulario para crear nuevo registro

'use client';

import { useState } from 'react';
import { registrosService, sistemasService } from '@/app/lib/api-services';
import { useApi } from '@/app/lib/hooks';

interface CreateRegistroFormProps {
  onSuccess?: () => void;
}

export function CreateRegistroForm({ onSuccess }: CreateRegistroFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    numero_identificacion: '',
    sistema_id: '',
    estado_id: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cargar sistemas disponibles
  const { data: sistemas } = useApi(sistemasService.getAll);
  const sistemasArray = Array.isArray(sistemas) ? sistemas : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await registrosService.create({
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        numero_identificacion: formData.numero_identificacion,
        sistema_id: formData.sistema_id,
        estado_id: formData.estado_id,
      });

      setSuccess(true);
      setFormData({
        nombre: '',
        apellidos: '',
        numero_identificacion: '',
        sistema_id: '',
        estado_id: 1,
      });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded border border-gray-300 p-4">
      <h2 className="text-lg font-bold">Crear Nuevo Registro</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="block font-medium">
            Nombre *
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="apellidos" className="block font-medium">
            Apellidos *
          </label>
          <input
            id="apellidos"
            name="apellidos"
            type="text"
            value={formData.apellidos}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="numero_identificacion" className="block font-medium">
            Número de Identificación *
          </label>
          <input
            id="numero_identificacion"
            name="numero_identificacion"
            type="text"
            value={formData.numero_identificacion}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="sistema_id" className="block font-medium">
            Sistema *
          </label>
          <select
            id="sistema_id"
            name="sistema_id"
            value={formData.sistema_id}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 p-2"
            required
          >
            <option value="">Selecciona un sistema</option>
            {sistemasArray.map((sistema) => (
              <option key={sistema.id} value={sistema.id}>
                {sistema.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="rounded bg-red-100 p-3 text-red-700">{error}</div>}
      {success && <div className="rounded bg-green-100 p-3 text-green-700">Registro creado exitosamente</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Creando...' : 'Crear Registro'}
      </button>
    </form>
  );
}
