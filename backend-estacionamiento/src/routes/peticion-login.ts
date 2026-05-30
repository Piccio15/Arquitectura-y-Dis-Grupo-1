import { Router } from 'express';
import { LoginController } from '../controllers/controller-login';
import { exigirAutenticacion } from '../middlewares/seguridad';

export const peticionLogin = Router();

peticionLogin.post('/usuarios/sync', exigirAutenticacion, LoginController.sincronizarUsuario);
