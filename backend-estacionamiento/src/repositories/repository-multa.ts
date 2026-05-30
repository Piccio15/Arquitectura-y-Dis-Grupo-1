import { Prisma } from '@prisma/client';
import { orm } from './orm-config';

type DatabaseClient = Pick<Prisma.TransactionClient, 'multa'>;

export const MultaRepository = {
  marcarComoPagada: async (multaId: number, db: DatabaseClient = orm) => {
    return await db.multa.updateMany({
      where: {
        id_multa: multaId,
        estado: 'PENDIENTE'
      },
      data: { estado: 'PAGADA' }
    });
  }
};
