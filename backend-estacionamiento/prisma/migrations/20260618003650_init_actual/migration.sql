-- CreateTable
CREATE TABLE `conductor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `saldo` DOUBLE NOT NULL DEFAULT 0,
    `usuarioId` INTEGER NOT NULL,

    UNIQUE INDEX `Conductor_usuarioId_key`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configuracionsistema` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `hora_inicio_cobro` VARCHAR(191) NOT NULL DEFAULT '08:00',
    `hora_fin_cobro` VARCHAR(191) NOT NULL DEFAULT '20:00',
    `actualizada_en` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inspector` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `legajo` VARCHAR(191) NOT NULL,
    `usuarioId` INTEGER NOT NULL,

    UNIQUE INDEX `Inspector_legajo_key`(`legajo`),
    UNIQUE INDEX `Inspector_usuarioId_key`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `multa` (
    `id_multa` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ubicacion` VARCHAR(191) NOT NULL,
    `monto` DOUBLE NOT NULL,
    `estado` ENUM('PENDIENTE', 'PAGADA', 'ANULADA') NOT NULL DEFAULT 'PENDIENTE',
    `inspectorId` INTEGER NOT NULL,
    `patente` VARCHAR(191) NOT NULL,

    INDEX `Multa_inspectorId_fkey`(`inspectorId`),
    INDEX `Multa_patente_fkey`(`patente`),
    PRIMARY KEY (`id_multa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `operacionpago` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('CARGA_SALDO', 'PAGO_MULTA') NOT NULL,
    `estado` ENUM('PENDIENTE', 'APROBADA', 'RECHAZADA', 'FALLIDA') NOT NULL DEFAULT 'PENDIENTE',
    `monto` DOUBLE NOT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NOT NULL,
    `conductorId` INTEGER NOT NULL,
    `multaId` INTEGER NULL,
    `mercadoPagoPreferenceId` VARCHAR(191) NULL,
    `mercadoPagoPaymentId` VARCHAR(191) NULL,

    UNIQUE INDEX `OperacionPago_mercadoPagoPreferenceId_key`(`mercadoPagoPreferenceId`),
    UNIQUE INDEX `OperacionPago_mercadoPagoPaymentId_key`(`mercadoPagoPaymentId`),
    INDEX `OperacionPago_conductorId_fkey`(`conductorId`),
    INDEX `OperacionPago_multaId_fkey`(`multaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sesionestacionamiento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha_inicio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_fin` DATETIME(3) NULL,
    `costo_cobrado` DOUBLE NULL,
    `patente` VARCHAR(191) NOT NULL,
    `zonaId` INTEGER NOT NULL,
    `conductorId` INTEGER NOT NULL,

    INDEX `SesionEstacionamiento_conductorId_fkey`(`conductorId`),
    INDEX `SesionEstacionamiento_patente_fkey`(`patente`),
    INDEX `SesionEstacionamiento_zonaId_fkey`(`zonaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `dni` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `rol` ENUM('CONDUCTOR', 'INSPECTOR', 'ADMINISTRADOR') NOT NULL DEFAULT 'CONDUCTOR',
    `clerk_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Usuario_dni_key`(`dni`),
    UNIQUE INDEX `Usuario_email_key`(`email`),
    UNIQUE INDEX `Usuario_clerk_id_key`(`clerk_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehiculo` (
    `patente` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`patente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conductorvehiculo` (
    `conductorId` INTEGER NOT NULL,
    `patente` VARCHAR(191) NOT NULL,
    `fecha_asociacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ConductorVehiculo_patente_fkey`(`patente`),
    PRIMARY KEY (`conductorId`, `patente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zona` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `calles` VARCHAR(191) NOT NULL,
    `coordenadas` JSON NOT NULL,
    `precio_hora` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `conductor` ADD CONSTRAINT `Conductor_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inspector` ADD CONSTRAINT `Inspector_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `multa` ADD CONSTRAINT `Multa_inspectorId_fkey` FOREIGN KEY (`inspectorId`) REFERENCES `inspector`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `multa` ADD CONSTRAINT `Multa_patente_fkey` FOREIGN KEY (`patente`) REFERENCES `vehiculo`(`patente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `operacionpago` ADD CONSTRAINT `OperacionPago_conductorId_fkey` FOREIGN KEY (`conductorId`) REFERENCES `conductor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `operacionpago` ADD CONSTRAINT `OperacionPago_multaId_fkey` FOREIGN KEY (`multaId`) REFERENCES `multa`(`id_multa`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sesionestacionamiento` ADD CONSTRAINT `SesionEstacionamiento_patente_fkey` FOREIGN KEY (`patente`) REFERENCES `vehiculo`(`patente`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sesionestacionamiento` ADD CONSTRAINT `SesionEstacionamiento_zonaId_fkey` FOREIGN KEY (`zonaId`) REFERENCES `zona`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sesionestacionamiento` ADD CONSTRAINT `SesionEstacionamiento_conductorId_fkey` FOREIGN KEY (`conductorId`) REFERENCES `conductor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conductorvehiculo` ADD CONSTRAINT `ConductorVehiculo_conductorId_fkey` FOREIGN KEY (`conductorId`) REFERENCES `conductor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conductorvehiculo` ADD CONSTRAINT `ConductorVehiculo_patente_fkey` FOREIGN KEY (`patente`) REFERENCES `vehiculo`(`patente`) ON DELETE RESTRICT ON UPDATE CASCADE;
