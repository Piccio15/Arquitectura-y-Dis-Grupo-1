/*
  Warnings:

  - You are about to drop the column `password` on the `usuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clerk_id]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerk_id` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `usuario` DROP COLUMN `password`,
    ADD COLUMN `clerk_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_clerk_id_key` ON `Usuario`(`clerk_id`);
