import { orm } from './orm-config';

export const VehiculoRepository = {
  buscarConductorPorClerkId: async (clerkId: string) => {
    return await orm.conductor.findFirst({
      where: { usuario: { clerk_id: clerkId } }
    });
  },

  listarVehiculosDelConductor: async (conductorId: number) => {
    const asociaciones = await orm.conductorvehiculo.findMany({
      where: { conductorId },
      include: { vehiculo: true },
      orderBy: { fecha_asociacion: 'desc' }
    });

    return asociaciones.map(asociacion => asociacion.vehiculo);
  },

  buscarVehiculoDelConductor: async (patente: string, conductorId: number) => {
    return await orm.conductorvehiculo.findUnique({
      where: {
        conductorId_patente: { conductorId, patente }
      },
      include: { vehiculo: true }
    });
  },

  crearVehiculo: async (patente: string, conductorId: number) => {
    return await orm.$transaction(async tx => {
      const vehiculo = await tx.vehiculo.upsert({
        where: { patente },
        update: {},
        create: { patente }
      });

      await tx.conductorvehiculo.create({
        data: { patente, conductorId }
      });

      return vehiculo;
    });
  },

  eliminarVehiculoDelConductor: async (patente: string, conductorId: number) => {
    return await orm.conductorvehiculo.delete({
      where: {
        conductorId_patente: { conductorId, patente }
      }
    });
  }
};
