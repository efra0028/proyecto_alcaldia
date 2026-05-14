// app/admin/components/RegistrosTable.tsx
// Componente de ejemplo: Tabla de registros con integración al backend

'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/app/lib/hooks';
import { registrosService, type PaginatedResponse, type RegistroResponse } from '@/app/lib/api-services';

interface RegistrosTableProps {
  sistemId?: string;
}

export function RegistrosTable({ sistemId }: RegistrosTableProps) {
  const [page, setPage] = useState(1);
  const [registros, setRegistros] = useState<RegistroResponse[]>([]);
  const { data, loading, error, execute } = useApi(registrosService.getAll);

  // Cargar registros cuando cambia la página o el sistema
  useEffect(() => {
    handleLoadRegistros();
  }, [page, sistemId]);

  const handleLoadRegistros = async () => {
    const result = await execute(sistemId, page, 10);
    if (result && 'data' in result) {
      setRegistros((result as PaginatedResponse<RegistroResponse>).data);
    }
  };

  if (loading && registros.length === 0) {
    return <div className="p-4 text-center">Cargando registros...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-2 text-left">ID</th>
            <th className="border border-gray-300 p-2 text-left">Nombre</th>
            <th className="border border-gray-300 p-2 text-left">Apellidos</th>
            <th className="border border-gray-300 p-2 text-left">Cédula</th>
            <th className="border border-gray-300 p-2 text-left">Creado</th>
            <th className="border border-gray-300 p-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((registro) => (
            <tr key={registro.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2 font-mono text-sm">
                {registro.id.substring(0, 8)}...
              </td>
              <td className="border border-gray-300 p-2">{registro.nombre}</td>
              <td className="border border-gray-300 p-2">{registro.apellidos}</td>
              <td className="border border-gray-300 p-2">{registro.numero_identificacion}</td>
              <td className="border border-gray-300 p-2 text-sm">
                {new Date(registro.creado_en).toLocaleDateString()}
              </td>
              <td className="border border-gray-300 p-2 text-center">
                <button className="mx-1 rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
                  Ver
                </button>
                <button className="mx-1 rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600">
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded bg-gray-300 px-4 py-2 disabled:opacity-50"
        >
          Anterior
        </button>
        <span>Página {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="rounded bg-gray-300 px-4 py-2"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
