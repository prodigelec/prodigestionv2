import Link from "next/link";
import { Suspense } from "react";
import { PlusCircle, FileText } from "lucide-react";
import { getDevisList } from "@/features/devis/actions/devis-actions";
import { DevisList } from "@/features/devis/components/devis-list";

export const metadata = {
  title: "Devis - ProdiGestion",
  description: "Gérez vos devis",
};

export default async function DevisPage() {
  const result = await getDevisList();
  
  if (result.error) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-3">
          <p className="font-medium">{result.error}</p>
        </div>
      </div>
    );
  }

  const devis = result.data || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              Devis
              <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary border border-primary/20">
                {devis.length}
              </span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos propositions commerciales
            </p>
          </div>
        </div>

        <Link
          href="/devis/nouveau"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          Nouveau devis
        </Link>
      </div>

      {/* Liste des devis */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <DevisList devis={devis} />
      </Suspense>
    </div>
  );
}
