import { Request, Response } from 'express';
import {
  MercadoPagoAdapter,
  ErrorMercadoPago
} from '../adapters/adapter-mercadoPago';
import {
  BilleteraService,
  ErrorBilletera
} from '../services/service-billetera';

function responderError(res: Response, error: unknown) {
  if (error instanceof ErrorBilletera) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof ErrorMercadoPago) {
    console.error('Error de Mercado Pago:', error.message);
    res.status(502).json({ error: 'No se pudo procesar la solicitud de pago' });
    return;
  }

  console.error('Error al gestionar finanzas:', error);
  res.status(500).json({ error: 'Error interno al gestionar finanzas' });
}

function obtenerClerkId(req: Request) {
  const clerkId = req.seguridad?.clerkId;

  if (!clerkId) {
    throw new ErrorBilletera('Autenticacion requerida', 401);
  }

  return clerkId;
}

function obtenerQueryString(valor: unknown) {
  return typeof valor === 'string' ? valor : undefined;
}

export const FinanzasController = {
  obtenerSaldo: async (req: Request, res: Response) => {
    try {
      const saldo = await BilleteraService.obtenerSaldo(obtenerClerkId(req));
      res.json(saldo);
    } catch (error) {
      responderError(res, error);
    }
  },

  cargarSaldo: async (req: Request, res: Response) => {
    try {
      const preferencia = await BilleteraService.solicitarCargaSaldo(
        obtenerClerkId(req),
        Number(req.body?.monto)
      );
      res.status(201).json(preferencia);
    } catch (error) {
      responderError(res, error);
    }
  },

  listarMultas: async (req: Request, res: Response) => {
    try {
      const multas = await BilleteraService.listarMultas(obtenerClerkId(req));
      res.json(multas);
    } catch (error) {
      responderError(res, error);
    }
  },

  pagarMulta: async (req: Request, res: Response) => {
    try {
      const preferencia = await BilleteraService.solicitarPagoMulta(
        obtenerClerkId(req),
        Number(req.params.id)
      );
      res.status(201).json(preferencia);
    } catch (error) {
      responderError(res, error);
    }
  },

  recibirWebhookMercadoPago: async (req: Request, res: Response) => {
    const tipo = obtenerQueryString(req.query.type) ?? req.body?.type;
    const dataId = obtenerQueryString(req.query['data.id']) ?? req.body?.data?.id;
    const topicoIpn = obtenerQueryString(req.query.topic);
    const idIpn = obtenerQueryString(req.query.id);

    if (topicoIpn === 'payment' && idIpn) {
      try {
        const operacion = await BilleteraService.procesarPagoNotificado(idIpn);
        res.json({ recibido: true, procesado: true, operacion });
      } catch (error) {
        responderError(res, error);
      }
      return;
    }

    if (tipo !== 'payment' || typeof dataId !== 'string') {
      res.status(200).json({ recibido: true, procesado: false });
      return;
    }

    try {
      const firmaValida = MercadoPagoAdapter.validarFirmaWebhook({
        dataId,
        requestId: req.header('x-request-id'),
        signature: req.header('x-signature')
      });

      if (!firmaValida) {
        res.status(401).json({ error: 'Firma de webhook invalida' });
        return;
      }

      const operacion = await BilleteraService.procesarPagoNotificado(dataId);
      res.json({ recibido: true, procesado: true, operacion });
    } catch (error) {
      responderError(res, error);
    }
  }
};
