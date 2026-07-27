import { prisma } from "./db";

export async function journaliser({
  session,
  action,
  entite,
  entiteId = null,
  entiteLibelle,
  avant = null,
  apres = null,
}) {
  await prisma.journalAudit.create({
    data: {
      acteurId: session?.userId || null,
      acteurNom: session?.nom || "Système",
      acteurRole: session?.role || "SYSTEME",
      action,
      entite,
      entiteId,
      entiteLibelle,
      avant: avant ?? undefined,
      apres: apres ?? undefined,
    },
  });
}
