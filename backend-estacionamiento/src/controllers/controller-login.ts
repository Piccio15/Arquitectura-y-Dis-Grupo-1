import { getAuth } from '@clerk/express';
import { Request, Response } from 'express';
import { ErrorIdentidad, IdentidadService } from '../services/service-identidad';

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
  },

  convertirEnInspector: async (req: Request, res: Response) => {
    try {
      const usuario = await IdentidadService.convertirEnInspector(req.body.email);

      res.json({
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        inspector: usuario.inspector
      });
    } catch (error) {
      if (error instanceof ErrorIdentidad) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }

      console.error('Error al convertir usuario en inspector:', error);
      res.status(500).json({ error: 'Error al convertir usuario en inspector' });
    }
  }
};
