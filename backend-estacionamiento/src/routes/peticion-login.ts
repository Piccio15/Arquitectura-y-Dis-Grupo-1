import { Router } from 'express';
import { LoginController } from '../controllers/controller-login';
import { exigirAutenticacion, exigirRoles } from '../middlewares/seguridad';

export const peticionLogin = Router();

peticionLogin.post('/usuarios/sync', exigirAutenticacion, LoginController.sincronizarUsuario);
peticionLogin.post(
  '/usuarios/asignar-inspector',
  exigirAutenticacion,
  exigirRoles('ADMINISTRADOR'),
  LoginController.convertirEnInspector
);
