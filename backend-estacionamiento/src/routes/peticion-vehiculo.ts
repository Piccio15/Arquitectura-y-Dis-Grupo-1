import { Router } from 'express';
import { VehiculoController } from '../controllers/controller-vehiculo';
import { exigirAutenticacion, exigirRoles } from '../middlewares/seguridad';

export const peticionVehiculo = Router();

peticionVehiculo.use(exigirAutenticacion);
peticionVehiculo.use(exigirRoles('CONDUCTOR'));
peticionVehiculo.get('/', VehiculoController.listar);
peticionVehiculo.post('/', VehiculoController.registrar);
peticionVehiculo.delete('/:patente', VehiculoController.eliminar);