import { usuario_rol } from '@prisma/client';
import { UsuarioRepository } from '../repositories/repository-usuario';

export class ErrorSeguridad extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly codigo?: string
  ) {
    super(message);
  }
}

export const SeguridadService = {
  validarRoles: async (clerkId: string, rolesPermitidos: usuario_rol[]) => {
    const usuario = await UsuarioRepository.buscarPermisosPorClerkId(clerkId);

    if (!usuario) {
      throw new ErrorSeguridad(
        'Usuario no sincronizado',
        403,
        'USUARIO_NO_SINCRONIZADO'
      );
    }

    if (!rolesPermitidos.includes(usuario.rol)) {
      throw new ErrorSeguridad('Permisos insuficientes', 403);
    }

    return usuario;
  }
};
