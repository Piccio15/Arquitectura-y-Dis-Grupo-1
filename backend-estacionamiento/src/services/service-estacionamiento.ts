import { Prisma } from '@prisma/client';
import { EstacionamientoRepository } from '../repositories/repository-estacionamiento';
import { orm } from '../repositories/orm-config';
import { BilleteraService } from './service-billetera';

export class ErrorEstacionamiento extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}

function redondearImporte(importe: number) {
  return Math.round((importe + Number.EPSILON) * 100) / 100;
}

function validarDatosInicio(datos: {
  patente: string;
  zonaId: number;
}) {
  if (typeof datos?.patente !== 'string' || !datos.patente.trim()) {
    throw new ErrorEstacionamiento('La patente es obligatoria', 400);
  }

  const patente = datos.patente.trim().toUpperCase();

  if (!Number.isInteger(datos.zonaId) || datos.zonaId <= 0) {
    throw new ErrorEstacionamiento('La zona es invalida', 400);
  }

  return patente;
}

function calcularCosto(precioHora: number, duracionMinutos: number) {
  if (!Number.isFinite(precioHora) || precioHora < 0) {
    throw new ErrorEstacionamiento('La tarifa de la zona es invalida', 422);
  }

  return redondearImporte(precioHora * duracionMinutos / 60);
}

export const EstacionamientoService = {
  iniciarSesion: async (
    clerkId: string,
    datos: {
      patente: string;
      zonaId: number;
    }
  ) => {
    const patente = validarDatosInicio(datos);

    return await orm.$transaction(async tx => {
      const conductor = await EstacionamientoRepository.buscarConductorPorClerkId(clerkId, tx);

      if (!conductor) {
        throw new ErrorEstacionamiento('El usuario autenticado no es un conductor', 403);
      }

      if (conductor.saldo <= 0) {
        throw new ErrorEstacionamiento('No se puede iniciar una sesion con saldo negativo o cero', 422);
      }

      const vehiculo = await EstacionamientoRepository.buscarVehiculoDelConductor(
        patente,
        conductor.id,
        tx
      );

      if (!vehiculo) {
        throw new ErrorEstacionamiento('El vehiculo no esta registrado por el conductor', 404);
      }

      const sesionActiva = await EstacionamientoRepository.buscarSesionActivaPorPatente(patente, tx);

      if (sesionActiva) {
        throw new ErrorEstacionamiento('El vehiculo ya tiene una sesion activa', 409);
      }

      const zona = await EstacionamientoRepository.buscarZonaPorId(datos.zonaId, tx);

      if (!zona) {
        throw new ErrorEstacionamiento('La zona no existe', 404);
      }

      return await EstacionamientoRepository.crearSesion({
        patente,
        zonaId: zona.id
      }, tx);
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
  },

  listarSesionesActivas: async (clerkId: string) => {
    return await EstacionamientoRepository.listarSesionesActivasDelConductor(clerkId);
  },

  finalizarSesion: async (clerkId: string, sesionId: number) => {
    if (!Number.isInteger(sesionId) || sesionId <= 0) {
      throw new ErrorEstacionamiento('La sesion es invalida', 400);
    }

    return await orm.$transaction(async tx => {
      const sesion = await EstacionamientoRepository.buscarSesionActivaDelConductor(
        sesionId,
        clerkId,
        tx
      );

      if (!sesion) {
        throw new ErrorEstacionamiento('No se encontro una sesion activa del conductor', 404);
      }

      const fechaFin = new Date();
      const duracionRealMinutos = Math.ceil(
        (fechaFin.getTime() - sesion.fecha_inicio.getTime()) / 60000
      );
      const costoCobrado = calcularCosto(sesion.zona.precio_hora, duracionRealMinutos);

      await BilleteraService.debitarSaldo(
        sesion.vehiculo.conductorId,
        costoCobrado,
        tx
      );

      const sesionFinalizada = await EstacionamientoRepository.finalizarSesion(
        sesion.id,
        fechaFin,
        costoCobrado,
        tx
      );

      if (!sesionFinalizada) {
        throw new ErrorEstacionamiento('La sesion ya fue finalizada', 409);
      }

      return {
        ...sesionFinalizada,
        duracion_real_minutos: duracionRealMinutos,
        costo_cobrado: costoCobrado
      };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
  }
};
