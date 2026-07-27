import { prisma } from "./db";

async function sommeMouvement(type, chantierId) {
  const where = chantierId === undefined ? { type } : { type, chantierId };
  const res = await prisma.mouvement.aggregate({ where, _sum: { montant: true } });
  return res._sum.montant || 0;
}

export async function soldeCaisseGenerale() {
  const [entrees, dotations, retours, sorties, depensesGenerales] = await Promise.all([
    sommeMouvement("ENTREE"),
    sommeMouvement("DOTATION"),
    sommeMouvement("RETOUR"),
    sommeMouvement("SORTIE_EXTERNE"),
    sommeMouvement("DEPENSE_GENERALE"),
  ]);
  return entrees + retours - dotations - sorties - depensesGenerales;
}

export async function soldeChantier(chantierId) {
  const [dotations, retours, depenseRes] = await Promise.all([
    sommeMouvement("DOTATION", chantierId),
    sommeMouvement("RETOUR", chantierId),
    prisma.depense.aggregate({ where: { chantierId }, _sum: { montant: true } }),
  ]);
  const dote = dotations - retours;
  const depense = depenseRes._sum.montant || 0;
  return { dote, depense, disponible: dote - depense };
}
