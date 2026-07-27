export const MONTANT_MAX = 10_000_000_000; // 10 milliards FCFA
export const TEXTE_MAX = 200;
export const MODES_PAIEMENT = ["Espèces", "Virement", "Mobile Money", "Chèque"];

export function dateEstPlausible(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [annee] = dateStr.split("-").map(Number);
  const anneeMax = new Date().getFullYear() + 1;
  return annee >= 2000 && annee <= anneeMax;
}

export function montantEstValide(montant) {
  return Number.isInteger(montant) && montant > 0 && montant <= MONTANT_MAX;
}

export function budgetEstValide(budget) {
  return Number.isInteger(budget) && budget >= 0 && budget <= MONTANT_MAX;
}
