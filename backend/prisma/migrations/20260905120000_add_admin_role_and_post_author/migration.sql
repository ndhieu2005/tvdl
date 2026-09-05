-- AlterTable
ALTER TABLE `Admins` ADD COLUMN `name` VARCHAR(100) NULL,
    ADD COLUMN `role` VARCHAR(20) NOT NULL DEFAULT 'admin';

-- AlterTable
ALTER TABLE `Posts` ADD COLUMN `author_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Posts` ADD CONSTRAINT `Posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `Admins`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
