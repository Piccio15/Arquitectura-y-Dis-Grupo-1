import { API_URL } from './config-api';

export interface EstadoVerificacionDTO {
  patente: string;
  tieneSesionActiva: boolean;
  zonaId?: number;
  nombreZona?: string;
  horaInicio?: string;
}

export type EstadoMulta = 'PENDIENTE' | 'PAGADA' | 'ANULADA';

export interface MultaInspector {
  id_multa: number;
  fecha: string;
  ubicacion: string;
  monto: number;
  estado: EstadoMulta;
  patente: string;
  inspector: {
    id: number;
    legajo: string;
  };
}

export interface DetalleMultaInspector extends MultaInspector {
  inspector: {
    id: number;
    legajo: string;
    usuario: {
      email: string;
      dni: string;
    };
  };
  vehiculo: {
    patente: string;
    conductores: Array<{
      conductor: {
        id: number;
        saldo: number;
        usuario: {
          email: string;
          dni: string;
        };
      };
    }>;
  };
  operacionpago: Array<{
    id: number;
    tipo: string;
    estado: string;
    monto: number;
    fecha_creacion: string;
    fecha_actualizacion: string;
    mercadoPagoPaymentId: string | null;
  }>;
}

export interface ResultadoMultasInspector {
  items: MultaInspector[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

export interface FiltrosMultasInspector {
  q?: string;
  estado?: EstadoMulta | '';
  fechaDesde?: string;
  fechaHasta?: string;
  pagina?: number;
  limite?: number;
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
  listarMultas: async (filtros: FiltrosMultasInspector = {}): Promise<ResultadoMultasInspector> => {
    const params = new URLSearchParams();

    if (filtros.q?.trim()) params.set('q', filtros.q.trim());
    if (filtros.estado) params.set('estado', filtros.estado);
    if (filtros.fechaDesde) params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.set('fechaHasta', filtros.fechaHasta);
    if (filtros.pagina) params.set('pagina', String(filtros.pagina));
    if (filtros.limite) params.set('limite', String(filtros.limite));

    const query = params.toString();
    const res = await fetch(`${API_URL}/inspectores/multas${query ? `?${query}` : ''}`, {
      headers: headers(token)
    });

    return manejarRespuesta<ResultadoMultasInspector>(res);
  },

  obtenerDetalleMulta: async (id: number): Promise<DetalleMultaInspector> => {
    const res = await fetch(`${API_URL}/inspectores/multas/${id}`, {
      headers: headers(token)
    });

    return manejarRespuesta<DetalleMultaInspector>(res);
  },

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
