import { API_URL } from './config-api';

export interface InspectorAsignado {
  id: number;
  email: string;
  rol: 'INSPECTOR';
  inspector: {
    id: number;
    legajo: string;
    usuarioId: number;
  };
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

export const crearAdminService = (token: string | null) => ({
  asignarInspector: async (email: string): Promise<InspectorAsignado> => {
    const res = await fetch(`${API_URL}/usuarios/asignar-inspector`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ email })
    });

    return manejarRespuesta<InspectorAsignado>(res);
  }
});
