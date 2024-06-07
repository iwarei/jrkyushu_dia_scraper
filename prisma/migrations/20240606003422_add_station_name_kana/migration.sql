/*
  Warnings:

  - Added the required column `nameKane` to the `Station` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Station` ADD COLUMN `nameKane` VARCHAR(191) NOT NULL;
