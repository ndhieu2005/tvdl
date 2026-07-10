-- AlterTable
ALTER TABLE `Events` ADD COLUMN `color` VARCHAR(10) NULL,
    ADD COLUMN `end_datetime` DATETIME(3) NULL,
    ADD COLUMN `is_featured` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `New_Books` ADD COLUMN `book_code` VARCHAR(50) NULL,
    ADD COLUMN `page_count` INTEGER NULL,
    ADD COLUMN `publish_year` INTEGER NULL,
    ADD COLUMN `publisher` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `Posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `summary` TEXT NULL,
    `content` LONGTEXT NOT NULL,
    `cover_image` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `Posts_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
