import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { fmtDate } from "@/lib/format";

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",;\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request) {
  await requireSession();

  const { searchParams } = new URL(request.url);
  const chantierId = searchParams.get("chantierId") || "";
  const categorieId = searchParams.get("categorieId") || "";
  const beneficiaire = (searchParams.get("beneficiaire") || "").trim();
  const debut = searchParams.get("debut") || "";
  const fin = searchParams.get("fin") || "";

  const where = {};
  if (chantierId) where.chantierId = chantierId;
  if (categorieId) where.categorieId = categorieId;
  if (beneficiaire) where.beneficiaire = { contains: beneficiaire };
  if (debut || fin) {
    where.date = {};
    if (debut) where.date.gte = debut;
    if (fin) where.date.lte = fin;
  }

  const depenses = await prisma.depense.findMany({
    where,
    orderBy: { date: "desc" },
    include: { chantier: true, categorie: true },
  });

  const entetes = [
    "Date",
    "Chantier",
    "Catégorie",
    "Description",
    "Bénéficiaire",
    "Mode",
    "Référence",
    "Montant (FCFA)",
  ];
  const lignes = depenses.map((d) => [
    fmtDate(d.date),
    d.chantier.nom,
    d.categorie.libelle,
    d.description || "",
    d.beneficiaire || "",
    d.mode,
    d.reference || "",
    d.montant,
  ]);

  const csv = [entetes, ...lignes]
    .map((ligne) => ligne.map(csvEscape).join(";"))
    .join("\r\n");

  // BOM pour qu'Excel détecte correctement l'UTF-8
  const contenu = "﻿" + csv;

  return new Response(contenu, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="depenses.csv"`,
    },
  });
}
