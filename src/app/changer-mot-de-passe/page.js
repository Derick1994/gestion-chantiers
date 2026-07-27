"use client";

import { useActionState } from "react";
import { changerMotDePasse } from "./actions";

const initialState = { error: null };

export default function ChangerMotDePassePage() {
  const [state, formAction, pending] = useActionState(changerMotDePasse, initialState);

  return (
    <div className="mx-auto max-w-sm mt-10">
      <h1 className="text-xl font-semibold mb-2 text-center">Changer le mot de passe</h1>
      {!state?.success && (
        <p className="text-sm text-slate-500 mb-6 text-center">
          Pour des raisons de sécurité, vous devez choisir un nouveau mot de passe.
        </p>
      )}

      {state?.success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center space-y-3">
          <p className="text-sm text-emerald-700">Mot de passe changé avec succès.</p>
          <a
            href="/chantiers"
            className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Continuer
          </a>
        </div>
      ) : (
        <form
          action={formAction}
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-6"
        >
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="motDePasseActuel">
              Mot de passe actuel
            </label>
            <input
              id="motDePasseActuel"
              name="motDePasseActuel"
              type="password"
              required
              autoFocus
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="nouveauMotDePasse">
              Nouveau mot de passe
            </label>
            <input
              id="nouveauMotDePasse"
              name="nouveauMotDePasse"
              type="password"
              required
              minLength={8}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">Au moins 8 caractères.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="confirmation">
              Confirmer le nouveau mot de passe
            </label>
            <input
              id="confirmation"
              name="confirmation"
              type="password"
              required
              minLength={8}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </div>

          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {pending ? "Enregistrement…" : "Changer le mot de passe"}
          </button>
        </form>
      )}
    </div>
  );
}
