export function fmt(n) {
  return Math.round(n || 0).toLocaleString("fr-FR") + " FCFA";
}

export function fmtDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
