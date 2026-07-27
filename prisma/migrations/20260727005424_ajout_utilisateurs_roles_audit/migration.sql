-- AlterTable
ALTER TABLE `Categorie` ADD COLUMN `actif` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `Chantier` ADD COLUMN `archive` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Utilisateur` ADD COLUMN `doitChangerMotDePasse` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `JournalAudit` (
    `id` VARCHAR(191) NOT NULL,
    `dateHeure` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `acteurId` VARCHAR(191) NULL,
    `acteurNom` VARCHAR(191) NOT NULL,
    `acteurRole` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `entite` VARCHAR(191) NOT NULL,
    `entiteId` VARCHAR(191) NULL,
    `entiteLibelle` VARCHAR(191) NOT NULL,
    `avant` JSON NULL,
    `apres` JSON NULL,

    INDEX `JournalAudit_dateHeure_idx`(`dateHeure`),
    INDEX `JournalAudit_entite_entiteId_idx`(`entite`, `entiteId`),
    INDEX `JournalAudit_acteurId_idx`(`acteurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
