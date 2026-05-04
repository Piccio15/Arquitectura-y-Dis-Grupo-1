import { apiClient } from './api-client';
import type { Zona, ZonaFormData } from '../types/zona-interface';

export const ZonaService = {
  obtenerZonas: async (): Promise<Zona[]> => {
    return await apiClient<Zona[]>('/zonas', { method: 'GET' });
  },

  crearZona: async (data: ZonaFormData): Promise<Zona> => {
    return await apiClient<Zona>('/zonas', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  actualizarZona: async (id: string, data: ZonaFormData): Promise<Zona> => {
    return await apiClient<Zona>(`/zonas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  eliminarZona: async (id: string): Promise<void> => {
    return await apiClient<void>(`/zonas/${id}`, { method: 'DELETE' });
  }
};