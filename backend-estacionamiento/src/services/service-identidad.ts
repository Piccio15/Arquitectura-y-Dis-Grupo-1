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

    const usuario = await UsuarioRepository.sincronizarConductor(clerkId, emailPrincipal);

    await clerkClient.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        role: usuario.rol
      }
    });

    return usuario;
  }
};
