-- AlterTable
ALTER TABLE `users` ADD COLUMN `hearts` INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE `exercises` ADD COLUMN `explanation_rule` TEXT NULL,
    ADD COLUMN `content` JSON NULL;
