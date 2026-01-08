-- CreateTable
CREATE TABLE `mess_menus` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `breakfast` TEXT NOT NULL,
    `lunch` TEXT NOT NULL,
    `dinner` TEXT NOT NULL,
    `notes` TEXT NULL,
    `updatedBy` VARCHAR(191) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mess_menus_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mess_menus` ADD CONSTRAINT `mess_menus_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
