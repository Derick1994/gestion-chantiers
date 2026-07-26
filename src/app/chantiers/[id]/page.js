import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { fmt, fmtDate } from "@/lib/format";
import { ajouterDepense, supprimerDepense } from "@/app/depenses/actions";

export const dynamic = "force-dynamic";

async function getData(id) {
  const chantier = await prisma.chantier.findUnique({
    where: { id },
    include: {
      depenses: {
        orderBy: { date: "desc" },
        include: { categorie: true },
      },
    },
  });
  if (!chantier) return null;

  const categories = await prisma.categorie.findMany({
    orderBy: [{ type: "asc" }, { ordre: "asc" }],
  });

  return { chantier, categories };
}

export default async function ChantierDetailPage({ params }) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();
  const { chantier, categories } = data;

  const totalDepense = chantier.depenses.reduce((s, d) => s + d.montant, 0);
  const budgetRestant = chantier.budget != null ? chantier.budget - totalDepense : null;

  const typesOrdre = ["Main-d'œuvre", "Matériaux", "Transport", "Location", "Divers"];
  const categoriesParType = typesOrdre
    .map((type) => ({ type, items: categories.filter((c) => c.type === type) }))
    .filter((g) => g.items.length > 0);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/chantiers" className="text-sm text-slate-500 hover:underline">
          ← Chantiers
        </Link>
        <div className="flex items-start justify-between mt-1">
          <div>
            <h1 className="text-xl font-semibold">{chantier.nom}</h1>
            <p className="text-sm text-slate-500">
              {chantier.lieu} · début {fmtDate(chantier.dateDebut)} · {chantier.statut}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Total dépensé</p>
          <p className="text-lg font-semibold">{fmt(totalDepense)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Budget prévu</p>
          <p className="text-lg font-semibold">
            {chantier.budget != null ? fmt(chantier.budget) : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Reste sur budget</p>
          <p
            className={`text-lg font-semibold ${
              budgetRestant != null && budgetRestant < 0 ? "text-red-600" : ""
            }`}
          >
            {budgetRestant != null ? fmt(budgetRestant) : "—"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-medium mb-3">Ajouter une dépense</h2>
        <form action={ajouterDepense} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="chantierId" value={chantier.id} />

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="date">
              Date *
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={today}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="categorieId">
              Catégorie *
            </label>
            <select
              id="categorieId"
              name="categorieId"
              required
              defaultValue=""
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="" disabled>
                Choisir…
              </option>
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

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1" htmlFor="description">
              Description
            </label>
            <input
              id="description"
              name="description"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              placeholder="Ex : 50 sacs de ciment"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="montant">
              Montant (FCFA) *
            </label>
            <input
              id="montant"
              name="montant"
              type="number"
              min="0"
              step="1"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="beneficiaire">
              Bénéficiaire
            </label>
            <input
              id="beneficiaire"
              name="beneficiaire"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              placeholder="Ex : Chef Kodjo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="mode">
              Mode de paiement
            </label>
            <select
              id="mode"
              name="mode"
              defaultValue="Espèces"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option>Espèces</option>
              <option>Virement</option>
              <option>Mobile Money</option>
              <option>Chèque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="reference">
              Référence pièce justificative
            </label>
            <input
              id="reference"
              name="reference"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              placeholder="Facultatif"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Enregistrer la dépense
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <h2 className="font-medium p-4 pb-0">
          Dépenses ({chantier.depenses.length})
        </h2>
        {chantier.depenses.length === 0 ? (
          <p className="text-sm text-slate-500 p-4">Aucune dépense enregistrée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Catégorie</th>
                  <th className="p-3 font-medium">Description</th>
                  <th className="p-3 font-medium">Bénéficiaire</th>
                  <th className="p-3 font-medium">Mode</th>
                  <th className="p-3 font-medium text-right">Montant</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {chantier.depenses.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 last:border-0">
                    <td className="p-3 whitespace-nowrap">{fmtDate(d.date)}</td>
                    <td className="p-3">{d.categorie.libelle}</td>
                    <td className="p-3 text-slate-600">{d.description || "—"}</td>
                    <td className="p-3 text-slate-600">{d.beneficiaire || "—"}</td>
                    <td className="p-3 text-slate-600">{d.mode}</td>
                    <td className="p-3 text-right font-medium">{fmt(d.montant)}</td>
                    <td className="p-3 text-right">
                      <form
                        action={supprimerDepense.bind(null, d.id, chantier.id)}
                      >
                        <button
                          type="submit"
                          className="text-xs text-red-600 hover:underline"
                        >
                          Supprimer
                        </button>
                      </form>
                    </td>
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
