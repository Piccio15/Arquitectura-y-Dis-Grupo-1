import { API_URL } from './config-api';

export interface EstadoVerificacionDTO {
  patente: string;
  tieneSesionActiva: boolean;
  zonaId?: number;
  nombreZona?: string;
  horaInicio?: string;
}

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

export const crearInspectorService = (token: string | null) => ({
  verificarPatente: async (patente: string): Promise<EstadoVerificacionDTO> => {
    const res = await fetch(`${API_URL}/inspectores/verificar/${patente.trim().toUpperCase()}`, {
      headers: headers(token)
    });
    return manejarRespuesta<EstadoVerificacionDTO>(res);
  },

  emitirMulta: async (patente: string, ubicacion: string, monto: number): Promise<void> => {
    const res = await fetch(`${API_URL}/inspectores/multas`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ patente, ubicacion, monto })
    });
    return manejarRespuesta<void>(res);
  }
});
