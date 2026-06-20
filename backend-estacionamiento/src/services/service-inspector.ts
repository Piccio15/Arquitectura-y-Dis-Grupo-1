import { UsuarioRepository } from '../repositories/repository-usuario';

export class ErrorInspector extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
  }
}

const ESTADOS_MULTA = ['PENDIENTE', 'PAGADA', 'ANULADA'] as const;
const MINUTOS_BLOQUEO_MULTA_DUPLICADA = 30;

function parsearEntero(valor: unknown, defecto: number, minimo: number, maximo: number) {
  const numero = Number(valor);

  if (!Number.isInteger(numero)) return defecto;

  return Math.min(Math.max(numero, minimo), maximo);
}

function parsearFecha(valor: unknown, finDelDia = false) {
  if (typeof valor !== 'string' || !valor.trim()) return undefined;

  const fecha = new Date(`${valor}T${finDelDia ? '23:59:59.999' : '00:00:00.000'}`);

  if (Number.isNaN(fecha.getTime())) {
    throw new ErrorInspector('La fecha informada es invalida', 400);
  }

  return fecha;
}

function parsearEstado(valor: unknown) {
  if (typeof valor !== 'string' || !valor.trim()) return undefined;

  const estado = valor.trim().toUpperCase();

  if (!ESTADOS_MULTA.includes(estado as typeof ESTADOS_MULTA[number])) {
    throw new ErrorInspector('El estado de multa es invalido', 400);
  }

  return estado as typeof ESTADOS_MULTA[number];
}

export const InspectorService = {
  verificarPatente: async (clerkId: string, patente: string) => {
    if (!patente?.trim()) throw new ErrorInspector('La patente es requerida', 400);

    const patenteNorm = patente.trim().toUpperCase();
    const sesion = await UsuarioRepository.buscarSesionActivaPorPatente(patenteNorm);

    if (sesion) {
      return {
        patente: patenteNorm,
        tieneSesionActiva: true,
        zonaId: sesion.zonaId,
        nombreZona: sesion.zona.nombre,
        horaInicio: sesion.fecha_inicio.toISOString(),
      };
    }

    return {
      patente: patenteNorm,
      tieneSesionActiva: false,
    };
  },

  emitirMulta: async (clerkId: string, datos: {
    patente: string;
    ubicacion: string;
    monto: number;
    motivo: string;
  }) => {
    if (!datos.patente?.trim()) throw new ErrorInspector('La patente es requerida', 400);
    if (!datos.ubicacion?.trim()) throw new ErrorInspector('La ubicación es requerida', 400);
    if (!datos.monto || datos.monto <= 0) throw new ErrorInspector('El monto debe ser mayor a 0', 400);

    const patenteNorm = datos.patente.trim().toUpperCase();

    const inspector = await UsuarioRepository.buscarInspectorPorClerkId(clerkId);
    if (!inspector) throw new ErrorInspector('El usuario autenticado no es un inspector', 403);

    const vehiculo = await UsuarioRepository.buscarVehiculoPorPatente(patenteNorm);
    if (!vehiculo) throw new ErrorInspector('Vehículo no encontrado en el sistema', 404);

    const desde = new Date(Date.now() - MINUTOS_BLOQUEO_MULTA_DUPLICADA * 60 * 1000);
    const multaReciente = await UsuarioRepository.buscarMultaPendienteRecientePorPatente(
      patenteNorm,
      desde
    );

    if (multaReciente) {
      throw new ErrorInspector('Ya existe una multa pendiente reciente para esta patente', 409);
    }

    return await UsuarioRepository.crearMulta({
      patente: patenteNorm,
      ubicacion: datos.ubicacion.trim(),
      monto: datos.monto,
      inspectorId: inspector.id,
    });
  },

  listarMultas: async (clerkId: string, filtros: {
    q?: unknown;
    estado?: unknown;
    fechaDesde?: unknown;
    fechaHasta?: unknown;
    pagina?: unknown;
    limite?: unknown;
  }) => {
    const inspector = await UsuarioRepository.buscarInspectorPorClerkId(clerkId);
    if (!inspector) throw new ErrorInspector('El usuario autenticado no es un inspector', 403);

    const pagina = parsearEntero(filtros.pagina, 1, 1, 100000);
    const limite = parsearEntero(filtros.limite, 8, 1, 30);
    const q = typeof filtros.q === 'string' && filtros.q.trim()
      ? filtros.q.trim()
      : undefined;
    const fechaDesde = parsearFecha(filtros.fechaDesde);
    const fechaHasta = parsearFecha(filtros.fechaHasta, true);

    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      throw new ErrorInspector('La fecha desde no puede ser mayor a la fecha hasta', 400);
    }

    const resultado = await UsuarioRepository.listarMultasDelInspector({
      inspectorId: inspector.id,
      q,
      estado: parsearEstado(filtros.estado),
      fechaDesde,
      fechaHasta,
      pagina,
      limite
    });

    return {
      items: resultado.items,
      paginacion: {
        pagina,
        limite,
        total: resultado.total,
        totalPaginas: Math.max(1, Math.ceil(resultado.total / limite))
      }
    };
  },

  obtenerDetalleMulta: async (clerkId: string, multaId: number) => {
    if (!Number.isInteger(multaId) || multaId <= 0) {
      throw new ErrorInspector('La multa es invalida', 400);
    }

    const inspector = await UsuarioRepository.buscarInspectorPorClerkId(clerkId);
    if (!inspector) throw new ErrorInspector('El usuario autenticado no es un inspector', 403);

    const multa = await UsuarioRepository.buscarDetalleMultaDelInspector(inspector.id, multaId);

    if (!multa) {
      throw new ErrorInspector('No se encontro la multa solicitada', 404);
    }

    return multa;
  }
};
