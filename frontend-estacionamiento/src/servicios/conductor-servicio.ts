import type { Vehiculo, SesionActiva, Multa, PerfilConductor } from '../types/conductor-interface';
import { apiClient } from './api-client';

interface PreferenciaPago {
  operacionId: number;
  preferenceId: string;
  checkoutUrl: string;
  sandboxCheckoutUrl?: string;
}

export const crearConductorService = (token: string | null) => ({
  obtenerPerfil: async (): Promise<PerfilConductor> => {
    return await apiClient<PerfilConductor>('/conductor/perfil', { method: 'GET' }, token);
  },

  obtenerVehiculos: async (): Promise<Vehiculo[]> => {
    return await apiClient<Vehiculo[]>('/conductor/vehiculos', { method: 'GET' }, token);
  },

  registrarVehiculo: async (patente: string): Promise<void> => {
    await apiClient('/conductor/vehiculos', {
      method: 'POST',
      body: JSON.stringify({ patente })
    }, token);
  },

  obtenerSesiones: async (): Promise<SesionActiva[]> => {
    return await apiClient<SesionActiva[]>('/estacionamientos/activas', { method: 'GET' }, token);
  },

  iniciarSesion: async (
    patente: string,
    zonaId: number,
    duracionEstimadaMinutos: number
  ): Promise<void> => {
    await apiClient('/estacionamientos/iniciar', {
      method: 'POST',
      body: JSON.stringify({ patente, zonaId, duracionEstimadaMinutos })
    }, token);
  },

  finalizarSesion: async (idSesion: string): Promise<void> => {
    await apiClient(`/estacionamientos/${idSesion}/finalizar`, { method: 'PUT' }, token);
  },

  cargarSaldo: async (monto: number): Promise<PreferenciaPago> => {
    return await apiClient<PreferenciaPago>('/finanzas/cargas', {
      method: 'POST',
      body: JSON.stringify({ monto })
    }, token);
  },

  obtenerMultas: async (): Promise<Multa[]> => {
    return await apiClient<Multa[]>('/finanzas/multas', { method: 'GET' }, token);
  },

  pagarMulta: async (idMulta: string): Promise<PreferenciaPago> => {
    return await apiClient<PreferenciaPago>(`/finanzas/multas/${idMulta}/pagar`, {
      method: 'POST'
    }, token);
  }
});
