import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { toggleActifUtilisateur } from "./actions";
import CreerUtilisateurForm from "./CreerUtilisateurForm";
import PendingButton from "@/components/PendingButton";

export const dynamic = "force-dynamic";

export default async function UtilisateursPage() {
  await requireAdmin();

  const utilisateurs = await prisma.utilisateur.findMany({
    orderBy: { createdAt: "asc" },
  });
  const nbAdminsActifs = utilisateurs.filter((u) => u.role === "ADMIN" && u.actif).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Utilisateurs</h1>
      </div>

      <CreerUtilisateurForm />

      <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="p-3 font-medium">Nom</th>
              <th className="p-3 font-medium">Identifiant</th>
              <th className="p-3 font-medium">Rôle</th>
              <th className="p-3 font-medium">Statut</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.map((u) => {
              const dernierAdminActif = u.role === "ADMIN" && u.actif && nbAdminsActifs <= 1;
              return (
                <tr key={u.id} className="border-b border-slate-100 last:border-0">
                  <td className="p-3">{u.nom}</td>
                  <td className="p-3 text-slate-600">{u.identifiant}</td>
                  <td className="p-3 text-slate-600">
                    {u.role === "ADMIN" ? "Administrateur" : "Opérateur"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.actif ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {u.actif ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {dernierAdminActif ? (
                      <span className="text-xs text-slate-400" title="Impossible de désactiver le dernier administrateur actif">
                        Dernier admin actif
                      </span>
                    ) : (
                      <form action={toggleActifUtilisateur.bind(null, u.id)}>
                        <PendingButton className="text-xs text-slate-600 hover:underline">
                          {u.actif ? "Désactiver" : "Réactiver"}
                        </PendingButton>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
