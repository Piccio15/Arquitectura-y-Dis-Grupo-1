import { Prisma } from '@prisma/client';
import { MercadoPagoAdapter } from '../adapters/adapter-mercadoPago';
import { orm } from '../repositories/orm-config';
import { PagoRepository } from '../repositories/repository-pago';
import { MultaService } from './service-multa';

const MINUTOS_EXPIRACION_OPERACION_PENDIENTE = 10;

export class ErrorBilletera extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}

function validarMonto(monto: number) {
  if (!Number.isFinite(monto) || monto <= 0) {
    throw new ErrorBilletera('El monto debe ser mayor a cero', 400);
  }
}

function reconstruirPreferencia(operacion: {
  id: number;
  mercadoPagoPreferenceId: string;
}) {
  const preferenceId = operacion.mercadoPagoPreferenceId;

  return {
    operacionId: operacion.id,
    preferenceId,
    checkoutUrl: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${encodeURIComponent(preferenceId)}`,
    sandboxCheckoutUrl: `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=${encodeURIComponent(preferenceId)}`
  };
}

function operacionPendienteExpirada(operacion: { fecha_creacion: Date }) {
  const minutosTranscurridos =
    (Date.now() - operacion.fecha_creacion.getTime()) / 60000;

  return minutosTranscurridos >= MINUTOS_EXPIRACION_OPERACION_PENDIENTE;
}

async function crearPreferencia(operacion: {
  id: number;
  monto: number;
  tipo: 'CARGA_SALDO' | 'PAGO_MULTA';
}) {
  try {
    const preferencia = await MercadoPagoAdapter.crearPreferencia({
      referenciaExterna: String(operacion.id),
      titulo: operacion.tipo === 'CARGA_SALDO'
        ? 'Carga de saldo de estacionamiento'
        : 'Pago de multa de estacionamiento',
      monto: operacion.monto
    });

    await PagoRepository.guardarPreferencia(operacion.id, preferencia.id);

    return {
      operacionId: operacion.id,
      preferenceId: preferencia.id,
      checkoutUrl: preferencia.init_point,
      sandboxCheckoutUrl: preferencia.sandbox_init_point
    };
  } catch (error) {
    await PagoRepository.marcarFallida(operacion.id);
    throw error;
  }
}

export const BilleteraService = {
  solicitarCargaSaldo: async (clerkId: string, monto: number) => {
    validarMonto(monto);
    const conductor = await PagoRepository.buscarConductorPorClerkId(clerkId);

    if (!conductor) {
      throw new ErrorBilletera('El usuario autenticado no es un conductor', 403);
    }

    const operacion = await PagoRepository.crearOperacion({
      tipo: 'CARGA_SALDO',
      monto,
      conductorId: conductor.id
    });

    return await crearPreferencia(operacion);
  },

  solicitarPagoMulta: async (clerkId: string, multaId: number) => {
    if (!Number.isInteger(multaId) || multaId <= 0) {
      throw new ErrorBilletera('La multa es invalida', 400);
    }

    const conductor = await PagoRepository.buscarConductorPorClerkId(clerkId);

    if (!conductor) {
      throw new ErrorBilletera('El usuario autenticado no es un conductor', 403);
    }

    const multa = await PagoRepository.buscarMultaPendienteDelConductor(multaId, conductor.id);

    if (!multa) {
      throw new ErrorBilletera('No se encontro una multa pendiente del conductor', 404);
    }

    const operacionActiva = await PagoRepository.buscarOperacionActivaDeMulta(multa.id_multa);

    if (operacionActiva) {
      if (operacionActiva.estado === 'PENDIENTE' && operacionPendienteExpirada(operacionActiva)) {
        await PagoRepository.marcarFallida(operacionActiva.id);
      } else if (operacionActiva.estado === 'PENDIENTE' && operacionActiva.mercadoPagoPreferenceId) {
        return reconstruirPreferencia({
          id: operacionActiva.id,
          mercadoPagoPreferenceId: operacionActiva.mercadoPagoPreferenceId
        });
      } else {
        throw new ErrorBilletera('La multa ya tiene un pago iniciado o aprobado', 409);
      }
    }

    const operacion = await PagoRepository.crearOperacion({
      tipo: 'PAGO_MULTA',
      monto: multa.monto,
      conductorId: conductor.id,
      multaId: multa.id_multa
    });

    return await crearPreferencia(operacion);
  },

  procesarPagoNotificado: async (paymentId: string) => {
    const pago = await MercadoPagoAdapter.obtenerPago(paymentId);
    const operacionId = Number(pago.external_reference);

    if (!Number.isInteger(operacionId) || operacionId <= 0) {
      throw new ErrorBilletera('El pago no referencia una operacion valida', 400);
    }

    return await orm.$transaction(async tx => {
      const operacion = await PagoRepository.buscarOperacionPorId(operacionId, tx);

      if (!operacion) {
        throw new ErrorBilletera('La operacion de pago no existe', 404);
      }

      if (operacion.estado === 'APROBADA') {
        return operacion;
      }

      if (Math.abs(operacion.monto - pago.transaction_amount) > 0.001) {
        throw new ErrorBilletera('El monto informado por Mercado Pago no coincide', 422);
      }

      if (pago.status !== 'approved') {
        if (['rejected', 'cancelled'].includes(pago.status)) {
          return await PagoRepository.actualizarEstado(
            operacion.id,
            'RECHAZADA',
            String(pago.id),
            tx
          );
        }

        return operacion;
      }

      if (operacion.tipo === 'CARGA_SALDO') {
        await PagoRepository.acreditarSaldo(operacion.conductorId, operacion.monto, tx);
      } else {
        if (!operacion.multaId) {
          throw new ErrorBilletera('La operacion no tiene una multa asociada', 422);
        }

        const multaActualizada = await MultaService.marcarComoPagada(operacion.multaId, tx);

        if (!multaActualizada) {
          throw new ErrorBilletera('La multa ya no esta pendiente', 409);
        }
      }

      return await PagoRepository.actualizarEstado(
        operacion.id,
        'APROBADA',
        String(pago.id),
        tx
      );
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
  },

  listarMultas: async (clerkId: string) => {
    return await PagoRepository.listarMultasDelConductor(clerkId);
  },

  obtenerSaldo: async (clerkId: string) => {
    const conductor = await PagoRepository.obtenerSaldo(clerkId);

    if (!conductor) {
      throw new ErrorBilletera('El usuario autenticado no es un conductor', 403);
    }

    return conductor;
  },

  debitarSaldo: async (
    conductorId: number,
    monto: number,
    db: Prisma.TransactionClient
  ) => {
    if (!Number.isFinite(monto) || monto < 0) {
      throw new ErrorBilletera('El monto a descontar es invalido', 422);
    }

    return await db.conductor.update({
      where: { id: conductorId },
      data: {
        saldo: { decrement: monto }
      }
    });
  }
};
