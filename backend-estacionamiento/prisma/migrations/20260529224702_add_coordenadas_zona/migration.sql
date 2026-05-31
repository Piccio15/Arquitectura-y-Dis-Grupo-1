/*
  Warnings:

  - Added the required column `coordenadas` to the `zona` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `zona` ADD COLUMN `coordenadas` JSON NOT NULL;
