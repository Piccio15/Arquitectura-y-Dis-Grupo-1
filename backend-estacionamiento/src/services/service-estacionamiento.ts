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
  duracionEstimadaMinutos: number;
}) {
  if (typeof datos?.patente !== 'string' || !datos.patente.trim()) {
    throw new ErrorEstacionamiento('La patente es obligatoria', 400);
  }

  const patente = datos.patente.trim().toUpperCase();

  if (!Number.isInteger(datos.zonaId) || datos.zonaId <= 0) {
    throw new ErrorEstacionamiento('La zona es invalida', 400);
  }

  if (!Number.isInteger(datos.duracionEstimadaMinutos) || datos.duracionEstimadaMinutos <= 0) {
    throw new ErrorEstacionamiento('La duracion estimada debe ser mayor a cero', 400);
  }

  return patente;
}

function calcularCosto(precioHora: number, duracionEstimadaMinutos: number) {
  if (!Number.isFinite(precioHora) || precioHora < 0) {
    throw new ErrorEstacionamiento('La tarifa de la zona es invalida', 422);
  }

  return redondearImporte(precioHora * duracionEstimadaMinutos / 60);
}

export const EstacionamientoService = {
  cotizarSesion: async (
    clerkId: string,
    datos: {
      patente: string;
      zonaId: number;
      duracionEstimadaMinutos: number;
    }
  ) => {
    const patente = validarDatosInicio(datos);
    const conductor = await EstacionamientoRepository.buscarConductorPorClerkId(clerkId);

    if (!conductor) {
      throw new ErrorEstacionamiento('El usuario autenticado no es un conductor', 403);
    }

    const vehiculo = await EstacionamientoRepository.buscarVehiculoDelConductor(
      patente,
      conductor.id
    );

    if (!vehiculo) {
      throw new ErrorEstacionamiento('El vehiculo no esta registrado por el conductor', 404);
    }

    const sesionActiva = await EstacionamientoRepository.buscarSesionActivaPorPatente(patente);

    if (sesionActiva) {
      throw new ErrorEstacionamiento('El vehiculo ya tiene una sesion activa', 409);
    }

    const zona = await EstacionamientoRepository.buscarZonaPorId(datos.zonaId);

    if (!zona) {
      throw new ErrorEstacionamiento('La zona no existe', 404);
    }

    const costo = calcularCosto(zona.precio_hora, datos.duracionEstimadaMinutos);

    return {
      patente,
      zona,
      duracion_estimada_minutos: datos.duracionEstimadaMinutos,
      costo,
      saldo_actual: conductor.saldo,
      saldo_suficiente: conductor.saldo >= costo
    };
  },

  iniciarSesion: async (
    clerkId: string,
    datos: {
      patente: string;
      zonaId: number;
      duracionEstimadaMinutos: number;
    }
  ) => {
    const patente = validarDatosInicio(datos);

    return await orm.$transaction(async tx => {
      const conductor = await EstacionamientoRepository.buscarConductorPorClerkId(clerkId, tx);

      if (!conductor) {
        throw new ErrorEstacionamiento('El usuario autenticado no es un conductor', 403);
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

      const costoCobrado = calcularCosto(zona.precio_hora, datos.duracionEstimadaMinutos);
      const saldoSuficiente = await BilleteraService.descontarSaldo(conductor.id, costoCobrado, tx);

      if (!saldoSuficiente) {
        throw new ErrorEstacionamiento('Saldo insuficiente', 422);
      }

      return await EstacionamientoRepository.crearSesion({
        patente,
        zonaId: zona.id,
        duracionEstimadaMinutos: datos.duracionEstimadaMinutos,
        costoCobrado
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
      const sesionFinalizada = await EstacionamientoRepository.finalizarSesion(
        sesion.id,
        fechaFin,
        tx
      );

      return {
        ...sesionFinalizada,
        duracion_real_minutos: Math.ceil(
          (fechaFin.getTime() - sesion.fecha_inicio.getTime()) / 60000
        )
      };
    });
  }
};
