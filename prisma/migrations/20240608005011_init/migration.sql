-- CreateTable
CREATE TABLE `lines` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT '路線ID',
    `name` VARCHAR(191) NOT NULL COMMENT '路線名',
    `code` VARCHAR(191) NOT NULL COMMENT '路線コード',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '作成日時',
    `updated_at` DATETIME(3) NOT NULL COMMENT '更新日時',

    UNIQUE INDEX `lines_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '路線';

-- CreateTable
CREATE TABLE `stations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT '駅ID',
    `name` VARCHAR(191) NOT NULL COMMENT '駅名',
    `name_kana` VARCHAR(191) NOT NULL COMMENT '駅名(かな)',
    `code` VARCHAR(191) NOT NULL COMMENT '駅コード',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '作成日時',
    `updated_at` DATETIME(3) NOT NULL COMMENT '更新日時',

    UNIQUE INDEX `stations_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '駅';

-- CreateTable
CREATE TABLE `line_station_relation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `line_id` INTEGER NOT NULL COMMENT '路線ID',
    `station_id` INTEGER NOT NULL COMMENT '駅ID',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '作成日時',
    `updated_at` DATETIME(3) NOT NULL COMMENT '更新日時',

    UNIQUE INDEX `line_station_relation_line_id_station_id_key`(`line_id`, `station_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '路線・駅リレーション';

-- AddForeignKey
ALTER TABLE `line_station_relation` ADD CONSTRAINT `line_station_relation_line_id_fkey` FOREIGN KEY (`line_id`) REFERENCES `lines`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `line_station_relation` ADD CONSTRAINT `line_station_relation_station_id_fkey` FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
