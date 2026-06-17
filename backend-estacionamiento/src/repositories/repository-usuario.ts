import { usuario_rol } from '@prisma/client';
import { orm } from './orm-config';

type SincronizarUsuarioDatos = {
  clerkId: string;
  email: string;
  rol: usuario_rol;
};

export const UsuarioRepository = {
  buscarPorClerkId: async (clerkId: string) => {
    return await orm.usuario.findUnique({
      where: { clerk_id: clerkId },
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
        await tx.conductor.deleteMany({
          where: { usuarioId: usuario.id }
        });

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
  }
};
