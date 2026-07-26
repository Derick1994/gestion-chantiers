"use client";

import { useActionState, useRef, useEffect } from "react";
import { ajouterDepense } from "@/app/depenses/actions";

const initialState = { error: null };

export default function AjouterDepenseForm({ chantierId, categoriesParType, today }) {
  const [state, formAction, pending] = useActionState(ajouterDepense, initialState);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="font-medium mb-3">Ajouter une dépense</h2>
      <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="chantierId" value={chantierId} />

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="date">
            Date *
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={today}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="categorieId">
            Catégorie *
          </label>
          <select
            id="categorieId"
            name="categorieId"
            required
            defaultValue=""
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="" disabled>
              Choisir…
            </option>
            {categoriesParType.map((g) => (
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
          <label className="block text-sm font-medium mb-1" htmlFor="description">
            Description
          </label>
          <input
            id="description"
            name="description"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            placeholder="Ex : 50 sacs de ciment"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="montant">
            Montant (FCFA) *
          </label>
          <input
            id="montant"
            name="montant"
            type="number"
            min="1"
            step="1"
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="beneficiaire">
            Bénéficiaire
          </label>
          <input
            id="beneficiaire"
            name="beneficiaire"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            placeholder="Ex : Chef Kodjo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="mode">
            Mode de paiement
          </label>
          <select
            id="mode"
            name="mode"
            defaultValue="Espèces"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option>Espèces</option>
            <option>Virement</option>
            <option>Mobile Money</option>
            <option>Chèque</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="reference">
            Référence pièce justificative
          </label>
          <input
            id="reference"
            name="reference"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            placeholder="Facultatif"
          />
        </div>

        {state?.error && (
          <p className="sm:col-span-2 text-sm text-red-600">{state.error}</p>
        )}

        <div className="sm:col-span-2 flex justify-end pt-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {pending ? "Enregistrement…" : "Enregistrer la dépense"}
          </button>
        </div>
      </form>
    </div>
  );
}
