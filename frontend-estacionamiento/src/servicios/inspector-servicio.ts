import { apiClient } from './api-client';

// DTO (Data Transfer Object) que define la respuesta esperada del Back-End
export interface EstadoVerificacionDTO {
  patente: string;
  tieneSesionActiva: boolean;
  zonaId?: string;
  horaInicio?: string;
  saldoRestante?: number;
}

export const InspectorService = {
  verificarPatente: async (patente: string): Promise<EstadoVerificacionDTO> => {
    // Se delega la petición al Gateway centralizado. 
    // La URL esperada en su API REST será del tipo: GET /api/inspeccion/verificar/{patente}
    return await apiClient<EstadoVerificacionDTO>(`/inspeccion/verificar/${patente}`, {
      method: 'GET'
    });
  }
};
export const crearInspectorService = (_token: string | null) => ({
  ...InspectorService,
  emitirMulta: async (patente: string, motivo: string, monto: number): Promise<void> => {
    await apiClient('/inspeccion/multar', { method: 'POST', body: JSON.stringify({ patente, motivo, monto }) });
  }
});