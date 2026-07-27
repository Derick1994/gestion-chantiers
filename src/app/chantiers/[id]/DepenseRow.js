"use client";

import { useActionState, useState, useEffect } from "react";
import { modifierDepense, supprimerDepense } from "@/app/depenses/actions";
import { fmt, fmtDate } from "@/lib/format";
import ConfirmButton from "@/components/ConfirmButton";

const initialState = { error: null };

export default function DepenseRow({ depense, chantierId, categoriesParType }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(modifierDepense, initialState);
  const [suppressionState, suppressionAction] = useActionState(supprimerDepense, initialState);

  useEffect(() => {
    if (state?.success) {
      setEditing(false);
    }
  }, [state]);

  useEffect(() => {
    if (suppressionState?.error) {
      alert(suppressionState.error);
    }
  }, [suppressionState]);

  // Si la catégorie de cette dépense a été archivée depuis, on l'inclut quand
  // même dans les options pour ne pas la perdre silencieusement à l'édition.
  const categorieToujoursListee = categoriesParType.some((g) =>
    g.items.some((c) => c.id === depense.categorieId)
  );
  const optionsCategorie = categorieToujoursListee
    ? categoriesParType
    : [
        ...categoriesParType,
        {
          type: "Archivée",
          items: [
            {
              id: depense.categorieId,
              libelle: depense.categorie
                ? `${depense.categorie.libelle} (archivée)`
                : "Catégorie inconnue (supprimée)",
            },
          ],
        },
      ];

  if (editing) {
    return (
      <tr className="border-b border-slate-100 last:border-0">
        <td colSpan={7} className="p-3">
          <form action={formAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="depenseId" value={depense.id} />
            <input type="hidden" name="chantierId" value={chantierId} />

            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input
                name="date"
                type="date"
                defaultValue={depense.date}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Catégorie *</label>
              <select
                name="categorieId"
                defaultValue={depense.categorieId}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                {optionsCategorie.map((g) => (
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
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                name="description"
                defaultValue={depense.description || ""}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Montant (FCFA) *</label>
              <input
                name="montant"
                type="number"
                min="1"
                step="1"
                defaultValue={depense.montant}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bénéficiaire</label>
              <input
                name="beneficiaire"
                defaultValue={depense.beneficiaire || ""}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mode de paiement</label>
              <select
                name="mode"
                defaultValue={depense.mode}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                <option>Espèces</option>
                <option>Virement</option>
                <option>Mobile Money</option>
                <option>Chèque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Référence</label>
              <input
                name="reference"
                defaultValue={depense.reference || ""}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>

            {state?.error && (
              <p className="sm:col-span-2 text-sm text-red-600">{state.error}</p>
            )}

            <div className="sm:col-span-2 flex justify-end gap-2">
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
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="p-3 whitespace-nowrap">{fmtDate(depense.date)}</td>
      <td className="p-3">{depense.categorie?.libelle || "Catégorie supprimée"}</td>
      <td className="p-3 text-slate-600">{depense.description || "—"}</td>
      <td className="p-3 text-slate-600">{depense.beneficiaire || "—"}</td>
      <td className="p-3 text-slate-600">{depense.mode}</td>
      <td className="p-3 text-right font-medium">{fmt(depense.montant)}</td>
      <td className="p-3 text-right whitespace-nowrap">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-slate-600 hover:underline mr-3"
        >
          Modifier
        </button>
        <form action={suppressionAction} className="inline">
          <input type="hidden" name="depenseId" value={depense.id} />
          <input type="hidden" name="chantierId" value={chantierId} />
          <ConfirmButton
            confirmMessage="Supprimer cette dépense ?"
            className="text-xs text-red-600 hover:underline"
          >
            Supprimer
          </ConfirmButton>
        </form>
      </td>
    </tr>
  );
}
