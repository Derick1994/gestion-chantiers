"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { enregistrerMouvement } from "./actions";

const initialState = { error: null };

const TYPES = [
  { value: "ENTREE", label: "Entrée de fonds" },
  { value: "DOTATION", label: "Dotation à un chantier" },
  { value: "RETOUR", label: "Retour d'un chantier" },
  { value: "SORTIE_EXTERNE", label: "Sortie externe" },
  { value: "DEPENSE_GENERALE", label: "Dépense générale" },
];

export default function MouvementForm({ chantiers, today }) {
  const [type, setType] = useState("ENTREE");
  const [state, formAction, pending] = useActionState(enregistrerMouvement, initialState);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setType("ENTREE");
    }
  }, [state]);

  const besoinChantier = type === "DOTATION" || type === "RETOUR";
  const besoinBeneficiaire = type === "SORTIE_EXTERNE" || type === "DEPENSE_GENERALE";

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-3 sm:grid-cols-2 rounded-lg border border-slate-200 bg-white p-4"
    >
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium mb-1" htmlFor="type">
          Type de mouvement *
        </label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {besoinChantier && (
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1" htmlFor="chantierId">
            Chantier *
          </label>
          <select
            id="chantierId"
            name="chantierId"
            required
            defaultValue=""
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            <option value="" disabled>
              Choisir…
            </option>
            {chantiers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>
      )}

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

      {besoinBeneficiaire && (
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1" htmlFor="beneficiaire">
            Bénéficiaire
          </label>
          <input
            id="beneficiaire"
            name="beneficiaire"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            placeholder="Ex : Propriétaire, fournisseur…"
          />
        </div>
      )}

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium mb-1" htmlFor="note">
          Note
        </label>
        <input
          id="note"
          name="note"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          placeholder="Facultatif"
        />
      </div>

      {state?.error && <p className="sm:col-span-2 text-sm text-red-600">{state.error}</p>}

      <div className="sm:col-span-2 flex justify-end">
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
