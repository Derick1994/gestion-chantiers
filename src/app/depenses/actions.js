"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import {
  dateEstPlausible,
  montantEstValide,
  MODES_PAIEMENT,
  TEXTE_MAX,
} from "@/lib/validation";

function lireEtValiderChamps(formData) {
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
  if (!dateEstPlausible(date)) {
    return { error: "La date de la dépense n'est pas valide." };
  }

  const montant = Number(montantRaw);
  if (!montantEstValide(montant)) {
    return {
      error:
        "Le montant doit être un nombre entier positif, sans décimales, et raisonnable.",
    };
  }

  if (!MODES_PAIEMENT.includes(mode)) {
    return { error: "Mode de paiement invalide." };
  }

  if (description.length > TEXTE_MAX || beneficiaire.length > TEXTE_MAX || reference.length > TEXTE_MAX) {
    return { error: `Les champs texte ne doivent pas dépasser ${TEXTE_MAX} caractères.` };
  }

  return {
    values: {
      chantierId,
      categorieId,
      date,
      montant,
      description: description || null,
      beneficiaire: beneficiaire || null,
      mode,
      reference: reference || null,
      quantite: quantiteRaw ? Number(quantiteRaw) : null,
      prixUnitaire: prixUnitaireRaw ? Number(prixUnitaireRaw) : null,
    },
  };
}

export async function ajouterDepense(prevState, formData) {
  await requireSession();

  const result = lireEtValiderChamps(formData);
  if (result.error) return { error: result.error };
  const { values } = result;

  const chantier = await prisma.chantier.findUnique({ where: { id: values.chantierId } });
  if (!chantier) {
    return { error: "Ce chantier n'existe pas. Rechargez la page." };
  }

  const categorie = await prisma.categorie.findUnique({ where: { id: values.categorieId } });
  if (!categorie) {
    return { error: "Cette catégorie n'existe pas. Rechargez la page et réessayez." };
  }

  try {
    await prisma.depense.create({ data: values });
  } catch {
    return { error: "Une erreur est survenue lors de l'enregistrement. Réessayez." };
  }

  revalidatePath(`/chantiers/${values.chantierId}`);
  revalidatePath("/chantiers");

  return { error: null, success: true };
}

export async function modifierDepense(prevState, formData) {
  await requireSession();

  const depenseId = String(formData.get("depenseId") || "").trim();
  if (!depenseId) {
    return { error: "Dépense introuvable." };
  }

  const result = lireEtValiderChamps(formData);
  if (result.error) return { error: result.error };
  const { values } = result;

  const categorie = await prisma.categorie.findUnique({ where: { id: values.categorieId } });
  if (!categorie) {
    return { error: "Cette catégorie n'existe pas. Rechargez la page et réessayez." };
  }

  try {
    await prisma.depense.update({ where: { id: depenseId }, data: values });
  } catch {
    return { error: "Une erreur est survenue lors de la modification. Réessayez." };
  }

  revalidatePath(`/chantiers/${values.chantierId}`);
  revalidatePath("/chantiers");

  return { error: null, success: true };
}

export async function supprimerDepense(depenseId, chantierId) {
  await requireSession();
  await prisma.depense.delete({ where: { id: depenseId } });
  revalidatePath(`/chantiers/${chantierId}`);
  revalidatePath("/chantiers");
}
