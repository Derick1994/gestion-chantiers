import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

const LIBELLES_ACTION = {
  CONNEXION: "Connexion",
  ECHEC_CONNEXION: "Échec de connexion",
  DECONNEXION: "Déconnexion",
  CREATION: "Création",
  MODIFICATION: "Modification",
  ARCHIVAGE: "Archivage",
  REACTIVATION: "Réactivation",
  ANNULATION: "Suppression",
  SUPPRESSION_REFUSEE: "Suppression refusée",
  CHANGEMENT_MOT_DE_PASSE: "Changement de mot de passe",
};

function fmtDateHeure(d) {
  return new Date(d).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function JournalPage({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const entite = sp.entite || "";

  const entrees = await prisma.journalAudit.findMany({
    where: entite ? { entite } : undefined,
    orderBy: { dateHeure: "desc" },
    take: 200,
  });

  const entites = ["Utilisateur", "Chantier", "Depense", "Categorie"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Journal d'audit</h1>
      </div>
      <p className="text-sm text-slate-500">
        Les 200 dernières actions. Ce journal est informatif : il protège contre l'erreur et
        les abus, mais un accès direct à la base de données pourrait le modifier.
      </p>

      <div className="flex flex-wrap gap-2">
        <a
          href="/admin/journal"
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            !entite ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Tout
        </a>
        {entites.map((e) => (
          <a
            key={e}
            href={`/admin/journal?entite=${e}`}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              entite === e ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {e}
          </a>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
        {entrees.length === 0 ? (
          <p className="text-sm text-slate-500 p-4">Aucune entrée.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Qui</th>
                <th className="p-3 font-medium">Action</th>
                <th className="p-3 font-medium">Sur</th>
                <th className="p-3 font-medium">Détail</th>
              </tr>
            </thead>
            <tbody>
              {entrees.map((e) => (
                <tr key={e.id} className="border-b border-slate-100 last:border-0 align-top">
                  <td className="p-3 whitespace-nowrap text-slate-500">
                    {fmtDateHeure(e.dateHeure)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {e.acteurNom}
                    <span className="text-slate-400"> ({e.acteurRole})</span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        e.action === "SUPPRESSION_REFUSEE" || e.action === "ECHEC_CONNEXION"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {LIBELLES_ACTION[e.action] || e.action}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-500">{e.entite}</td>
                  <td className="p-3 text-slate-600">{e.entiteLibelle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
