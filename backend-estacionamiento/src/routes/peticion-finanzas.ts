import { Router } from 'express';
import { FinanzasController } from '../controllers/controller-finanzas';
import { exigirAutenticacion, exigirRoles } from '../middlewares/seguridad';

export const peticionFinanzas = Router();

peticionFinanzas.post(
  '/webhooks/mercadopago',
  FinanzasController.recibirWebhookMercadoPago
);

peticionFinanzas.use(exigirAutenticacion);
peticionFinanzas.use(exigirRoles('CONDUCTOR'));
peticionFinanzas.get('/saldo', FinanzasController.obtenerSaldo);
peticionFinanzas.post('/cargas', FinanzasController.cargarSaldo);
peticionFinanzas.get('/multas', FinanzasController.listarMultas);
peticionFinanzas.post('/multas/:id/pagar', FinanzasController.pagarMulta);
