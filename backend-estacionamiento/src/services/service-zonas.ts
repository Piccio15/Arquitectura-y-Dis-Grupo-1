import { ZonaRepository } from '../repositories/repository-zona';

export class ErrorZona extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
  }
}

export const ZonaService = {
  listarZonas: async () => {
    return await ZonaRepository.listarZonas();
  },

  crearZona: async (datos: { nombre: string; calles: string; precio_hora: number; coordenadas: unknown }) => {
    if (!datos.nombre?.trim()) throw new ErrorZona('El nombre es requerido', 400);
    if (!datos.precio_hora || datos.precio_hora <= 0) throw new ErrorZona('El precio debe ser mayor a 0', 400);

    return await ZonaRepository.crearZona({
      nombre: datos.nombre.trim(),
      calles: datos.calles ?? '',
      precio_hora: Number(datos.precio_hora),
      coordenadas: (datos.coordenadas as any) ?? []
    });
  },

  actualizarZona: async (id: number, datos: { nombre: string; precio_hora: number; coordenadas: unknown }) => {
    if (!Number.isInteger(id) || id <= 0) throw new ErrorZona('La zona es invalida', 400);
    if (!datos.nombre?.trim()) throw new ErrorZona('El nombre es requerido', 400);
    if (!datos.precio_hora || datos.precio_hora <= 0) throw new ErrorZona('El precio debe ser mayor a 0', 400);

    const zona = await ZonaRepository.buscarZonaPorId(id);
    if (!zona) throw new ErrorZona('La zona no existe', 404);

    return await ZonaRepository.actualizarZona(id, {
      nombre: datos.nombre.trim(),
      precio_hora: Number(datos.precio_hora),
      coordenadas: (datos.coordenadas as any) ?? []
    });
  },

  eliminarZona: async (id: number) => {
    if (!Number.isInteger(id) || id <= 0) throw new ErrorZona('La zona es invalida', 400);

    const zona = await ZonaRepository.buscarZonaPorId(id);
    if (!zona) throw new ErrorZona('La zona no existe', 404);

    const sesionesAsociadas = await ZonaRepository.contarSesionesPorZona(id);

    if (sesionesAsociadas > 0) {
      throw new ErrorZona('No se puede eliminar una zona con sesiones de estacionamiento asociadas', 409);
    }

    return await ZonaRepository.eliminarZona(id);
  }
};
