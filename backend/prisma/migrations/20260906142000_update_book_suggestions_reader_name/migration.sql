-- DropForeignKey
ALTER TABLE `Book_Suggestions` DROP FOREIGN KEY `Book_Suggestions_reader_code_fkey`;

-- AlterTable
ALTER TABLE `Book_Suggestions` ADD COLUMN `reader_name` VARCHAR(255) NULL,
    MODIFY `reader_code` VARCHAR(50) NULL;
