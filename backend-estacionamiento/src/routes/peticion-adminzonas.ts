import { Router } from 'express';
import { AdminZonasController } from '../controllers/controller-adminzonas';
import { exigirAutenticacion, exigirRoles } from '../middlewares/seguridad';

export const peticionAdminZonas = Router();

peticionAdminZonas.get('/', exigirAutenticacion, exigirRoles('CONDUCTOR', 'INSPECTOR', 'ADMINISTRADOR'), AdminZonasController.listar);
peticionAdminZonas.post('/', exigirAutenticacion, exigirRoles('ADMINISTRADOR'), AdminZonasController.crear);
peticionAdminZonas.put('/:id', exigirAutenticacion, exigirRoles('ADMINISTRADOR'), AdminZonasController.actualizar);
peticionAdminZonas.delete('/:id', exigirAutenticacion, exigirRoles('ADMINISTRADOR'), AdminZonasController.eliminar);