import { clerkClient } from '@clerk/express';
import { UsuarioRepository } from '../repositories/repository-usuario';

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
  }
};
