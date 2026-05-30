import { getAuth } from '@clerk/express';
import { usuario_rol } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { ErrorSeguridad, SeguridadService } from '../services/service-seguridad';

declare global {
  namespace Express {
    interface Request {
      seguridad?: {
        clerkId: string;
        usuarioId?: number;
        rol?: usuario_rol;
      };
    }
  }
}

export function exigirAutenticacion(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: 'Autenticacion requerida' });
    return;
  }

  req.seguridad = { clerkId: userId };
  next();
}

export function exigirRoles(...rolesPermitidos: usuario_rol[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const clerkId = req.seguridad?.clerkId ?? getAuth(req).userId;

    if (!clerkId) {
      res.status(401).json({ error: 'Autenticacion requerida' });
      return;
    }

    try {
      const usuario = await SeguridadService.validarRoles(clerkId, rolesPermitidos);

      req.seguridad = {
        clerkId,
        usuarioId: usuario.id,
        rol: usuario.rol
      };
      next();
    } catch (error) {
      if (error instanceof ErrorSeguridad) {
        res.status(error.statusCode).json({
          error: error.message,
          ...(error.codigo && { codigo: error.codigo })
        });
        return;
      }

      console.error('Error al validar permisos:', error);
      res.status(500).json({ error: 'Error interno al validar permisos' });
    }
  };
}
