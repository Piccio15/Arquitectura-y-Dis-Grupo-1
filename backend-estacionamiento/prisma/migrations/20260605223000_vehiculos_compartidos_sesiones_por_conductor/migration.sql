-- Vehiculos compartidos: un vehiculo puede estar asociado a varios conductores.
-- Las sesiones pasan a pertenecer al conductor que las inicio.

CREATE TABLE `conductorvehiculo` (
    `conductorId` INTEGER NOT NULL,
    `patente` VARCHAR(191) NOT NULL,
    `fecha_asociacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ConductorVehiculo_patente_fkey`(`patente`),
    PRIMARY KEY (`conductorId`, `patente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `conductorvehiculo` (`conductorId`, `patente`, `fecha_asociacion`)
SELECT `conductorId`, `patente`, CURRENT_TIMESTAMP(3)
FROM `vehiculo`;

ALTER TABLE `sesionestacionamiento`
    ADD COLUMN `conductorId` INTEGER NULL;

UPDATE `sesionestacionamiento` s
INNER JOIN `vehiculo` v ON v.`patente` = s.`patente`
SET s.`conductorId` = v.`conductorId`;

ALTER TABLE `sesionestacionamiento`
    MODIFY COLUMN `conductorId` INTEGER NOT NULL;

ALTER TABLE `vehiculo` DROP FOREIGN KEY `Vehiculo_conductorId_fkey`;
ALTER TABLE `vehiculo` DROP INDEX `Vehiculo_conductorId_fkey`;
ALTER TABLE `vehiculo` DROP COLUMN `conductorId`;

ALTER TABLE `conductorvehiculo`
    ADD CONSTRAINT `ConductorVehiculo_conductorId_fkey`
    FOREIGN KEY (`conductorId`) REFERENCES `conductor`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `conductorvehiculo`
    ADD CONSTRAINT `ConductorVehiculo_patente_fkey`
    FOREIGN KEY (`patente`) REFERENCES `vehiculo`(`patente`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `sesionestacionamiento`
    ADD INDEX `SesionEstacionamiento_conductorId_fkey`(`conductorId`);

ALTER TABLE `sesionestacionamiento`
    ADD CONSTRAINT `SesionEstacionamiento_conductorId_fkey`
    FOREIGN KEY (`conductorId`) REFERENCES `conductor`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;
