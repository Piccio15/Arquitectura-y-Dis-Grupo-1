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
