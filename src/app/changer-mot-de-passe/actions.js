"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { journaliser } from "@/lib/audit";

export async function changerMotDePasse(prevState, formData) {
  const session = await requireSession();

  const motDePasseActuel = String(formData.get("motDePasseActuel") || "");
  const nouveauMotDePasse = String(formData.get("nouveauMotDePasse") || "");
  const confirmation = String(formData.get("confirmation") || "");

  if (!motDePasseActuel || !nouveauMotDePasse || !confirmation) {
    return { error: "Tous les champs sont obligatoires." };
  }
  if (nouveauMotDePasse.length < 8) {
    return { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." };
  }
  if (nouveauMotDePasse !== confirmation) {
    return { error: "La confirmation ne correspond pas au nouveau mot de passe." };
  }

  const utilisateur = await prisma.utilisateur.findUnique({ where: { id: session.userId } });
  if (!utilisateur) {
    return { error: "Utilisateur introuvable." };
  }

  const motDePasseValide = await bcrypt.compare(motDePasseActuel, utilisateur.motDePasse);
  if (!motDePasseValide) {
    return { error: "Mot de passe actuel incorrect." };
  }

  const motDePasseHash = await bcrypt.hash(nouveauMotDePasse, 10);
  await prisma.utilisateur.update({
    where: { id: session.userId },
    data: { motDePasse: motDePasseHash, doitChangerMotDePasse: false },
  });

  session.doitChangerMotDePasse = false;
  await session.save();

  await journaliser({
    session,
    action: "CHANGEMENT_MOT_DE_PASSE",
    entite: "Utilisateur",
    entiteId: session.userId,
    entiteLibelle: session.nom,
  });

  return { error: null, success: true };
}
