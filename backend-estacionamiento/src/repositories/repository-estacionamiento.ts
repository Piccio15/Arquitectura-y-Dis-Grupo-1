import { Prisma } from '@prisma/client';
import { orm } from './orm-config';

type DatabaseClient = Pick<
  Prisma.TransactionClient,
  'conductor' | 'sesionestacionamiento' | 'vehiculo' | 'zona'
>;

export const EstacionamientoRepository = {
  buscarConductorPorClerkId: async (clerkId: string, db: DatabaseClient = orm) => {
    return await db.conductor.findFirst({
      where: {
        usuario: { clerk_id: clerkId }
      }
    });
  },

  buscarVehiculoDelConductor: async (
    patente: string,
    conductorId: number,
    db: DatabaseClient = orm
  ) => {
    return await db.vehiculo.findFirst({
      where: { patente, conductorId }
    });
  },

  buscarZonaPorId: async (zonaId: number, db: DatabaseClient = orm) => {
    return await db.zona.findUnique({
      where: { id: zonaId }
    });
  },

  buscarSesionActivaPorPatente: async (patente: string, db: DatabaseClient = orm) => {
    return await db.sesionestacionamiento.findFirst({
      where: {
        patente,
        fecha_fin: null
      }
    });
  },

  crearSesion: async (
    datos: {
      patente: string;
      zonaId: number;
    },
    db: DatabaseClient = orm
  ) => {
    return await db.sesionestacionamiento.create({
      data: {
        patente: datos.patente,
        zonaId: datos.zonaId
      },
      include: { zona: true }
    });
  },

  listarSesionesActivasDelConductor: async (clerkId: string) => {
    return await orm.sesionestacionamiento.findMany({
      where: {
        fecha_fin: null,
        vehiculo: {
          conductor: {
            usuario: { clerk_id: clerkId }
          }
        }
      },
      include: { zona: true },
      orderBy: { fecha_inicio: 'desc' }
    });
  },

  listarSesionesActivas: async (db: DatabaseClient = orm) => {
    return await db.sesionestacionamiento.findMany({
      where: { fecha_fin: null },
      include: { zona: true, vehiculo: true },
      orderBy: { fecha_inicio: 'asc' }
    });
  },

  buscarSesionActivaDelConductor: async (
    sesionId: number,
    clerkId: string,
    db: DatabaseClient = orm
  ) => {
    return await db.sesionestacionamiento.findFirst({
      where: {
        id: sesionId,
        fecha_fin: null,
        vehiculo: {
          conductor: {
            usuario: { clerk_id: clerkId }
          }
        }
      },
      include: { zona: true, vehiculo: true }
    });
  },

  buscarSesionActivaPorId: async (sesionId: number, db: DatabaseClient = orm) => {
    return await db.sesionestacionamiento.findFirst({
      where: {
        id: sesionId,
        fecha_fin: null
      },
      include: { zona: true, vehiculo: true }
    });
  },

  finalizarSesion: async (
    sesionId: number,
    fechaFin: Date,
    costoCobrado: number,
    db: DatabaseClient = orm
  ) => {
    const resultado = await db.sesionestacionamiento.updateMany({
      where: {
        id: sesionId,
        fecha_fin: null
      },
      data: {
        fecha_fin: fechaFin,
        costo_cobrado: costoCobrado
      }
    });

    if (resultado.count !== 1) {
      return null;
    }

    return await db.sesionestacionamiento.findUnique({
      where: { id: sesionId },
      include: { zona: true }
    });
  }
};
