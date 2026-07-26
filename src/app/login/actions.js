"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function login(prevState, formData) {
  const identifiant = String(formData.get("identifiant") || "").trim();
  const motDePasse = String(formData.get("motDePasse") || "");

  if (!identifiant || !motDePasse) {
    return { error: "Identifiant et mot de passe requis." };
  }

  const utilisateur = await prisma.utilisateur.findUnique({
    where: { identifiant },
  });

  if (!utilisateur || !utilisateur.actif) {
    return { error: "Identifiant ou mot de passe incorrect." };
  }

  const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
  if (!motDePasseValide) {
    return { error: "Identifiant ou mot de passe incorrect." };
  }

  const session = await getSession();
  session.userId = utilisateur.id;
  session.nom = utilisateur.nom;
  session.role = utilisateur.role;
  await session.save();

  redirect("/chantiers");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}
