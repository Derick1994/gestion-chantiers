import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const CATEGORIES = [
  { libelle: "Maçon", type: "Main-d'œuvre" },
  { libelle: "Ferrailleur", type: "Main-d'œuvre" },
  { libelle: "Manœuvre", type: "Main-d'œuvre" },
  { libelle: "Menuisier", type: "Main-d'œuvre" },
  { libelle: "Électricien", type: "Main-d'œuvre" },
  { libelle: "Plombier", type: "Main-d'œuvre" },
  { libelle: "Ciment", type: "Matériaux" },
  { libelle: "Sable", type: "Matériaux" },
  { libelle: "Gravier", type: "Matériaux" },
  { libelle: "Fer", type: "Matériaux" },
  { libelle: "Eau", type: "Matériaux" },
  { libelle: "Transport", type: "Transport" },
  { libelle: "Location engin", type: "Location" },
  { libelle: "Divers", type: "Divers" },
];

async function main() {
  // Catégories (uniquement si la table est vide, pour ne pas dupliquer)
  const nbCategories = await prisma.categorie.count();
  if (nbCategories === 0) {
    for (let i = 0; i < CATEGORIES.length; i++) {
      await prisma.categorie.create({
        data: { ...CATEGORIES[i], ordre: i },
      });
    }
    console.log(`${CATEGORIES.length} catégories créées.`);
  }

  // Compte administrateur par défaut
  const admin = await prisma.utilisateur.findUnique({
    where: { identifiant: "admin" },
  });
  if (!admin) {
    const motDePasse = await bcrypt.hash("admin1234", 10);
    await prisma.utilisateur.create({
      data: {
        nom: "Administrateur",
        identifiant: "admin",
        motDePasse,
        role: "ADMIN",
      },
    });
    console.log("Compte admin créé (identifiant: admin / mot de passe: admin1234) — à changer.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
