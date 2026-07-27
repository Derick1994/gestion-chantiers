import Link from "next/link";
import { prisma } from "@/lib/db";
import { fmt, fmtDate } from "@/lib/format";
import SearchBox from "./SearchBox";

export const dynamic = "force-dynamic";

export default async function ChantiersPage({ searchParams }) {
  const { q } = await searchParams;
  const recherche = (q || "").trim();

  const chantiers = await prisma.chantier.findMany({
    where: recherche
      ? {
          OR: [
            { nom: { contains: recherche } },
            { lieu: { contains: recherche } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { depenses: { select: { montant: true } } },
  });

  const total = chantiers.reduce(
    (acc, c) => acc + c.depenses.reduce((s, d) => s + d.montant, 0),
    0
  );
  const totalBudget = chantiers.reduce((acc, c) => acc + (c.budget || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Chantiers</h1>
          <p className="text-sm text-slate-500">
            {chantiers.length} chantier{chantiers.length > 1 ? "s" : ""} ·
            total dépensé {fmt(total)}
            {totalBudget > 0 && <> · budget total prévu {fmt(totalBudget)}</>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBox />
          <Link
            href="/chantiers/nouveau"
            className="shrink-0 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            + Nouveau chantier
          </Link>
        </div>
      </div>

      {chantiers.length === 0 ? (
        <p className="text-slate-500 text-sm">
          {recherche
            ? "Aucun chantier ne correspond à cette recherche."
            : "Aucun chantier pour le moment. Créez le premier."}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {chantiers.map((c) => {
            const depense = c.depenses.reduce((s, d) => s + d.montant, 0);
            const depasse = c.budget != null && depense > c.budget;
            const pourcentage =
              c.budget != null && c.budget > 0
                ? Math.round((depense / c.budget) * 100)
                : null;
            return (
              <Link
                key={c.id}
                href={`/chantiers/${c.id}`}
                className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-medium">{c.nom}</h2>
                    <p className="text-sm text-slate-500">
                      {c.lieu} · début {fmtDate(c.dateDebut)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.statut === "Terminé"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {c.statut}
                  </span>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Dépensé</p>
                    <p
                      className={`font-semibold ${depasse ? "text-red-600" : "text-slate-900"}`}
                    >
                      {fmt(depense)}
                    </p>
                  </div>
                  {c.budget != null && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Budget prévu</p>
                      <p className="text-sm text-slate-600">{fmt(c.budget)}</p>
                    </div>
                  )}
                </div>
                {pourcentage != null && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${depasse ? "bg-red-500" : "bg-slate-900"}`}
                        style={{ width: `${Math.min(pourcentage, 100)}%` }}
                      />
                    </div>
                    <p
                      className={`mt-1 text-xs ${depasse ? "text-red-600" : "text-slate-500"}`}
                    >
                      {pourcentage}% du budget consommé
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
