/*
  Warnings:

  - You are about to drop the column `coordenadas` on the `zona` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `operacionpago` DROP FOREIGN KEY `OperacionPago_multaId_fkey`;

-- AlterTable
ALTER TABLE `zona` DROP COLUMN `coordenadas`;

-- AddForeignKey
ALTER TABLE `operacionpago` ADD CONSTRAINT `OperacionPago_multaId_fkey` FOREIGN KEY (`multaId`) REFERENCES `multa`(`id_multa`) ON DELETE SET NULL ON UPDATE CASCADE;
