-- AlterTable
ALTER TABLE `SesionEstacionamiento`
    ADD COLUMN `duracion_estimada_minutos` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `costo_cobrado` DOUBLE NOT NULL DEFAULT 0;

ALTER TABLE `SesionEstacionamiento`
    ALTER COLUMN `duracion_estimada_minutos` DROP DEFAULT,
    ALTER COLUMN `costo_cobrado` DROP DEFAULT;
