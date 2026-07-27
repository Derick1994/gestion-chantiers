"use client";

import {
  archiverChantier,
  reactiverChantier,
  supprimerDefinitivementChantier,
} from "../actions";
import ConfirmButton from "@/components/ConfirmButton";

export default function ChantierDangerZone({ chantier, isAdmin }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      {chantier.archive ? (
        <>
          <form action={reactiverChantier.bind(null, chantier.id)}>
            <ConfirmButton
              confirmMessage="Réactiver ce chantier ? Il réapparaîtra dans la liste principale."
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-100"
            >
              Réactiver
            </ConfirmButton>
          </form>
          {isAdmin && (
            <form action={supprimerDefinitivementChantier.bind(null, chantier.id)}>
              <ConfirmButton
                confirmMessage="Supprimer DÉFINITIVEMENT ce chantier et toutes ses dépenses ? Cette action est irréversible et ne peut pas être annulée."
                className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Supprimer définitivement
              </ConfirmButton>
            </form>
          )}
        </>
      ) : (
        <form action={archiverChantier.bind(null, chantier.id)}>
          <ConfirmButton
            confirmMessage="Archiver ce chantier ? Il disparaîtra de la liste principale mais restera consultable dans les archives."
            className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            Archiver le chantier
          </ConfirmButton>
        </form>
      )}
    </div>
  );
}
