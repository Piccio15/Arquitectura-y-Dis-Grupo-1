export interface HorarioCobro {
  hora_inicio_cobro: string;
  hora_fin_cobro: string;
  cobro_activo?: boolean;
}

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

export const crearConfiguracionService = (token: string | null) => ({
  obtenerHorarioCobro: async (): Promise<HorarioCobro> => {
    const res = await fetch(`${API_URL}/configuracion/horario-cobro`, {
      headers: headers(token)
    });
    return manejarRespuesta<HorarioCobro>(res);
  },

  actualizarHorarioCobro: async (datos: HorarioCobro): Promise<HorarioCobro> => {
    const res = await fetch(`${API_URL}/configuracion/horario-cobro`, {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify({
        hora_inicio_cobro: datos.hora_inicio_cobro,
        hora_fin_cobro: datos.hora_fin_cobro
      })
    });
    const json = await manejarRespuesta<{ horario: HorarioCobro }>(res);
    return json.horario;
  }
});
