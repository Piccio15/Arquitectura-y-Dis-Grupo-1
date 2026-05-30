import { Prisma } from '@prisma/client';
import { MultaRepository } from '../repositories/repository-multa';

export const MultaService = {
  marcarComoPagada: async (multaId: number, db: Prisma.TransactionClient) => {
    const resultado = await MultaRepository.marcarComoPagada(multaId, db);
    return resultado.count === 1;
  }
};
