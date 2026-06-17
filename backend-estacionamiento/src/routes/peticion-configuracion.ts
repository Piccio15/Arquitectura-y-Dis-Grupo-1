import { Router } from 'express';
import { ConfiguracionController } from '../controllers/controller-configuracion';
import { exigirAutenticacion, exigirRoles } from '../middlewares/seguridad';

export const peticionConfiguracion = Router();

peticionConfiguracion.get(
  '/horario-cobro',
  exigirAutenticacion,
  exigirRoles('CONDUCTOR', 'INSPECTOR', 'ADMINISTRADOR'),
  ConfiguracionController.obtenerHorarioCobro
);

peticionConfiguracion.put(
  '/horario-cobro',
  exigirAutenticacion,
  exigirRoles('ADMINISTRADOR'),
  ConfiguracionController.actualizarHorarioCobro
);
