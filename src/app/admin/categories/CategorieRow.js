"use client";

import { useActionState, useState, useEffect } from "react";
import { modifierCategorie, toggleActifCategorie } from "./actions";
import PendingButton from "@/components/PendingButton";

const initialState = { error: null };
const TYPES = ["Main-d'œuvre", "Matériaux", "Transport", "Location", "Divers"];

export default function CategorieRow({ categorie, nbDepenses }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(modifierCategorie, initialState);

  useEffect(() => {
    if (state?.success) {
      setEditing(false);
    }
  }, [state]);

  if (editing) {
    return (
      <tr className="border-b border-slate-100 last:border-0">
        <td colSpan={4} className="p-3">
          <form action={formAction} className="grid gap-3 sm:grid-cols-3">
            <input type="hidden" name="id" value={categorie.id} />
            <div>
              <label className="block text-xs font-medium mb-1">Libellé</label>
              <input
                name="libelle"
                defaultValue={categorie.libelle}
                required
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Type</label>
              <select
                name="type"
                defaultValue={categorie.type}
                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {pending ? "…" : "Enregistrer"}
              </button>
            </div>
            {nbDepenses > 0 && (
              <p className="sm:col-span-3 text-xs text-amber-600">
                ⚠️ {nbDepenses} dépense{nbDepenses > 1 ? "s" : ""} utilise{nbDepenses > 1 ? "nt" : ""}{" "}
                déjà cette catégorie — renommer changera leur affichage rétroactivement.
              </p>
            )}
            {state?.error && (
              <p className="sm:col-span-3 text-sm text-red-600">{state.error}</p>
            )}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="p-3">{categorie.libelle}</td>
      <td className="p-3 text-slate-600">{categorie.type}</td>
      <td className="p-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            categorie.actif ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {categorie.actif ? "Active" : "Archivée"}
        </span>
      </td>
      <td className="p-3 text-right whitespace-nowrap">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-slate-600 hover:underline mr-3"
        >
          Modifier
        </button>
        <form action={toggleActifCategorie.bind(null, categorie.id)} className="inline">
          <PendingButton className="text-xs text-slate-600 hover:underline">
            {categorie.actif ? "Archiver" : "Réactiver"}
          </PendingButton>
        </form>
      </td>
    </tr>
  );
}
