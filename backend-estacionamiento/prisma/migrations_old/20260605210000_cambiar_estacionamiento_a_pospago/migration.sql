-- El estacionamiento pasa a modalidad pospago:
-- la duracion estimada deja de ser requerida y el costo se cobra al finalizar.
ALTER TABLE `SesionEstacionamiento`
    MODIFY COLUMN `duracion_estimada_minutos` INTEGER NULL,
    MODIFY COLUMN `costo_cobrado` DOUBLE NULL;
