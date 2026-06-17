import { getAuth } from '@clerk/express';
import { Request, Response } from 'express';
import { ErrorVehiculo, VehiculoService } from '../services/service-vehiculo';

function responderError(res: Response, error: unknown) {
  if (error instanceof ErrorVehiculo) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error('Error en vehiculos:', error);
  res.status(500).json({ error: 'Error interno' });
}

export const VehiculoController = {
  listar: async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: 'Autenticacion requerida' });
      return;
    }

    try {
      const vehiculos = await VehiculoService.listarVehiculos(userId);
      res.json(vehiculos);
    } catch (error) {
      responderError(res, error);
    }
  },

  registrar: async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: 'Autenticacion requerida' });
      return;
    }

    try {
      const vehiculo = await VehiculoService.registrarVehiculo(userId, req.body?.patente);
      res.status(201).json(vehiculo);
    } catch (error) {
      responderError(res, error);
    }
  },

  eliminar: async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: 'Autenticacion requerida' });
      return;
    }

    try {
      await VehiculoService.eliminarVehiculo(userId, String(req.params.patente));
      res.json({ mensaje: 'Vehiculo eliminado' });
    } catch (error) {
      responderError(res, error);
    }
  }
};
