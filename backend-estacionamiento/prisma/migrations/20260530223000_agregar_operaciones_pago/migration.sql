-- CreateTable
CREATE TABLE `OperacionPago` (
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

-- AddForeignKey
ALTER TABLE `OperacionPago` ADD CONSTRAINT `OperacionPago_conductorId_fkey` FOREIGN KEY (`conductorId`) REFERENCES `Conductor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OperacionPago` ADD CONSTRAINT `OperacionPago_multaId_fkey` FOREIGN KEY (`multaId`) REFERENCES `Multa`(`id_multa`) ON DELETE RESTRICT ON UPDATE CASCADE;
