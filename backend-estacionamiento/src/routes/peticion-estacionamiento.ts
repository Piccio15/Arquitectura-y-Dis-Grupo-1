import { Router } from 'express';
import { EstacionamientoController } from '../controllers/controller-estacionamiento';
import { exigirAutenticacion, exigirRoles } from '../middlewares/seguridad';

export const peticionEstacionamiento = Router();

peticionEstacionamiento.use(exigirAutenticacion);
peticionEstacionamiento.use(exigirRoles('CONDUCTOR'));
peticionEstacionamiento.post('/cotizar', EstacionamientoController.cotizarSesion);
peticionEstacionamiento.post('/iniciar', EstacionamientoController.iniciarSesion);
peticionEstacionamiento.get('/activas', EstacionamientoController.listarSesionesActivas);
peticionEstacionamiento.put('/:id/finalizar', EstacionamientoController.finalizarSesion);
