import type { Zona, ZonaFormData } from '../types/zona-interface';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const headers = (token?: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

export const crearZonaService = (token: string | null) => ({
  obtenerZonas: async (): Promise<Zona[]> => {
    const res = await fetch(`${API_URL}/zonas`, { headers: headers(token) });
    if (!res.ok) throw new Error('Error al obtener zonas');
    return res.json();
  },

  crearZona: async (data: ZonaFormData): Promise<Zona> => {
    const res = await fetch(`${API_URL}/zonas`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al crear zona');
    }
    const json = await res.json();
    return json.zona ?? json;
  },

  eliminarZona: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/zonas/${id}`, {
      method: 'DELETE',
      headers: headers(token),
    });
    if (!res.ok) throw new Error('Error al eliminar zona');
  },
  editarZona: async (id: number, data: ZonaFormData): Promise<Zona> => {
  const res = await fetch(`${API_URL}/zonas/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al editar zona');
  }
  const json = await res.json();
  return json.zona ?? json;
},
});

// Compatibilidad con ModuloZonas que usa ZonaService directamente
export const ZonaService = crearZonaService(null);