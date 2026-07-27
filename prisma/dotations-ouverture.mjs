// Script à exécuter UNE SEULE FOIS après le déploiement de la caisse générale.
// Pour chaque chantier qui a déjà des dépenses mais aucune dotation enregistrée,
// crée une paire Entrée/Dotation d'ouverture égale à son total déjà dépensé,
// afin qu'il démarre avec un solde disponible à zéro plutôt que négatif.
// N'affecte pas le solde net de la caisse générale (l'entrée compense la dotation).
//
// Usage : node --import tsx prisma/dotations-ouverture.mjs

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  const chantiers = await prisma.chantier.findMany({
    include: { depenses: { select: { montant: true } } },
  });

  const today = new Date().toISOString().slice(0, 10);
  let nbTraites = 0;

  for (const chantier of chantiers) {
    const nbDotations = await prisma.mouvement.count({
      where: { chantierId: chantier.id, type: "DOTATION" },
    });
    if (nbDotations > 0) continue;

    const totalDepense = chantier.depenses.reduce((s, d) => s + d.montant, 0);
    if (totalDepense <= 0) continue;

    await prisma.mouvement.create({
      data: {
        type: "ENTREE",
        montant: totalDepense,
        date: today,
        note: `Entrée d'ouverture (reprise historique — ${chantier.nom})`,
      },
    });
    await prisma.mouvement.create({
      data: {
        type: "DOTATION",
        montant: totalDepense,
        date: today,
        chantierId: chantier.id,
        note: "Dotation d'ouverture (reprise historique)",
      },
    });

    console.log(`${chantier.nom} : dotation d'ouverture de ${totalDepense} FCFA créée.`);
    nbTraites++;
  }

  console.log(`${nbTraites} chantier(s) traité(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
