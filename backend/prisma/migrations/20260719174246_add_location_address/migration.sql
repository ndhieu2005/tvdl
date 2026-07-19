-- AlterTable
ALTER TABLE `Locations` ADD COLUMN `address` VARCHAR(255) NULL;

-- Backfill dia chi 2 co so (ap dung ca local lan VPS khi migrate deploy)
UPDATE `Locations` SET `address` = '18/56 Đường Thống Nhất, Thôn Thống Nhất, Dương Hòa, TP Hà Nội' WHERE `name` = 'Cơ sở 1';
UPDATE `Locations` SET `address` = '28 Đường Thanh Niên, Thôn Me Táo, Dương Hòa, TP Hà Nội' WHERE `name` = 'Cơ sở 2';
