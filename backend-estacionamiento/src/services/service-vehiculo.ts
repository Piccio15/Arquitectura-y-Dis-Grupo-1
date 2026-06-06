import { VehiculoRepository } from '../repositories/repository-vehiculo';

export class ErrorVehiculo extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
  }
}

export const VehiculoService = {
  listarVehiculos: async (clerkId: string) => {
    const conductor = await VehiculoRepository.buscarConductorPorClerkId(clerkId);
    if (!conductor) throw new ErrorVehiculo('El usuario no es un conductor', 403);
    return await VehiculoRepository.listarVehiculosDelConductor(conductor.id);
  },

  registrarVehiculo: async (clerkId: string, patente: string) => {
      const patenteNorm = patente.trim().toUpperCase().replace(/\s+/g, '');
    if (!patenteNorm) throw new ErrorVehiculo('La patente es requerida', 400);

    const conductor = await VehiculoRepository.buscarConductorPorClerkId(clerkId);
    if (!conductor) throw new ErrorVehiculo('El usuario no es un conductor', 403);

    const yaExiste = await VehiculoRepository.buscarVehiculoDelConductor(patenteNorm, conductor.id);
    if (yaExiste) throw new ErrorVehiculo('Ya tenés ese vehículo registrado', 409);

    return await VehiculoRepository.crearVehiculo(patenteNorm, conductor.id);
  },

  eliminarVehiculo: async (clerkId: string, patente: string) => {
    const conductor = await VehiculoRepository.buscarConductorPorClerkId(clerkId);
    if (!conductor) throw new ErrorVehiculo('El usuario no es un conductor', 403);

    const vehiculo = await VehiculoRepository.buscarVehiculoDelConductor(patente.toUpperCase(), conductor.id);
    if (!vehiculo) throw new ErrorVehiculo('Vehículo no encontrado', 404);

    return await VehiculoRepository.eliminarVehiculoDelConductor(patente.toUpperCase(), conductor.id);
  }
};
