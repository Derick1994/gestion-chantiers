import Link from "next/link";
import { prisma } from "@/lib/db";
import { fmt, fmtDate } from "@/lib/format";
import { soldeCaisseGenerale, soldeChantier } from "@/lib/caisse";
import MouvementForm from "./MouvementForm";

export const dynamic = "force-dynamic";

const LIBELLES_TYPE = {
  ENTREE: "Entrée de fonds",
  DOTATION: "Dotation",
  RETOUR: "Retour",
  SORTIE_EXTERNE: "Sortie externe",
  DEPENSE_GENERALE: "Dépense générale",
};

export default async function CaissePage() {
  const [solde, mouvements, chantiers] = await Promise.all([
    soldeCaisseGenerale(),
    prisma.mouvement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { chantier: true },
    }),
    prisma.chantier.findMany({ where: { archive: false }, orderBy: { nom: "asc" } }),
  ]);

  const soldesChantiers = await Promise.all(
    chantiers.map(async (c) => ({ chantier: c, ...(await soldeChantier(c.id)) }))
  );
  const aRegulariser = soldesChantiers.filter((s) => s.disponible < 0);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Caisse générale</h1>
        <p className="text-sm text-slate-500">Solde disponible</p>
        <p className={`text-2xl font-semibold ${solde < 0 ? "text-red-600" : ""}`}>{fmt(solde)}</p>
      </div>

      <MouvementForm chantiers={chantiers} today={today} />

      {aRegulariser.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-medium mb-3 text-amber-800">
            ⚠️ Chantiers à régulariser ({aRegulariser.length})
          </h2>
          <div className="space-y-1.5">
            {aRegulariser.map((s) => (
              <div key={s.chantier.id} className="flex items-center justify-between text-sm">
                <Link href={`/chantiers/${s.chantier.id}`} className="text-amber-900 hover:underline">
                  {s.chantier.nom}
                </Link>
                <span className="font-medium text-red-600">{fmt(s.disponible)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white">
        <h2 className="font-medium p-4 pb-0">Historique</h2>
        {mouvements.length === 0 ? (
          <p className="text-sm text-slate-500 p-4">Aucun mouvement enregistré.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Chantier / Bénéficiaire</th>
                  <th className="p-3 font-medium">Note</th>
                  <th className="p-3 font-medium text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {mouvements.map((m) => (
                  <tr key={m.id} className="border-b border-slate-100 last:border-0">
                    <td className="p-3 whitespace-nowrap">{fmtDate(m.date)}</td>
                    <td className="p-3">{LIBELLES_TYPE[m.type] || m.type}</td>
                    <td className="p-3 text-slate-600">
                      {m.chantier ? (
                        <Link href={`/chantiers/${m.chantier.id}`} className="hover:underline">
                          {m.chantier.nom}
                        </Link>
                      ) : (
                        m.beneficiaire || "—"
                      )}
                    </td>
                    <td className="p-3 text-slate-600">{m.note || "—"}</td>
                    <td className="p-3 text-right font-medium">{fmt(m.montant)}</td>
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
