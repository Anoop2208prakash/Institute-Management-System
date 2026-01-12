/*
  Warnings:

  - You are about to drop the `mess_menus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `mess_menus` DROP FOREIGN KEY `mess_menus_updatedBy_fkey`;

-- DropTable
DROP TABLE `mess_menus`;
