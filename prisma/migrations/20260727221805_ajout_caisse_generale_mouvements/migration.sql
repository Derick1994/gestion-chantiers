-- CreateTable
CREATE TABLE `Mouvement` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `montant` DOUBLE NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `chantierId` VARCHAR(191) NULL,
    `beneficiaire` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `auteurId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Mouvement_chantierId_idx`(`chantierId`),
    INDEX `Mouvement_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Mouvement` ADD CONSTRAINT `Mouvement_chantierId_fkey` FOREIGN KEY (`chantierId`) REFERENCES `Chantier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mouvement` ADD CONSTRAINT `Mouvement_auteurId_fkey` FOREIGN KEY (`auteurId`) REFERENCES `Utilisateur`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
