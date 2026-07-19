-- DropForeignKey
ALTER TABLE `Schedule_Templates` DROP FOREIGN KEY `Schedule_Templates_location_id_fkey`;

-- DropForeignKey
ALTER TABLE `Schedules` DROP FOREIGN KEY `Schedules_location_id_fkey`;

-- AlterTable
ALTER TABLE `Schedule_Templates` MODIFY `location_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `Schedules` MODIFY `location_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Schedule_Templates` ADD CONSTRAINT `Schedule_Templates_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedules` ADD CONSTRAINT `Schedules_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
