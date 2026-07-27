import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md mt-16 text-center space-y-4">
      <h1 className="text-lg font-semibold">Page introuvable</h1>
      <p className="text-sm text-slate-600">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/chantiers"
        className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Retour aux chantiers
      </Link>
    </div>
  );
}
