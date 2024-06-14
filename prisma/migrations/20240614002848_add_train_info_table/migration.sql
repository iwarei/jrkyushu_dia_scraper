-- CreateTable
CREATE TABLE `train_infos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT '列車情報ID',
    `shinkansen_flg` BOOLEAN NOT NULL COMMENT '新幹線フラグ',
    `kind` VARCHAR(191) NULL COMMENT '列車種別',
    `name` VARCHAR(191) NULL COMMENT '列車名',
    `code` VARCHAR(191) NOT NULL COMMENT '列車コード',
    `number` VARCHAR(191) NOT NULL COMMENT '列車番号',
    `facility` VARCHAR(191) NULL COMMENT '列車設備',
    `drive_day` VARCHAR(191) NOT NULL COMMENT '運転日',
    `remarks` VARCHAR(191) NULL COMMENT '備考',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '作成日時',
    `updated_at` DATETIME(3) NOT NULL COMMENT '更新日時',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '列車情報';

-- CreateTable
CREATE TABLE `train_stop_stations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT COMMENT '列車停車駅ID',
    `train_id` INTEGER NOT NULL,
    `station_id` INTEGER NOT NULL COMMENT '駅ID',
    `arrive_time` VARCHAR(191) NULL COMMENT '着時刻',
    `departure_time` VARCHAR(191) NULL COMMENT '発時刻',
    `passing_flag` BOOLEAN NOT NULL COMMENT '通過フラグ',
    `platform` VARCHAR(191) NULL COMMENT 'のりば',
    `order` INTEGER NOT NULL COMMENT '停車順',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '作成日時',
    `updated_at` DATETIME(3) NOT NULL COMMENT '更新日時',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '列車停車駅';
