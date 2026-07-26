"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function ajouterDepense(formData) {
  const chantierId = String(formData.get("chantierId") || "").trim();
  const categorieId = String(formData.get("categorieId") || "").trim();
  const date = String(formData.get("date") || "").trim();
  const montantRaw = String(formData.get("montant") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const beneficiaire = String(formData.get("beneficiaire") || "").trim();
  const mode = String(formData.get("mode") || "Espèces").trim();
  const reference = String(formData.get("reference") || "").trim();
  const quantiteRaw = String(formData.get("quantite") || "").trim();
  const prixUnitaireRaw = String(formData.get("prixUnitaire") || "").trim();

  if (!chantierId || !categorieId || !date || !montantRaw) {
    throw new Error("Chantier, catégorie, date et montant sont obligatoires.");
  }

  const montant = Number(montantRaw);
  if (!Number.isFinite(montant) || montant <= 0) {
    throw new Error("Le montant doit être un nombre positif.");
  }

  await prisma.depense.create({
    data: {
      chantierId,
      categorieId,
      date,
      montant,
      description: description || null,
      beneficiaire: beneficiaire || null,
      mode: mode || "Espèces",
      reference: reference || null,
      quantite: quantiteRaw ? Number(quantiteRaw) : null,
      prixUnitaire: prixUnitaireRaw ? Number(prixUnitaireRaw) : null,
    },
  });

  revalidatePath(`/chantiers/${chantierId}`);
  revalidatePath("/chantiers");
}

export async function supprimerDepense(depenseId, chantierId) {
  await prisma.depense.delete({ where: { id: depenseId } });
  revalidatePath(`/chantiers/${chantierId}`);
  revalidatePath("/chantiers");
}
