import { operacionpago_estado, operacionpago_tipo, Prisma } from '@prisma/client';
import { orm } from './orm-config';

type DatabaseClient = Pick<
  Prisma.TransactionClient,
  'conductor' | 'multa' | 'operacionpago'
>;

export const PagoRepository = {
  buscarConductorPorClerkId: async (clerkId: string, db: DatabaseClient = orm) => {
    return await db.conductor.findFirst({
      where: {
        usuario: { clerk_id: clerkId }
      }
    });
  },

  buscarMultaPendienteDelConductor: async (
    multaId: number,
    conductorId: number,
    db: DatabaseClient = orm
  ) => {
    return await db.multa.findFirst({
      where: {
        id_multa: multaId,
        estado: 'PENDIENTE',
        vehiculo: {
          conductores: {
            some: { conductorId }
          }
        }
      }
    });
  },

  buscarOperacionActivaDeMulta: async (multaId: number) => {
    return await orm.operacionpago.findFirst({
      where: {
        multaId,
        estado: { in: ['PENDIENTE', 'APROBADA'] }
      }
    });
  },

  crearOperacion: async (datos: {
    tipo: operacionpago_tipo;
    monto: number;
    conductorId: number;
    multaId?: number;
  }) => {
    return await orm.operacionpago.create({
      data: datos
    });
  },

  guardarPreferencia: async (operacionId: number, preferenceId: string) => {
    return await orm.operacionpago.update({
      where: { id: operacionId },
      data: { mercadoPagoPreferenceId: preferenceId }
    });
  },

  marcarFallida: async (operacionId: number) => {
    return await orm.operacionpago.update({
      where: { id: operacionId },
      data: { estado: 'FALLIDA' }
    });
  },

  buscarOperacionPorId: async (operacionId: number, db: DatabaseClient = orm) => {
    return await db.operacionpago.findUnique({
      where: { id: operacionId }
    });
  },

  actualizarEstado: async (
    operacionId: number,
    estado: operacionpago_estado,
    paymentId: string,
    db: DatabaseClient = orm
  ) => {
    return await db.operacionpago.update({
      where: { id: operacionId },
      data: {
        estado,
        mercadoPagoPaymentId: paymentId
      }
    });
  },

  acreditarSaldo: async (conductorId: number, monto: number, db: DatabaseClient = orm) => {
    return await db.conductor.update({
      where: { id: conductorId },
      data: {
        saldo: { increment: monto }
      }
    });
  },

  listarMultasDelConductor: async (clerkId: string) => {
    return await orm.multa.findMany({
      where: {
        vehiculo: {
          conductores: {
            some: {
              conductor: {
                usuario: { clerk_id: clerkId }
              }
            }
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });
  },

  obtenerSaldo: async (clerkId: string) => {
    return await orm.conductor.findFirst({
      where: {
        usuario: { clerk_id: clerkId }
      },
      select: { saldo: true }
    });
  }
};
