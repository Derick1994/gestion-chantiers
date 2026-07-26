import Link from "next/link";
import { prisma } from "@/lib/db";
import { fmt, fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ChantiersPage() {
  const chantiers = await prisma.chantier.findMany({
    orderBy: { createdAt: "desc" },
    include: { depenses: { select: { montant: true } } },
  });

  const total = chantiers.reduce(
    (acc, c) => acc + c.depenses.reduce((s, d) => s + d.montant, 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Chantiers</h1>
          <p className="text-sm text-slate-500">
            {chantiers.length} chantier{chantiers.length > 1 ? "s" : ""} ·
            total dépensé {fmt(total)}
          </p>
        </div>
        <Link
          href="/chantiers/nouveau"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          + Nouveau chantier
        </Link>
      </div>

      {chantiers.length === 0 ? (
        <p className="text-slate-500 text-sm">
          Aucun chantier pour le moment. Créez le premier.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {chantiers.map((c) => {
            const depense = c.depenses.reduce((s, d) => s + d.montant, 0);
            const depasse = c.budget != null && depense > c.budget;
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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
