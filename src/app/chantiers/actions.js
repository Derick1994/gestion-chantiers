"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { journaliser } from "@/lib/audit";
import { dateEstPlausible, budgetEstValide, TEXTE_MAX } from "@/lib/validation";

export async function creerChantier(prevState, formData) {
  const session = await requireSession();

  const nom = String(formData.get("nom") || "").trim();
  const lieu = String(formData.get("lieu") || "").trim();
  const dateDebut = String(formData.get("dateDebut") || "").trim();
  const budgetRaw = String(formData.get("budget") || "").trim();

  if (!nom || !lieu || !dateDebut) {
    return { error: "Nom, lieu et date de début sont obligatoires." };
  }
  if (nom.length > TEXTE_MAX) {
    return { error: `Le nom du chantier ne doit pas dépasser ${TEXTE_MAX} caractères.` };
  }
  if (lieu.length > TEXTE_MAX) {
    return { error: `Le lieu ne doit pas dépasser ${TEXTE_MAX} caractères.` };
  }
  if (!dateEstPlausible(dateDebut)) {
    return { error: "La date de début n'est pas valide." };
  }

  let budget = null;
  if (budgetRaw) {
    budget = Number(budgetRaw);
    if (!budgetEstValide(budget)) {
      return { error: "Le budget doit être un nombre entier positif et raisonnable." };
    }
  }

  const chantier = await prisma.chantier.create({
    data: { nom, lieu, dateDebut, budget },
  });

  await journaliser({
    session,
    action: "CREATION",
    entite: "Chantier",
    entiteId: chantier.id,
    entiteLibelle: chantier.nom,
    apres: { nom, lieu, dateDebut, budget },
  });

  revalidatePath("/chantiers");
  redirect(`/chantiers/${chantier.id}`);
}

export async function modifierChantier(prevState, formData) {
  const session = await requireSession();

  const id = String(formData.get("id") || "").trim();
  const nom = String(formData.get("nom") || "").trim();
  const lieu = String(formData.get("lieu") || "").trim();
  const dateDebut = String(formData.get("dateDebut") || "").trim();
  const budgetRaw = String(formData.get("budget") || "").trim();

  if (!id || !nom || !lieu || !dateDebut) {
    return { error: "Nom, lieu et date de début sont obligatoires." };
  }
  if (nom.length > TEXTE_MAX) {
    return { error: `Le nom du chantier ne doit pas dépasser ${TEXTE_MAX} caractères.` };
  }
  if (lieu.length > TEXTE_MAX) {
    return { error: `Le lieu ne doit pas dépasser ${TEXTE_MAX} caractères.` };
  }
  if (!dateEstPlausible(dateDebut)) {
    return { error: "La date de début n'est pas valide." };
  }

  let budget = null;
  if (budgetRaw) {
    budget = Number(budgetRaw);
    if (!budgetEstValide(budget)) {
      return { error: "Le budget doit être un nombre entier positif et raisonnable." };
    }
  }

  const chantierAvant = await prisma.chantier.findUnique({ where: { id } });
  if (!chantierAvant) {
    return { error: "Ce chantier n'existe pas." };
  }

  await prisma.chantier.update({
    where: { id },
    data: { nom, lieu, dateDebut, budget },
  });

  await journaliser({
    session,
    action: "MODIFICATION",
    entite: "Chantier",
    entiteId: id,
    entiteLibelle: nom,
    avant: {
      nom: chantierAvant.nom,
      lieu: chantierAvant.lieu,
      dateDebut: chantierAvant.dateDebut,
      budget: chantierAvant.budget,
    },
    apres: { nom, lieu, dateDebut, budget },
  });

  revalidatePath("/chantiers");
  revalidatePath(`/chantiers/${id}`);
  return { error: null, success: true };
}

export async function changerStatutChantier(chantierId, statut) {
  const session = await requireSession();
  if (!["En cours", "Terminé"].includes(statut)) return;

  await prisma.chantier.update({
    where: { id: chantierId },
    data: { statut },
  });

  await journaliser({
    session,
    action: "MODIFICATION",
    entite: "Chantier",
    entiteId: chantierId,
    entiteLibelle: `statut → ${statut}`,
    apres: { statut },
  });

  revalidatePath("/chantiers");
  revalidatePath(`/chantiers/${chantierId}`);
}

export async function archiverChantier(chantierId) {
  const session = await requireSession();

  const chantier = await prisma.chantier.findUnique({ where: { id: chantierId } });
  if (!chantier) return;

  await prisma.chantier.update({ where: { id: chantierId }, data: { archive: true } });

  await journaliser({
    session,
    action: "ARCHIVAGE",
    entite: "Chantier",
    entiteId: chantierId,
    entiteLibelle: chantier.nom,
  });

  revalidatePath("/chantiers");
  redirect("/chantiers");
}

export async function reactiverChantier(chantierId) {
  const session = await requireSession();

  const chantier = await prisma.chantier.findUnique({ where: { id: chantierId } });
  if (!chantier) return;

  await prisma.chantier.update({ where: { id: chantierId }, data: { archive: false } });

  await journaliser({
    session,
    action: "REACTIVATION",
    entite: "Chantier",
    entiteId: chantierId,
    entiteLibelle: chantier.nom,
  });

  revalidatePath("/chantiers");
}
