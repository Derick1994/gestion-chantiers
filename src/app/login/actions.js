"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { journaliser } from "@/lib/audit";

const MAX_TENTATIVES = 5;
const FENETRE_TENTATIVES_MIN = 15;

export async function login(prevState, formData) {
  const identifiant = String(formData.get("identifiant") || "").trim();
  const motDePasse = String(formData.get("motDePasse") || "");

  if (!identifiant || !motDePasse) {
    return { error: "Identifiant et mot de passe requis." };
  }

  const depuis = new Date(Date.now() - FENETRE_TENTATIVES_MIN * 60 * 1000);
  const tentativesRecentes = await prisma.journalAudit.count({
    where: {
      action: "ECHEC_CONNEXION",
      entiteLibelle: identifiant,
      dateHeure: { gte: depuis },
    },
  });
  if (tentativesRecentes >= MAX_TENTATIVES) {
    return {
      error: `Trop de tentatives échouées. Réessayez dans ${FENETRE_TENTATIVES_MIN} minutes.`,
    };
  }

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { identifiant },
  });

  const motDePasseValide = utilisateur
    ? await bcrypt.compare(motDePasse, utilisateur.motDePasse)
    : false;

  if (!utilisateur || !utilisateur.actif || !motDePasseValide) {
    await journaliser({
      session: null,
      action: "ECHEC_CONNEXION",
      entite: "Utilisateur",
      entiteId: utilisateur?.id || null,
      entiteLibelle: identifiant,
    });
    return { error: "Identifiant ou mot de passe incorrect." };
  }

  const session = await getSession();
  session.userId = utilisateur.id;
  session.nom = utilisateur.nom;
  session.role = utilisateur.role;
  session.doitChangerMotDePasse = utilisateur.doitChangerMotDePasse;
  await session.save();

  await journaliser({
    session,
    action: "CONNEXION",
    entite: "Utilisateur",
    entiteId: utilisateur.id,
    entiteLibelle: utilisateur.nom,
  });

  if (utilisateur.doitChangerMotDePasse) {
    redirect("/changer-mot-de-passe");
  }
  redirect("/chantiers");
}

export async function logout() {
  const session = await getSession();
  if (session.userId) {
    await journaliser({
      session,
      action: "DECONNEXION",
      entite: "Utilisateur",
      entiteId: session.userId,
      entiteLibelle: session.nom,
    });
  }
  session.destroy();
  redirect("/login");
}
