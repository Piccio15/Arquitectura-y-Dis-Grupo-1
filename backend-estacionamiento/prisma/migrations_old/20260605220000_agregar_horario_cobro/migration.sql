CREATE TABLE `configuracionsistema` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `hora_inicio_cobro` VARCHAR(191) NOT NULL DEFAULT '08:00',
    `hora_fin_cobro` VARCHAR(191) NOT NULL DEFAULT '20:00',
    `actualizada_en` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `configuracionsistema` (`id`, `hora_inicio_cobro`, `hora_fin_cobro`, `actualizada_en`)
VALUES (1, '08:00', '20:00', CURRENT_TIMESTAMP(3));
