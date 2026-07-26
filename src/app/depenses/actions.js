"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";

export async function ajouterDepense(prevState, formData) {
  await requireSession();

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
    return { error: "Chantier, catégorie, date et montant sont obligatoires." };
  }

  const montant = Number(montantRaw);
  if (!Number.isFinite(montant) || montant <= 0) {
    return { error: "Le montant doit être un nombre supérieur à zéro." };
  }

  const chantier = await prisma.chantier.findUnique({ where: { id: chantierId } });
  if (!chantier) {
    return { error: "Ce chantier n'existe pas. Rechargez la page." };
  }

  const categorie = await prisma.categorie.findUnique({ where: { id: categorieId } });
  if (!categorie) {
    return { error: "Cette catégorie n'existe pas. Rechargez la page et réessayez." };
  }

  try {
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
  } catch {
    return { error: "Une erreur est survenue lors de l'enregistrement. Réessayez." };
  }

  revalidatePath(`/chantiers/${chantierId}`);
  revalidatePath("/chantiers");

  return { error: null, success: true };
}

export async function supprimerDepense(depenseId, chantierId) {
  await requireSession();
  await prisma.depense.delete({ where: { id: depenseId } });
  revalidatePath(`/chantiers/${chantierId}`);
  revalidatePath("/chantiers");
}
