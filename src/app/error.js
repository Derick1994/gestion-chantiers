"use client";

export default function Error({ error, reset }) {
  return (
    <div className="mx-auto max-w-md mt-16 text-center space-y-4">
      <h1 className="text-lg font-semibold">Une erreur est survenue</h1>
      <p className="text-sm text-slate-600">
        Quelque chose s&apos;est mal passé. Vous pouvez réessayer, ou revenir à la
        liste des chantiers.
      </p>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => reset()}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Réessayer
        </button>
        <a
          href="/chantiers"
          className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Retour aux chantiers
        </a>
      </div>
    </div>
  );
}
