import { Router } from 'express';
import { InspectorController } from '../controllers/controller-inspector';
import { exigirAutenticacion, exigirRoles } from '../middlewares/seguridad';

export const peticionInspector = Router();

peticionInspector.use(exigirAutenticacion);
peticionInspector.use(exigirRoles('INSPECTOR'));
peticionInspector.get('/multas', InspectorController.listarMultas);
peticionInspector.get('/multas/:id', InspectorController.obtenerDetalleMulta);
peticionInspector.get('/verificar/:patente', InspectorController.verificarPatente);
peticionInspector.post('/multas', InspectorController.emitirMulta);
