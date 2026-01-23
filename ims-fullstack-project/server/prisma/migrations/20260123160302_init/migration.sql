-- AlterTable
ALTER TABLE `gate_passes` ADD COLUMN `adminId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `gate_passes` ADD CONSTRAINT `gate_passes_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
