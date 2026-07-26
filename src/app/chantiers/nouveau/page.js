import Link from "next/link";
import { creerChantier } from "../actions";

export default function NouveauChantierPage() {
  return (
    <div className="max-w-lg space-y-4">
      <div>
        <Link href="/chantiers" className="text-sm text-slate-500 hover:underline">
          ← Chantiers
        </Link>
        <h1 className="text-xl font-semibold mt-1">Nouveau chantier</h1>
      </div>

      <form action={creerChantier} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="nom">
            Nom du chantier *
          </label>
          <input
            id="nom"
            name="nom"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            placeholder="Ex : Villa Les Cocotiers"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="lieu">
            Lieu *
          </label>
          <input
            id="lieu"
            name="lieu"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            placeholder="Ex : Cotonou"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="dateDebut">
              Date de début *
            </label>
            <input
              id="dateDebut"
              name="dateDebut"
              type="date"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="budget">
              Budget prévu (FCFA)
            </label>
            <input
              id="budget"
              name="budget"
              type="number"
              min="0"
              step="1"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              placeholder="Facultatif"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Link
            href="/chantiers"
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Annuler
          </Link>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Créer le chantier
          </button>
        </div>
      </form>
    </div>
  );
}
