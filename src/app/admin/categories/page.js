import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import CreerCategorieForm from "./CreerCategorieForm";
import CategorieRow from "./CategorieRow";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requireAdmin();

  const categories = await prisma.categorie.findMany({
    orderBy: [{ type: "asc" }, { ordre: "asc" }],
    include: { _count: { select: { depenses: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Catégories</h1>

      <CreerCategorieForm />

      <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="p-3 font-medium">Libellé</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Statut</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <CategorieRow key={c.id} categorie={c} nbDepenses={c._count.depenses} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
