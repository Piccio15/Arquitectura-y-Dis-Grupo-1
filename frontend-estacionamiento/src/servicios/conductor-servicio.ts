import type { Vehiculo, SesionActiva, Multa, PerfilConductor, PreferenciaPago } from '../types/conductor-interface';
import type { Coordenada } from '../types/zona-interface';
import { API_URL } from './config-api';

const headers = (token: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

const manejarRespuesta = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json();
};

export const crearConductorService = (token: string | null) => ({

  obtenerSaldo: async (): Promise<PerfilConductor> => {
    const res = await fetch(`${API_URL}/finanzas/saldo`, { headers: headers(token) });
    return manejarRespuesta<PerfilConductor>(res);
  },

  obtenerVehiculos: async (): Promise<Vehiculo[]> => {
    const res = await fetch(`${API_URL}/vehiculos`, { headers: headers(token) });
    return manejarRespuesta<Vehiculo[]>(res);
  },

  registrarVehiculo: async (patente: string): Promise<void> => {
    const res = await fetch(`${API_URL}/vehiculos`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ patente }),
    });
    return manejarRespuesta<void>(res);
  },

  eliminarVehiculo: async (patente: string): Promise<void> => {
    const res = await fetch(`${API_URL}/vehiculos/${patente}`, {
      method: 'DELETE',
      headers: headers(token),
    });
    return manejarRespuesta<void>(res);
  },

  obtenerSesiones: async (): Promise<SesionActiva[]> => {
    const res = await fetch(`${API_URL}/estacionamientos/activas`, { headers: headers(token) });
    return manejarRespuesta<SesionActiva[]>(res);
  },

  iniciarSesion: async (patente: string, ubicacion: Coordenada): Promise<SesionActiva> => {
    const res = await fetch(`${API_URL}/estacionamientos/iniciar`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ patente, ubicacion }),
    });
    return manejarRespuesta<SesionActiva>(res);
  },

  finalizarSesion: async (id: number): Promise<{ duracion_real_minutos: number; costo_cobrado: number }> => {
    const res = await fetch(`${API_URL}/estacionamientos/${id}/finalizar`, {
      method: 'PUT',
      headers: headers(token),
    });
    return manejarRespuesta<{ duracion_real_minutos: number; costo_cobrado: number }>(res);
  },

  obtenerMultas: async (): Promise<Multa[]> => {
    const res = await fetch(`${API_URL}/finanzas/multas`, { headers: headers(token) });
    return manejarRespuesta<Multa[]>(res);
  },

  pagarMulta: async (id: number): Promise<PreferenciaPago> => {
    const res = await fetch(`${API_URL}/finanzas/multas/${id}/pagar`, {
      method: 'POST',
      headers: headers(token),
    });
    return manejarRespuesta<PreferenciaPago>(res);
  },

  cargarSaldo: async (monto: number): Promise<PreferenciaPago> => {
    const res = await fetch(`${API_URL}/finanzas/cargas`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ monto }),
    });
    return manejarRespuesta<PreferenciaPago>(res);
  },
});
