import { ConfiguracionRepository } from '../repositories/repository-configuracion';

export class ErrorConfiguracion extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
  }
}

export type HorarioCobro = {
  hora_inicio_cobro: string;
  hora_fin_cobro: string;
};

const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

function validarHora(hora: string, campo: string) {
  if (typeof hora !== 'string' || !FORMATO_HORA.test(hora)) {
    throw new ErrorConfiguracion(`${campo} debe tener formato HH:mm`, 400);
  }
}

function convertirAMinutos(hora: string) {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}

export function estaDentroDelHorarioCobro(
  horario: HorarioCobro,
  fecha: Date = new Date()
) {
  const inicio = convertirAMinutos(horario.hora_inicio_cobro);
  const fin = convertirAMinutos(horario.hora_fin_cobro);
  const ahora = fecha.getHours() * 60 + fecha.getMinutes();

  if (inicio < fin) {
    return ahora >= inicio && ahora < fin;
  }

  return ahora >= inicio || ahora < fin;
}

export function correspondeCerrarPorFinDeHorario(
  horario: HorarioCobro,
  fecha: Date = new Date()
) {
  return !estaDentroDelHorarioCobro(horario, fecha);
}

export const ConfiguracionService = {
  obtenerHorarioCobro: async () => {
    return await ConfiguracionRepository.obtenerHorarioCobro();
  },

  actualizarHorarioCobro: async (datos: HorarioCobro) => {
    validarHora(datos.hora_inicio_cobro, 'hora_inicio_cobro');
    validarHora(datos.hora_fin_cobro, 'hora_fin_cobro');

    if (datos.hora_inicio_cobro === datos.hora_fin_cobro) {
      throw new ErrorConfiguracion('El inicio y el fin del cobro no pueden ser iguales', 400);
    }

    return await ConfiguracionRepository.actualizarHorarioCobro({
      hora_inicio_cobro: datos.hora_inicio_cobro,
      hora_fin_cobro: datos.hora_fin_cobro
    });
  }
};
