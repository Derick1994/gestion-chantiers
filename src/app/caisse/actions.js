"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { journaliser } from "@/lib/audit";
import { soldeCaisseGenerale, soldeChantier } from "@/lib/caisse";
import { dateEstPlausible, montantEstValide, TEXTE_MAX } from "@/lib/validation";

function lireChampsCommuns(formData) {
  const date = String(formData.get("date") || "").trim();
  const montantRaw = String(formData.get("montant") || "").trim();
  const note = String(formData.get("note") || "").trim();

  if (!date || !montantRaw) {
    return { error: "Date et montant sont obligatoires." };
  }
  if (!dateEstPlausible(date)) {
    return { error: "La date n'est pas valide." };
  }
  const montant = Number(montantRaw);
  if (!montantEstValide(montant)) {
    return { error: "Le montant doit être un nombre entier positif, sans décimales, et raisonnable." };
  }
  if (note.length > TEXTE_MAX) {
    return { error: `La note ne doit pas dépasser ${TEXTE_MAX} caractères.` };
  }
  return { values: { date, montant, note: note || null } };
}

export async function ajouterEntree(prevState, formData) {
  const session = await requireSession();

  const result = lireChampsCommuns(formData);
  if (result.error) return { error: result.error };
  const { values } = result;

  const mouvement = await prisma.mouvement.create({
    data: { type: "ENTREE", ...values, auteurId: session.userId },
  });

  await journaliser({
    session,
    action: "CREATION",
    entite: "Mouvement",
    entiteId: mouvement.id,
    entiteLibelle: `Entrée de fonds — ${values.montant} FCFA`,
    apres: values,
  });

  revalidatePath("/caisse");
  return { error: null, success: true };
}

export async function doterChantier(prevState, formData) {
  const session = await requireSession();

  const chantierId = String(formData.get("chantierId") || "").trim();
  if (!chantierId) return { error: "Choisissez un chantier." };

  const result = lireChampsCommuns(formData);
  if (result.error) return { error: result.error };
  const { values } = result;

  const chantier = await prisma.chantier.findUnique({ where: { id: chantierId } });
  if (!chantier) return { error: "Ce chantier n'existe pas." };

  const solde = await soldeCaisseGenerale();
  if (values.montant > solde) {
    return {
      error: `Solde de la caisse générale insuffisant (disponible : ${solde} FCFA).`,
    };
  }

  const mouvement = await prisma.mouvement.create({
    data: { type: "DOTATION", chantierId, ...values, auteurId: session.userId },
  });

  await journaliser({
    session,
    action: "CREATION",
    entite: "Mouvement",
    entiteId: mouvement.id,
    entiteLibelle: `Dotation — ${values.montant} FCFA — ${chantier.nom}`,
    apres: values,
  });

  revalidatePath("/caisse");
  revalidatePath(`/chantiers/${chantierId}`);
  revalidatePath("/chantiers");
  return { error: null, success: true };
}

export async function retournerFonds(prevState, formData) {
  const session = await requireSession();

  const chantierId = String(formData.get("chantierId") || "").trim();
  if (!chantierId) return { error: "Choisissez un chantier." };

  const result = lireChampsCommuns(formData);
  if (result.error) return { error: result.error };
  const { values } = result;

  const chantier = await prisma.chantier.findUnique({ where: { id: chantierId } });
  if (!chantier) return { error: "Ce chantier n'existe pas." };

  const { disponible } = await soldeChantier(chantierId);
  if (values.montant > disponible) {
    return {
      error: `Ce chantier ne dispose que de ${disponible} FCFA de fonds non dépensés à retourner.`,
    };
  }

  const mouvement = await prisma.mouvement.create({
    data: { type: "RETOUR", chantierId, ...values, auteurId: session.userId },
  });

  await journaliser({
    session,
    action: "CREATION",
    entite: "Mouvement",
    entiteId: mouvement.id,
    entiteLibelle: `Retour vers la caisse — ${values.montant} FCFA — ${chantier.nom}`,
    apres: values,
  });

  revalidatePath("/caisse");
  revalidatePath(`/chantiers/${chantierId}`);
  revalidatePath("/chantiers");
  return { error: null, success: true };
}

async function sortieCaisse(session, formData, type, libellePrefixe) {
  const beneficiaire = String(formData.get("beneficiaire") || "").trim();

  const result = lireChampsCommuns(formData);
  if (result.error) return { error: result.error };
  const { values } = result;

  if (beneficiaire.length > TEXTE_MAX) {
    return { error: `Le bénéficiaire ne doit pas dépasser ${TEXTE_MAX} caractères.` };
  }

  const solde = await soldeCaisseGenerale();
  if (values.montant > solde) {
    return { error: `Solde de la caisse générale insuffisant (disponible : ${solde} FCFA).` };
  }

  const mouvement = await prisma.mouvement.create({
    data: { type, beneficiaire: beneficiaire || null, ...values, auteurId: session.userId },
  });

  await journaliser({
    session,
    action: "CREATION",
    entite: "Mouvement",
    entiteId: mouvement.id,
    entiteLibelle: `${libellePrefixe} — ${values.montant} FCFA${beneficiaire ? ` — ${beneficiaire}` : ""}`,
    apres: values,
  });

  revalidatePath("/caisse");
  return { error: null, success: true };
}

export async function sortieExterne(prevState, formData) {
  const session = await requireSession();
  return sortieCaisse(session, formData, "SORTIE_EXTERNE", "Sortie externe");
}

export async function depenseGenerale(prevState, formData) {
  const session = await requireSession();
  return sortieCaisse(session, formData, "DEPENSE_GENERALE", "Dépense générale");
}

export async function enregistrerMouvement(prevState, formData) {
  const type = String(formData.get("type") || "");
  switch (type) {
    case "ENTREE":
      return ajouterEntree(prevState, formData);
    case "DOTATION":
      return doterChantier(prevState, formData);
    case "RETOUR":
      return retournerFonds(prevState, formData);
    case "SORTIE_EXTERNE":
      return sortieExterne(prevState, formData);
    case "DEPENSE_GENERALE":
      return depenseGenerale(prevState, formData);
    default:
      return { error: "Type de mouvement invalide." };
  }
}
