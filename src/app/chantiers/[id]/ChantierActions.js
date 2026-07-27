"use client";

import { useActionState, useState, useEffect } from "react";
import { modifierChantier, changerStatutChantier, supprimerChantier } from "../actions";
import ConfirmButton from "@/components/ConfirmButton";

const initialState = { error: null };

export default function ChantierActions({ chantier }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(modifierChantier, initialState);

  useEffect(() => {
    if (state?.success) {
      setEditing(false);
    }
  }, [state]);

  if (editing) {
    return (
      <form
        action={formAction}
        className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <input type="hidden" name="id" value={chantier.id} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="nom">
              Nom *
            </label>
            <input
              id="nom"
              name="nom"
              defaultValue={chantier.nom}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="lieu">
              Lieu *
            </label>
            <input
              id="lieu"
              name="lieu"
              defaultValue={chantier.lieu}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="dateDebut">
              Date de début *
            </label>
            <input
              id="dateDebut"
              name="dateDebut"
              type="date"
              defaultValue={chantier.dateDebut}
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
              defaultValue={chantier.budget ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        action={changerStatutChantier.bind(
          null,
          chantier.id,
          chantier.statut === "Terminé" ? "En cours" : "Terminé"
        )}
      >
        <button
          type="submit"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-100"
        >
          Marquer {chantier.statut === "Terminé" ? "en cours" : "terminé"}
        </button>
      </form>
      <button
        onClick={() => setEditing(true)}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-100"
      >
        Modifier
      </button>
      <form action={supprimerChantier.bind(null, chantier.id)}>
        <ConfirmButton
          confirmMessage="Supprimer ce chantier et toutes ses dépenses ? Cette action est irréversible."
          className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          Supprimer le chantier
        </ConfirmButton>
      </form>
    </div>
  );
}
