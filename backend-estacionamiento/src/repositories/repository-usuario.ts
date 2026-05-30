import { orm } from './orm-config';

export const UsuarioRepository = {
  buscarPorEmail: async (email: string) => {
    return await orm.usuario.findUnique({
      where: { email }
    });
  },

  buscarPorId: async (id: number) => {
    return await orm.usuario.findUnique({
      where: { id },
      include: { conductor: true, inspector: true }
    });
  },

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

  sincronizarConductor: async (clerkId: string, email: string) => {
    return await orm.usuario.upsert({
      where: { clerk_id: clerkId },
      update: { email },
      create: {
        clerk_id: clerkId,
        email,
        // Clerk owns authentication. The DNI is completed later in the profile flow.
        dni: clerkId,
        rol: 'CONDUCTOR',
        conductor: {
          create: { saldo: 0 }
        }
      },
      include: { conductor: true, inspector: true }
    });
  },

  actualizarSaldo: async (usuarioId: number, nuevoSaldo: number) => {
    return await orm.conductor.update({
      where: { usuarioId },
      data: { saldo: nuevoSaldo }
    });
  }
};
