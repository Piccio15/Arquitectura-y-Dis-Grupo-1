import { Request, Response } from 'express';
import {
  ConfiguracionService,
  ErrorConfiguracion
} from '../services/service-configuracion';
import { EstacionamientoService } from '../services/service-estacionamiento';

function responderError(res: Response, error: unknown) {
  if (error instanceof ErrorConfiguracion) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error('Error en configuracion:', error);
  res.status(500).json({ error: 'Error interno al gestionar configuracion' });
}

export const ConfiguracionController = {
  obtenerHorarioCobro: async (_req: Request, res: Response) => {
    try {
      const horario = await EstacionamientoService.obtenerEstadoHorarioCobro();
      res.json(horario);
    } catch (error) {
      responderError(res, error);
    }
  },

  actualizarHorarioCobro: async (req: Request, res: Response) => {
    try {
      await ConfiguracionService.actualizarHorarioCobro(req.body);
      const horario = await EstacionamientoService.obtenerEstadoHorarioCobro();

      res.json({
        mensaje: 'Horario de cobro actualizado correctamente',
        horario
      });
    } catch (error) {
      responderError(res, error);
    }
  }
};
