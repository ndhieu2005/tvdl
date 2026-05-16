-- CreateTable
CREATE TABLE `Admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `Admins_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Age_Groups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `Age_Groups_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `age_group_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Locations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `color_code` VARCHAR(10) NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `Locations_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Readers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reader_code` VARCHAR(50) NOT NULL,
    `full_name` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `Readers_reader_code_key`(`reader_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Books` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `book_code` VARCHAR(50) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `author` VARCHAR(40) NOT NULL,
    `cover_url` VARCHAR(255) NULL,
    `location_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    UNIQUE INDEX `Books_book_code_key`(`book_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `New_Books` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `author` VARCHAR(255) NULL,
    `cover_image` VARCHAR(255) NULL,
    `short_description` TEXT NULL,
    `location_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Book_Suggestions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reader_code` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NULL,
    `book_name` VARCHAR(255) NULL,
    `category_id` INTEGER NULL,
    `age_group_id` INTEGER NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Schedule_Templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day_of_week` INTEGER NOT NULL,
    `shift` VARCHAR(20) NOT NULL,
    `time_frame` VARCHAR(50) NOT NULL,
    `location_id` INTEGER NOT NULL,
    `custom_location_name` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Schedules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `shift` VARCHAR(20) NOT NULL,
    `time_frame` VARCHAR(50) NOT NULL,
    `location_id` INTEGER NOT NULL,
    `custom_location_name` VARCHAR(255) NULL,
    `is_sudden_closed` BOOLEAN NOT NULL DEFAULT false,
    `closed_reason` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `event_datetime` DATETIME(3) NOT NULL,
    `location_id` INTEGER NULL,
    `target_age_group_id` INTEGER NULL,
    `seat_count` INTEGER NULL,
    `custom_location_name` VARCHAR(255) NULL,
    `organizer` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Categories` ADD CONSTRAINT `Categories_age_group_id_fkey` FOREIGN KEY (`age_group_id`) REFERENCES `Age_Groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Books` ADD CONSTRAINT `Books_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Books` ADD CONSTRAINT `Books_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `New_Books` ADD CONSTRAINT `New_Books_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `New_Books` ADD CONSTRAINT `New_Books_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Book_Suggestions` ADD CONSTRAINT `Book_Suggestions_reader_code_fkey` FOREIGN KEY (`reader_code`) REFERENCES `Readers`(`reader_code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Book_Suggestions` ADD CONSTRAINT `Book_Suggestions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Book_Suggestions` ADD CONSTRAINT `Book_Suggestions_age_group_id_fkey` FOREIGN KEY (`age_group_id`) REFERENCES `Age_Groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule_Templates` ADD CONSTRAINT `Schedule_Templates_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedules` ADD CONSTRAINT `Schedules_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Events` ADD CONSTRAINT `Events_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `Locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Events` ADD CONSTRAINT `Events_target_age_group_id_fkey` FOREIGN KEY (`target_age_group_id`) REFERENCES `Age_Groups`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
