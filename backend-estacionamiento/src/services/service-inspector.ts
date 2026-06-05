import { UsuarioRepository } from '../repositories/repository-usuario';

export class ErrorInspector extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
  }
}

export const InspectorService = {
  verificarPatente: async (clerkId: string, patente: string) => {
    if (!patente?.trim()) throw new ErrorInspector('La patente es requerida', 400);

    const patenteNorm = patente.trim().toUpperCase();
    const sesion = await UsuarioRepository.buscarSesionActivaPorPatente(patenteNorm);

    if (sesion) {
      return {
        patente: patenteNorm,
        tieneSesionActiva: true,
        zonaId: sesion.zonaId,
        nombreZona: sesion.zona.nombre,
        horaInicio: sesion.fecha_inicio.toISOString(),
      };
    }

    return {
      patente: patenteNorm,
      tieneSesionActiva: false,
    };
  },

  emitirMulta: async (clerkId: string, datos: {
    patente: string;
    ubicacion: string;
    monto: number;
    motivo: string;
  }) => {
    if (!datos.patente?.trim()) throw new ErrorInspector('La patente es requerida', 400);
    if (!datos.ubicacion?.trim()) throw new ErrorInspector('La ubicación es requerida', 400);
    if (!datos.monto || datos.monto <= 0) throw new ErrorInspector('El monto debe ser mayor a 0', 400);

    const patenteNorm = datos.patente.trim().toUpperCase();

    const inspector = await UsuarioRepository.buscarInspectorPorClerkId(clerkId);
    if (!inspector) throw new ErrorInspector('El usuario autenticado no es un inspector', 403);

    const vehiculo = await UsuarioRepository.buscarVehiculoPorPatente(patenteNorm);
    if (!vehiculo) throw new ErrorInspector('Vehículo no encontrado en el sistema', 404);

    return await UsuarioRepository.crearMulta({
      patente: patenteNorm,
      ubicacion: datos.ubicacion.trim(),
      monto: datos.monto,
      inspectorId: inspector.id,
    });
  }
};