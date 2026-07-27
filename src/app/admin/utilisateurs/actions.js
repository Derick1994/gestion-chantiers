"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { journaliser } from "@/lib/audit";
import { TEXTE_MAX } from "@/lib/validation";

const ROLES = ["ADMIN", "OPERATEUR"];

export async function creerUtilisateur(prevState, formData) {
  const session = await requireAdmin();

  const nom = String(formData.get("nom") || "").trim();
  const identifiant = String(formData.get("identifiant") || "").trim();
  const role = String(formData.get("role") || "OPERATEUR").trim();
  const motDePasseProvisoire = String(formData.get("motDePasseProvisoire") || "");

  if (!nom || !identifiant || !motDePasseProvisoire) {
    return { error: "Nom, identifiant et mot de passe provisoire sont obligatoires." };
  }
  if (nom.length > TEXTE_MAX || identifiant.length > TEXTE_MAX) {
    return { error: `Les champs ne doivent pas dépasser ${TEXTE_MAX} caractères.` };
  }
  if (motDePasseProvisoire.length < 8) {
    return { error: "Le mot de passe provisoire doit contenir au moins 8 caractères." };
  }
  if (!ROLES.includes(role)) {
    return { error: "Rôle invalide." };
  }

  const existant = await prisma.utilisateur.findUnique({ where: { identifiant } });
  if (existant) {
    return { error: "Cet identifiant est déjà utilisé." };
  }

  const motDePasse = await bcrypt.hash(motDePasseProvisoire, 10);
  const utilisateur = await prisma.utilisateur.create({
    data: { nom, identifiant, motDePasse, role, doitChangerMotDePasse: true },
  });

  await journaliser({
    session,
    action: "CREATION",
    entite: "Utilisateur",
    entiteId: utilisateur.id,
    entiteLibelle: `${nom} (${identifiant}, ${role})`,
  });

  revalidatePath("/admin/utilisateurs");
  return { error: null, success: true };
}

export async function toggleActifUtilisateur(utilisateurId) {
  const session = await requireAdmin();

  const utilisateur = await prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
  if (!utilisateur) return;

  if (utilisateur.actif && utilisateur.role === "ADMIN") {
    const nbAdminsActifs = await prisma.utilisateur.count({
      where: { role: "ADMIN", actif: true },
    });
    if (nbAdminsActifs <= 1) {
      return; // R2 : au moins un administrateur actif en permanence
    }
  }

  const nouveauStatut = !utilisateur.actif;
  await prisma.utilisateur.update({
    where: { id: utilisateurId },
    data: { actif: nouveauStatut },
  });

  await journaliser({
    session,
    action: nouveauStatut ? "REACTIVATION" : "ARCHIVAGE",
    entite: "Utilisateur",
    entiteId: utilisateurId,
    entiteLibelle: `${utilisateur.nom} (${utilisateur.identifiant})`,
  });

  revalidatePath("/admin/utilisateurs");
}
