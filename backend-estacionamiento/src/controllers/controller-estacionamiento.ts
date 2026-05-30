import { getAuth } from '@clerk/express';
import { Request, Response } from 'express';
import {
  ErrorEstacionamiento,
  EstacionamientoService
} from '../services/service-estacionamiento';

function responderError(res: Response, error: unknown) {
  if (error instanceof ErrorEstacionamiento) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error('Error al gestionar estacionamiento:', error);
  res.status(500).json({ error: 'Error interno al gestionar estacionamiento' });
}

export const EstacionamientoController = {
  cotizarSesion: async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: 'Autenticacion requerida' });
      return;
    }

    try {
      const cotizacion = await EstacionamientoService.cotizarSesion(userId, req.body);
      res.json(cotizacion);
    } catch (error) {
      responderError(res, error);
    }
  },

  iniciarSesion: async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: 'Autenticacion requerida' });
      return;
    }

    try {
      const sesion = await EstacionamientoService.iniciarSesion(userId, req.body);
      res.status(201).json(sesion);
    } catch (error) {
      responderError(res, error);
    }
  },

  listarSesionesActivas: async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: 'Autenticacion requerida' });
      return;
    }

    try {
      const sesiones = await EstacionamientoService.listarSesionesActivas(userId);
      res.json(sesiones);
    } catch (error) {
      responderError(res, error);
    }
  },

  finalizarSesion: async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: 'Autenticacion requerida' });
      return;
    }

    try {
      const comprobante = await EstacionamientoService.finalizarSesion(
        userId,
        Number(req.params.id)
      );
      res.json(comprobante);
    } catch (error) {
      responderError(res, error);
    }
  }
};
