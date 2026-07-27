"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { journaliser } from "@/lib/audit";
import { TEXTE_MAX } from "@/lib/validation";

const TYPES = ["Main-d'œuvre", "Matériaux", "Transport", "Location", "Divers"];

export async function creerCategorie(prevState, formData) {
  const session = await requireAdmin();

  const libelle = String(formData.get("libelle") || "").trim();
  const type = String(formData.get("type") || "").trim();

  if (!libelle || !type) {
    return { error: "Libellé et type sont obligatoires." };
  }
  if (libelle.length > TEXTE_MAX) {
    return { error: `Le libellé ne doit pas dépasser ${TEXTE_MAX} caractères.` };
  }
  if (!TYPES.includes(type)) {
    return { error: "Type invalide." };
  }

  const categorie = await prisma.categorie.create({
    data: { libelle, type, ordre: 999 },
  });

  await journaliser({
    session,
    action: "CREATION",
    entite: "Categorie",
    entiteId: categorie.id,
    entiteLibelle: `${libelle} (${type})`,
  });

  revalidatePath("/admin/categories");
  return { error: null, success: true };
}

export async function modifierCategorie(prevState, formData) {
  const session = await requireAdmin();

  const id = String(formData.get("id") || "").trim();
  const libelle = String(formData.get("libelle") || "").trim();
  const type = String(formData.get("type") || "").trim();

  if (!id || !libelle || !type) {
    return { error: "Libellé et type sont obligatoires." };
  }
  if (libelle.length > TEXTE_MAX) {
    return { error: `Le libellé ne doit pas dépasser ${TEXTE_MAX} caractères.` };
  }
  if (!TYPES.includes(type)) {
    return { error: "Type invalide." };
  }

  const categorie = await prisma.categorie.findUnique({ where: { id } });
  if (!categorie) {
    return { error: "Catégorie introuvable." };
  }

  const nbDepenses = await prisma.depense.count({ where: { categorieId: id } });

  await prisma.categorie.update({ where: { id }, data: { libelle, type } });

  await journaliser({
    session,
    action: "MODIFICATION",
    entite: "Categorie",
    entiteId: id,
    entiteLibelle: `${categorie.libelle} → ${libelle} (${nbDepenses} dépense${nbDepenses > 1 ? "s" : ""} concernée${nbDepenses > 1 ? "s" : ""})`,
    avant: { libelle: categorie.libelle, type: categorie.type },
    apres: { libelle, type },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/chantiers");
  return { error: null, success: true };
}

export async function toggleActifCategorie(categorieId) {
  const session = await requireAdmin();

  const categorie = await prisma.categorie.findUnique({ where: { id: categorieId } });
  if (!categorie) return;

  const nouveauStatut = !categorie.actif;
  await prisma.categorie.update({ where: { id: categorieId }, data: { actif: nouveauStatut } });

  await journaliser({
    session,
    action: nouveauStatut ? "REACTIVATION" : "ARCHIVAGE",
    entite: "Categorie",
    entiteId: categorieId,
    entiteLibelle: `${categorie.libelle} (${categorie.type})`,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/chantiers");
}
