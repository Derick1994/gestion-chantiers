import Link from "next/link";
import { prisma } from "@/lib/db";
import { fmt, fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DepensesPage({ searchParams }) {
  const sp = await searchParams;
  const chantierId = sp.chantierId || "";
  const categorieId = sp.categorieId || "";
  const beneficiaire = (sp.beneficiaire || "").trim();
  const debut = sp.debut || "";
  const fin = sp.fin || "";

  const where = {};
  if (chantierId) where.chantierId = chantierId;
  if (categorieId) where.categorieId = categorieId;
  if (beneficiaire) where.beneficiaire = { contains: beneficiaire };
  if (debut || fin) {
    where.date = {};
    if (debut) where.date.gte = debut;
    if (fin) where.date.lte = fin;
  }

  const [depenses, chantiers, categories] = await Promise.all([
    prisma.depense.findMany({
      where,
      orderBy: { date: "desc" },
      include: { chantier: true, categorie: true },
    }),
    prisma.chantier.findMany({ orderBy: { nom: "asc" } }),
    prisma.categorie.findMany({ orderBy: [{ type: "asc" }, { ordre: "asc" }] }),
  ]);

  const total = depenses.reduce((s, d) => s + d.montant, 0);

  const parCategorie = new Map();
  const parBeneficiaire = new Map();
  for (const d of depenses) {
    const libelleCategorie = d.categorie?.libelle || "Catégorie supprimée";
    parCategorie.set(libelleCategorie, (parCategorie.get(libelleCategorie) || 0) + d.montant);
    if (d.beneficiaire) {
      parBeneficiaire.set(d.beneficiaire, (parBeneficiaire.get(d.beneficiaire) || 0) + d.montant);
    }
  }
  const parCategorieTriee = [...parCategorie.entries()].sort((a, b) => b[1] - a[1]);
  const parBeneficiaireTriee = [...parBeneficiaire.entries()].sort((a, b) => b[1] - a[1]);

  const exportQuery = new URLSearchParams();
  if (chantierId) exportQuery.set("chantierId", chantierId);
  if (categorieId) exportQuery.set("categorieId", categorieId);
  if (beneficiaire) exportQuery.set("beneficiaire", beneficiaire);
  if (debut) exportQuery.set("debut", debut);
  if (fin) exportQuery.set("fin", fin);

  const typesOrdre = ["Main-d'œuvre", "Matériaux", "Transport", "Location", "Divers"];
  const categoriesParType = typesOrdre
    .map((type) => ({ type, items: categories.filter((c) => c.type === type) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dépenses</h1>
          <p className="text-sm text-slate-500">
            {depenses.length} dépense{depenses.length > 1 ? "s" : ""} · total {fmt(total)}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/depenses/export?${exportQuery.toString()}`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Exporter CSV
          </a>
          <a
            href={`/api/depenses/export-excel?${exportQuery.toString()}`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Exporter Excel
          </a>
        </div>
      </div>

      <form
        method="get"
        className="grid gap-3 sm:grid-cols-5 rounded-lg border border-slate-200 bg-white p-4"
      >
        <div>
          <label className="block text-xs font-medium mb-1" htmlFor="chantierId">
            Chantier
          </label>
          <select
            id="chantierId"
            name="chantierId"
            defaultValue={chantierId}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Tous</option>
            {chantiers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" htmlFor="categorieId">
            Catégorie
          </label>
          <select
            id="categorieId"
            name="categorieId"
            defaultValue={categorieId}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Toutes</option>
            {categoriesParType.map((g) => (
              <optgroup key={g.type} label={g.type}>
                {g.items.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.libelle}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" htmlFor="beneficiaire">
            Bénéficiaire
          </label>
          <input
            id="beneficiaire"
            name="beneficiaire"
            defaultValue={beneficiaire}
            placeholder="Nom"
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" htmlFor="debut">
            Du
          </label>
          <input
            id="debut"
            name="debut"
            type="date"
            defaultValue={debut}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" htmlFor="fin">
            Au
          </label>
          <input
            id="fin"
            name="fin"
            type="date"
            defaultValue={fin}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="sm:col-span-5 flex justify-end gap-2">
          <Link
            href="/depenses"
            className="rounded-md px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Réinitialiser
          </Link>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Filtrer
          </button>
        </div>
      </form>

      {(parCategorieTriee.length > 0 || parBeneficiaireTriee.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {parCategorieTriee.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-medium mb-3">Par catégorie</h2>
              <div className="space-y-1.5">
                {parCategorieTriee.map(([libelle, montant]) => (
                  <div key={libelle} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{libelle}</span>
                    <span className="font-medium">{fmt(montant)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {parBeneficiaireTriee.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-medium mb-3">Par bénéficiaire</h2>
              <div className="space-y-1.5">
                {parBeneficiaireTriee.map(([nom, montant]) => (
                  <div key={nom} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{nom}</span>
                    <span className="font-medium">{fmt(montant)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white">
        {depenses.length === 0 ? (
          <p className="text-sm text-slate-500 p-4">
            Aucune dépense ne correspond à ces filtres.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Chantier</th>
                  <th className="p-3 font-medium">Catégorie</th>
                  <th className="p-3 font-medium">Bénéficiaire</th>
                  <th className="p-3 font-medium">Mode</th>
                  <th className="p-3 font-medium text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {depenses.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 last:border-0">
                    <td className="p-3 whitespace-nowrap">{fmtDate(d.date)}</td>
                    <td className="p-3">
                      <Link href={`/chantiers/${d.chantierId}`} className="hover:underline">
                        {d.chantier.nom}
                      </Link>
                    </td>
                    <td className="p-3">{d.categorie?.libelle || "Catégorie supprimée"}</td>
                    <td className="p-3 text-slate-600">{d.beneficiaire || "—"}</td>
                    <td className="p-3 text-slate-600">{d.mode}</td>
                    <td className="p-3 text-right font-medium">{fmt(d.montant)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
