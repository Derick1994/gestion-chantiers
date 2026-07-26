"use server";

import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function creerChantier(formData) {
  const nom = String(formData.get("nom") || "").trim();
  const lieu = String(formData.get("lieu") || "").trim();
  const dateDebut = String(formData.get("dateDebut") || "").trim();
  const budgetRaw = String(formData.get("budget") || "").trim();

  if (!nom || !lieu || !dateDebut) {
    throw new Error("Nom, lieu et date de début sont obligatoires.");
  }

  const chantier = await prisma.chantier.create({
    data: {
      nom,
      lieu,
      dateDebut,
      budget: budgetRaw ? Number(budgetRaw) : null,
    },
  });

  revalidatePath("/chantiers");
  redirect(`/chantiers/${chantier.id}`);
}

export async function changerStatutChantier(chantierId, statut) {
  if (!["En cours", "Terminé"].includes(statut)) return;
  await prisma.chantier.update({
    where: { id: chantierId },
    data: { statut },
  });
  revalidatePath("/chantiers");
  revalidatePath(`/chantiers/${chantierId}`);
}
