import { apiClient } from './api-client';

export interface EstadoVerificacionDTO {
  patente: string;
  tieneSesionActiva: boolean;
  zonaId?: string;
  nombreZona?: string;
  horaInicio?: string;
  saldoRestante?: number;
}

export const crearInspectorService = (token: string | null) => ({
  verificarPatente: async (patente: string): Promise<EstadoVerificacionDTO> => {
    return await apiClient<EstadoVerificacionDTO>(`/inspeccion/verificar/${patente}`, {
      method: 'GET'
    }, token);
  },

  emitirMulta: async (patente: string, motivo: string, monto: number): Promise<void> => {
    await apiClient('/inspeccion/multar', {
      method: 'POST',
      body: JSON.stringify({ patente, motivo, monto })
    }, token);
  }
});
