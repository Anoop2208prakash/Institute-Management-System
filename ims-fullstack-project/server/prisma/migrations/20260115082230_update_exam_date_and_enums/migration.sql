/*
  Warnings:

  - You are about to alter the column `date` on the `exams` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.
  - You are about to alter the column `amount` on the `fee_records` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `status` on the `hostel_admissions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.

*/
-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `attendance_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `complaints` DROP FOREIGN KEY `complaints_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `loans` DROP FOREIGN KEY `loans_bookId_fkey`;

-- DropForeignKey
ALTER TABLE `results` DROP FOREIGN KEY `results_examId_fkey`;

-- DropForeignKey
ALTER TABLE `results` DROP FOREIGN KEY `results_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `test_submissions` DROP FOREIGN KEY `test_submissions_examId_fkey`;

-- DropForeignKey
ALTER TABLE `test_submissions` DROP FOREIGN KEY `test_submissions_studentId_fkey`;

-- AlterTable
ALTER TABLE `exams` MODIFY `date` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `fee_records` MODIFY `amount` DECIMAL(10, 2) NOT NULL;

-- AlterTable
ALTER TABLE `hostel_admissions` MODIFY `status` ENUM('OCCUPIED', 'VACATED') NOT NULL DEFAULT 'OCCUPIED';

-- CreateIndex
CREATE INDEX `exams_classId_subjectId_idx` ON `exams`(`classId`, `subjectId`);

-- AddForeignKey
ALTER TABLE `attendance` ADD CONSTRAINT `attendance_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `results` ADD CONSTRAINT `results_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `results` ADD CONSTRAINT `results_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loans` ADD CONSTRAINT `loans_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `complaints` ADD CONSTRAINT `complaints_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_submissions` ADD CONSTRAINT `test_submissions_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_submissions` ADD CONSTRAINT `test_submissions_examId_fkey` FOREIGN KEY (`examId`) REFERENCES `online_exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
