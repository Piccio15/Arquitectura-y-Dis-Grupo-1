import { getAuth } from '@clerk/express';
import { Request, Response } from 'express';
import { ErrorInspector, InspectorService } from '../services/service-inspector';

function responderError(res: Response, error: unknown) {
  if (error instanceof ErrorInspector) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }
  console.error('Error en inspector:', error);
  res.status(500).json({ error: 'Error interno al gestionar inspección' });
}

export const InspectorController = {
  listarMultas: async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: 'Autenticacion requerida' }); return; }

    try {
      const resultado = await InspectorService.listarMultas(userId, {
        q: req.query.q,
        estado: req.query.estado,
        fechaDesde: req.query.fechaDesde,
        fechaHasta: req.query.fechaHasta,
        pagina: req.query.pagina,
        limite: req.query.limite
      });

      res.json(resultado);
    } catch (error) { responderError(res, error); }
  },

  obtenerDetalleMulta: async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: 'Autenticacion requerida' }); return; }

    try {
      const multa = await InspectorService.obtenerDetalleMulta(userId, Number(req.params.id));
      res.json(multa);
    } catch (error) { responderError(res, error); }
  },

  verificarPatente: async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: 'Autenticacion requerida' }); return; }
    try {
      const resultado = await InspectorService.verificarPatente(
        userId,
        String(req.params.patente)
      );
      res.json(resultado);
    } catch (error) { responderError(res, error); }
  },

  emitirMulta: async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) { res.status(401).json({ error: 'Autenticacion requerida' }); return; }
    try {
      const multa = await InspectorService.emitirMulta(userId, {
        patente: String(req.body.patente),
        ubicacion: String(req.body.ubicacion ?? ''),
        monto: Number(req.body.monto),
        motivo: String(req.body.motivo ?? 'Sin sesión activa'),
      });
      res.status(201).json(multa);
    } catch (error) { responderError(res, error); }
  }
};
