import { clerkClient } from '@clerk/express';
import { UsuarioRepository } from '../repositories/repository-usuario';

export class ErrorIdentidad extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}

function normalizarEmail(email: unknown) {
  if (typeof email !== 'string' || !email.trim()) {
    throw new ErrorIdentidad('El email es requerido', 400);
  }

  const emailNormalizado = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
    throw new ErrorIdentidad('El email no tiene un formato valido', 400);
  }

  return emailNormalizado;
}

export const IdentidadService = {
  sincronizarUsuario: async (clerkId: string) => {
    const usuarioClerk = await clerkClient.users.getUser(clerkId);
    const emailPrincipal = usuarioClerk.emailAddresses.find(
      email => email.id === usuarioClerk.primaryEmailAddressId
    )?.emailAddress;

    if (!emailPrincipal) {
      throw new Error('El usuario de Clerk no tiene un email principal');
    }

    const usuarioExistente = await UsuarioRepository.buscarPorClerkId(clerkId);
    const rol = usuarioExistente?.rol ?? 'CONDUCTOR';

    const usuario = await UsuarioRepository.sincronizarUsuario({
      clerkId,
      email: emailPrincipal,
      rol
    });

    await clerkClient.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        role: usuario?.rol
      }
    });

    return usuario;
  },

  convertirEnInspector: async (email: unknown) => {
    const emailNormalizado = normalizarEmail(email);
    const usuarioExistente = await UsuarioRepository.buscarPorEmail(emailNormalizado);

    if (!usuarioExistente) {
      throw new ErrorIdentidad('No existe un usuario registrado con ese email', 404);
    }

    if (usuarioExistente.rol === 'INSPECTOR' && usuarioExistente.inspector) {
      throw new ErrorIdentidad('El usuario ya es inspector', 409);
    }

    const usuario = await UsuarioRepository.convertirEnInspectorPorEmail(emailNormalizado);

    if (!usuario) {
      throw new ErrorIdentidad('No existe un usuario registrado con ese email', 404);
    }

    await clerkClient.users.updateUserMetadata(usuario.clerk_id, {
      publicMetadata: {
        role: usuario.rol
      }
    });

    return usuario;
  }
};
