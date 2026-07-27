import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { fmt, fmtDate } from "@/lib/format";
import { soldeChantier } from "@/lib/caisse";
import { getSession } from "@/lib/session";
import AjouterDepenseForm from "./AjouterDepenseForm";
import DepenseRow from "./DepenseRow";
import ChantierActions from "./ChantierActions";
import ChantierDangerZone from "./ChantierDangerZone";

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
    where: { actif: true },
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
  const { dote, disponible } = await soldeChantier(chantier.id);
  const session = await getSession();
  const isAdmin = session.role === "ADMIN";

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mt-1">
          <div>
            <h1 className="text-xl font-semibold">{chantier.nom}</h1>
            <p className="text-sm text-slate-500">
              {chantier.lieu} · début {fmtDate(chantier.dateDebut)} · {chantier.statut}
            </p>
          </div>
          <ChantierActions chantier={chantier} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Fonds doté par la caisse</p>
          <p className="text-lg font-semibold">{fmt(dote)}</p>
          <p className={`text-xs mt-1 ${disponible < 0 ? "text-red-600 font-medium" : "text-slate-500"}`}>
            {disponible < 0 ? `⚠️ À régulariser : ${fmt(disponible)}` : `Disponible : ${fmt(disponible)}`}
          </p>
        </div>
      </div>

      {disponible < 0 && (
        <p className="text-sm text-amber-700">
          Ce chantier a dépensé plus que ce qui lui a été doté.{" "}
          <Link href="/caisse" className="underline hover:text-amber-900">
            Doter ce chantier depuis la caisse générale →
          </Link>
        </p>
      )}

      <AjouterDepenseForm
        chantierId={chantier.id}
        categoriesParType={categoriesParType}
        today={today}
      />

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
                  <DepenseRow
                    key={d.id}
                    depense={d}
                    chantierId={chantier.id}
                    categoriesParType={categoriesParType}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ChantierDangerZone chantier={chantier} isAdmin={isAdmin} />
    </div>
  );
}
