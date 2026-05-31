import { orm } from './orm-config';

export const VehiculoRepository = {
  buscarConductorPorClerkId: async (clerkId: string) => {
    return await orm.conductor.findFirst({
      where: { usuario: { clerk_id: clerkId } }
    });
  },

  listarVehiculosDelConductor: async (conductorId: number) => {
    return await orm.vehiculo.findMany({ where: { conductorId } });
  },

  buscarVehiculoDelConductor: async (patente: string, conductorId: number) => {
    return await orm.vehiculo.findFirst({ where: { patente, conductorId } });
  },

  crearVehiculo: async (patente: string, conductorId: number) => {
    return await orm.vehiculo.create({ data: { patente, conductorId } });
  },

  eliminarVehiculo: async (patente: string) => {
    return await orm.vehiculo.delete({ where: { patente } });
  }
};