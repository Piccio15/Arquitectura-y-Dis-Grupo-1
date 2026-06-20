import { multa_estado, Prisma, usuario_rol } from '@prisma/client';
import { orm } from './orm-config';

type SincronizarUsuarioDatos = {
  clerkId: string;
  email: string;
  rol: usuario_rol;
};

type ListarMultasInspectorFiltros = {
  inspectorId: number;
  q?: string;
  estado?: multa_estado;
  fechaDesde?: Date;
  fechaHasta?: Date;
  pagina: number;
  limite: number;
};

function construirWhereMultasInspector(filtros: ListarMultasInspectorFiltros): Prisma.multaWhereInput {
  const where: Prisma.multaWhereInput = {
    inspectorId: filtros.inspectorId
  };

  if (filtros.estado) {
    where.estado = filtros.estado;
  }

  if (filtros.fechaDesde || filtros.fechaHasta) {
    where.fecha = {
      ...(filtros.fechaDesde && { gte: filtros.fechaDesde }),
      ...(filtros.fechaHasta && { lte: filtros.fechaHasta })
    };
  }

  if (filtros.q) {
    const q = filtros.q.trim();
    const patente = q.toUpperCase().replace(/\s+/g, '');

    where.OR = [
      { patente: { contains: patente } },
      {
        vehiculo: {
          conductores: {
            some: {
              conductor: {
                usuario: {
                  dni: { contains: q }
                }
              }
            }
          }
        }
      }
    ];
  }

  return where;
}

export const UsuarioRepository = {
  buscarPorClerkId: async (clerkId: string) => {
    return await orm.usuario.findUnique({
      where: { clerk_id: clerkId },
      include: { conductor: true, inspector: true }
    });
  },

  buscarPorEmail: async (email: string) => {
    return await orm.usuario.findUnique({
      where: { email },
      include: { conductor: true, inspector: true }
    });
  },

  buscarPermisosPorClerkId: async (clerkId: string) => {
    return await orm.usuario.findUnique({
      where: { clerk_id: clerkId },
      select: {
        id: true,
        clerk_id: true,
        rol: true
      }
    });
  },

  sincronizarUsuario: async (datos: SincronizarUsuarioDatos) => {
    return await orm.$transaction(async tx => {
      const usuario = await tx.usuario.upsert({
        where: { clerk_id: datos.clerkId },
        update: {
          email: datos.email,
          rol: datos.rol
        },
        create: {
          clerk_id: datos.clerkId,
          email: datos.email,
          // Clerk owns authentication. The DNI is completed later in the profile flow.
          dni: datos.clerkId,
          rol: datos.rol
        }
      });

      if (datos.rol === 'CONDUCTOR') {
        await tx.conductor.upsert({
          where: { usuarioId: usuario.id },
          update: {},
          create: {
            usuarioId: usuario.id,
            saldo: 0
          }
        });
      }

      if (datos.rol === 'INSPECTOR') {
        await tx.inspector.upsert({
          where: { usuarioId: usuario.id },
          update: {},
          create: {
            usuarioId: usuario.id,
            legajo: `INS-${usuario.id}`
          }
        });
      }

      return await tx.usuario.findUnique({
        where: { id: usuario.id },
        include: { conductor: true, inspector: true }
      });
    });
  },

  convertirEnInspectorPorEmail: async (email: string) => {
    return await orm.$transaction(async tx => {
      const usuario = await tx.usuario.findUnique({
        where: { email },
        include: { inspector: true }
      });

      if (!usuario) {
        return null;
      }

      const usuarioActualizado = await tx.usuario.update({
        where: { id: usuario.id },
        data: { rol: 'INSPECTOR' }
      });

      const inspector = await tx.inspector.upsert({
        where: { usuarioId: usuario.id },
        update: {},
        create: {
          usuarioId: usuario.id,
          legajo: `INS-${usuario.id}`
        }
      });

      return {
        ...usuarioActualizado,
        inspector
      };
    });
  },

  buscarInspectorPorClerkId: async (clerkId: string) => {
    const usuario = await orm.usuario.findUnique({
      where: { clerk_id: clerkId },
      include: { inspector: true }
    });
    return usuario?.inspector ?? null;
  },

  buscarSesionActivaPorPatente: async (patente: string) => {
    return await orm.sesionestacionamiento.findFirst({
      where: { patente: patente.toUpperCase(), fecha_fin: null },
      include: { zona: true }
    });
  },

  buscarVehiculoPorPatente: async (patente: string) => {
    return await orm.vehiculo.findUnique({
      where: { patente: patente.toUpperCase() }
    });
  },

  crearMulta: async (datos: {
    patente: string;
    ubicacion: string;
    monto: number;
    inspectorId: number;
  }) => {
    return await orm.multa.create({
      data: {
        patente: datos.patente,
        ubicacion: datos.ubicacion,
        monto: datos.monto,
        inspectorId: datos.inspectorId,
      }
    });
  },

  buscarMultaPendienteRecientePorPatente: async (patente: string, desde: Date) => {
    return await orm.multa.findFirst({
      where: {
        patente: patente.toUpperCase(),
        estado: 'PENDIENTE',
        fecha: {
          gte: desde
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });
  },

  listarMultasDelInspector: async (filtros: ListarMultasInspectorFiltros) => {
    const where = construirWhereMultasInspector(filtros);
    const skip = (filtros.pagina - 1) * filtros.limite;

    const [items, total] = await orm.$transaction([
      orm.multa.findMany({
        where,
        orderBy: { fecha: 'desc' },
        skip,
        take: filtros.limite,
        include: {
          inspector: {
            select: {
              id: true,
              legajo: true
            }
          }
        }
      }),
      orm.multa.count({ where })
    ]);

    return { items, total };
  },

  buscarDetalleMultaDelInspector: async (inspectorId: number, multaId: number) => {
    return await orm.multa.findFirst({
      where: {
        id_multa: multaId,
        inspectorId
      },
      include: {
        inspector: {
          include: {
            usuario: {
              select: {
                email: true,
                dni: true
              }
            }
          }
        },
        vehiculo: {
          include: {
            conductores: {
              include: {
                conductor: {
                  include: {
                    usuario: {
                      select: {
                        email: true,
                        dni: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        operacionpago: {
          orderBy: { fecha_creacion: 'desc' },
          select: {
            id: true,
            tipo: true,
            estado: true,
            monto: true,
            fecha_creacion: true,
            fecha_actualizacion: true,
            mercadoPagoPaymentId: true
          }
        }
      }
    });
  }
};
