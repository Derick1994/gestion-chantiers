export function construireFiltreDepenses(searchParams) {
  const chantierId = searchParams.get("chantierId") || "";
  const categorieId = searchParams.get("categorieId") || "";
  const beneficiaire = (searchParams.get("beneficiaire") || "").trim();
  const debut = searchParams.get("debut") || "";
  const fin = searchParams.get("fin") || "";

  const where = {};
  if (chantierId) where.chantierId = chantierId;
  if (categorieId) where.categorieId = categorieId;
  if (beneficiaire) where.beneficiaire = { contains: beneficiaire };
  if (debut || fin) {
    where.date = {};
    if (debut) where.date.gte = debut;
    if (fin) where.date.lte = fin;
  }
  return where;
}
