"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { creerCategorie } from "./actions";

const initialState = { error: null };
const TYPES = ["Main-d'œuvre", "Matériaux", "Transport", "Location", "Divers"];

export default function CreerCategorieForm() {
  const [ouvert, setOuvert] = useState(false);
  const [state, formAction, pending] = useActionState(creerCategorie, initialState);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      setOuvert(false);
    }
  }, [state]);

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        + Nouvelle catégorie
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-3 sm:grid-cols-2 rounded-lg border border-slate-200 bg-white p-4"
    >
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="libelle">
          Libellé *
        </label>
        <input
          id="libelle"
          name="libelle"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="type">
          Type *
        </label>
        <select
          id="type"
          name="type"
          required
          defaultValue=""
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="" disabled>
            Choisir…
          </option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {state?.error && <p className="sm:col-span-2 text-sm text-red-600">{state.error}</p>}

      <div className="sm:col-span-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? "Création…" : "Créer"}
        </button>
      </div>
    </form>
  );
}
