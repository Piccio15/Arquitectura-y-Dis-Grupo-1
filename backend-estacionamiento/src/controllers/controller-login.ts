import { getAuth } from '@clerk/express';
import { Request, Response } from 'express';
import { IdentidadService } from '../services/service-identidad';

export const LoginController = {
  sincronizarUsuario: async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: 'Autenticacion requerida' });
      return;
    }

    try {
      const usuario = await IdentidadService.sincronizarUsuario(userId);
      res.json(usuario);
    } catch (error) {
      console.error('Error al sincronizar el usuario:', error);
      res.status(500).json({ error: 'Error al sincronizar usuario' });
    }
  }
};
