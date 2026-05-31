import { Request, Response } from 'express';
import { ErrorZona, ZonaService } from '../services/service-zonas';

function responderError(res: Response, error: unknown) {
  if (error instanceof ErrorZona) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }
  console.error('Error en zonas:', error);
  res.status(500).json({ error: 'Error interno al gestionar zonas' });
}

export const AdminZonasController = {
  listar: async (_req: Request, res: Response) => {
    try {
      res.json(await ZonaService.listarZonas());
    } catch (error) { responderError(res, error); }
  },

  crear: async (req: Request, res: Response) => {
    try {
      const zona = await ZonaService.crearZona(req.body);
      res.status(201).json({ mensaje: 'Zona creada con éxito', zona });
    } catch (error) { responderError(res, error); }
  },

  actualizar: async (req: Request, res: Response) => {
    try {
      const zona = await ZonaService.actualizarZona(Number(req.params.id), req.body);
      res.json({ mensaje: 'Zona actualizada con éxito', zona });
    } catch (error) { responderError(res, error); }
  },

  eliminar: async (req: Request, res: Response) => {
    try {
      await ZonaService.eliminarZona(Number(req.params.id));
      res.json({ mensaje: 'Zona eliminada correctamente' });
    } catch (error) { responderError(res, error); }
  }
};