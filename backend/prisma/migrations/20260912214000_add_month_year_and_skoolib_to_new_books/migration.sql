-- AlterTable
ALTER TABLE `New_Books` ADD COLUMN `is_featured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `month_year` VARCHAR(7) NULL,
    ADD COLUMN `skoolib_url` TEXT NULL;
