import ExcelJS from "exceljs";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { fmtDate } from "@/lib/format";
import { construireFiltreDepenses } from "@/lib/depenses-export";

export async function GET(request) {
  await requireSession();

  const { searchParams } = new URL(request.url);
  const where = construireFiltreDepenses(searchParams);

  const depenses = await prisma.depense.findMany({
    where,
    orderBy: { date: "desc" },
    include: { chantier: true, categorie: true },
  });

  const workbook = new ExcelJS.Workbook();
  const feuille = workbook.addWorksheet("Dépenses");

  feuille.columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "Chantier", key: "chantier", width: 25 },
    { header: "Catégorie", key: "categorie", width: 18 },
    { header: "Description", key: "description", width: 30 },
    { header: "Bénéficiaire", key: "beneficiaire", width: 20 },
    { header: "Mode", key: "mode", width: 14 },
    { header: "Référence", key: "reference", width: 16 },
    { header: "Montant (FCFA)", key: "montant", width: 16 },
  ];
  feuille.getRow(1).font = { bold: true };

  for (const d of depenses) {
    feuille.addRow({
      date: fmtDate(d.date),
      chantier: d.chantier.nom,
      categorie: d.categorie?.libelle || "Catégorie supprimée",
      description: d.description || "",
      beneficiaire: d.beneficiaire || "",
      mode: d.mode,
      reference: d.reference || "",
      montant: d.montant,
    });
  }

  const total = depenses.reduce((s, d) => s + d.montant, 0);
  const ligneTotal = feuille.addRow({ chantier: "", categorie: "", description: "", mode: "TOTAL", montant: total });
  ligneTotal.font = { bold: true };
  feuille.getColumn("montant").numFmt = "#,##0";

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="depenses.xlsx"`,
    },
  });
}
